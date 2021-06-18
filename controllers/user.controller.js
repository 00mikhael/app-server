const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const sendEmail = require('../utils/email/sendEmail')

const { TokenExpiredError } = jwt

const jwtSecret = process.env.JWT_SECRET
const jwtExp = Number(process.env.JWT_EXP)
const jwtRefreshExp = Number(process.env.JWT_REFRESH_EXP)
const appUrl = process.env.APP_URL
const bcryptSalt = Number(process.env.BCRYPT_SALT)

exports.register = async (req, res) => {
    const user = new req.db.User({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, bcryptSalt)
    })

    await user.save(async (err, user) => {
        if (err) {
            res.status(500).send({ message: err.message })
            return
        }

        await req.db.Role.findOne(
            {
                name: 'user'
            },
            async (err, role) => {
                if (err) {
                    res.status(500).send({
                        message: err
                    })
                    return
                }

                user.role = role._id
                await user.save(err => {
                    if (err) {
                        res.status(500).send({
                            message: err
                        })
                        return
                    }

                    sendEmail(
                        user.email,
                        'Registration Successful',
                        { name: user.username },
                        './template/welcome.handlebars'
                    )
                    res.status(201).send({
                        message: 'Success',
                        ...user._doc,
                        password: ''
                    })
                    return
                })
            }
        )
    })
}

exports.login = async (req, res) => {
    const requestToken = req.cookies.refreshToken

    await req.db.User.findOne({
        username: req.body.username
    })
        .populate('role', '-__v')
        .exec(async (err, user) => {
            if (err) {
                res.status(500).send({
                    message: err
                })
                return
            }

            if (!user) {
                res.status(404).send({
                    message: 'User not found'
                })
                return
            }

            let passwordIsCorrect = bcrypt.compareSync(
                req.body.password,
                user.password
            )

            if (!passwordIsCorrect) {
                res.status(401).send({
                    message: 'Incorrect password'
                })
                return
            }

            let accessToken = await jwt.sign(
                { _id: user._id, username: user.username },
                jwtSecret,
                {
                    expiresIn: jwtExp
                }
            )

            if (requestToken) {
                await req.db.RefreshToken.findOneAndRemove({
                    refreshToken: requestToken
                })
            }

            let refreshToken = await req.db.RefreshToken.createToken(
                user._id,
                user.username,
                accessToken,
                req.db.RefreshToken
            )

            let authority = `ROLE_${user.role.name}`.toUpperCase()

            res.cookie('refreshToken', refreshToken, {
                secure: true,
                sameSite: 'none'
            })

            res.status(200).send({
                _id: user._id,
                username: user.username,
                email: user.email,
                favoritePosts: user.favoritePosts,
                role: authority,
                accessToken,
                jwtExp
            })
        })
}

exports.logout = async (req, res) => {
    const requestToken = req.cookies.refreshToken

    if (!requestToken) {
        res.status(400).send({
            message: 'Not logged in'
        })
        return
    }

    await req.db.RefreshToken.findOneAndRemove({
        refreshToken: requestToken
    })

    res.clearCookie('refreshToken')

    res.status(200).send({
        message: 'logout successful!'
    })
}

exports.getUser = async (req, res) => {
    const { userId } = req.params

    await req.db.User.findById(req.user._id, '-password -__v')
        .populate('role', '-__v')
        .then(user => {
            if (!user) {
                res.status(404).send({
                    message: `User not found`
                })
            } else {
                let authority = `ROLE_${user.role.name}`.toUpperCase()

                res.status(200).send({
                    ...user._doc,
                    role: authority
                })
            }
        })
        .catch(err => {
            res.status(500).send({
                message: err
            })
        })
}

exports.updateUser = async (req, res) => {
    const { userId } = req.params

    await req.db.User.findByIdAndUpdate(userId, req.body, {
        new: true
    })
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Not Found`
                })
            } else {
                res.status(200).send({
                    message: 'Item updated successfully',
                    user: { ...data._doc, password: '' }
                })
            }
        })
        .catch(err => {
            console.log(err.message)
            res.status(500).send({
                message: err.message
            })
        })
}

exports.deleteUser = async (req, res) => {
    const { userId } = req.params

    await req.db.User.findByIdAndRemove(userId)
        .then(user => {
            if (!user) {
                res.status(404).send({
                    message: `Not found`
                })
            } else {
                res.status(200).send({
                    message: 'User deleted successfully',
                    post: user
                })
            }
        })
        .catch(err => {
            res.status(500).send({
                message: err
            })
        })
}

exports.refreshToken = async (req, res) => {
    const requestToken = req.cookies.refreshToken

    if (!requestToken) {
        res.status(403).send({
            message: 'Refresh token is required'
        })
        return
    }

    const tokenObj = await req.db.RefreshToken.findOne({
        refreshToken: requestToken
    })

    if (!tokenObj) {
        res.status(403).send({
            message: 'Refresh token expired or does not exist'
        })
        return
    }

    let toSendToken = false
    await jwt.verify(tokenObj.accessToken, jwtSecret, async (err, decoded) => {
        if (err) {
            if (!(err instanceof TokenExpiredError)) {
                await req.db.RefreshToken.deleteMany({
                    accessToken: tokenObj.accessToken
                })
                res.status(401).send({
                    message: 'Unauthorized access, login'
                })
                return
            }
        }

        // if (decoded) {
        //     await req.db.RefreshToken.deleteMany({
        //         accessToken: tokenObj.accessToken
        //     })
        //     res.status(401).send({
        //         message: 'Unauthorized access, login'
        //     })
        //     return
        // }
        toSendToken = true
    })

    if (toSendToken) {
        const newAccessToken = await jwt.sign(
            { _id: tokenObj.userId, username: tokenObj.username },
            jwtSecret,
            { expiresIn: jwtExp }
        )

        req.db.RefreshToken.findByIdAndUpdate(
            tokenObj._id,
            { accessToken: newAccessToken },
            {
                useFindAndModify: false
            }
        ).exec()

        res.status(200).send({
            accessToken: newAccessToken,
            jwtExp
        })
    }
}

exports.forgotPassword = async (req, res) => {
    const { email } = req.body

    const user = await req.db.User.findOne({ email })

    if (!user) {
        res.status(404).send({
            message: 'User not found'
        })
        return
    }

    let resetToken = await req.db.ResetToken.findOne({ userId: user._id })
    if (resetToken) await resetToken.deleteOne()
    resetToken = crypto.randomBytes(32).toString('hex')
    const hash = await bcrypt.hash(resetToken, bcryptSalt)

    await new req.db.ResetToken({
        userId: user._id,
        token: hash,
        createdAt: Date.now()
    }).save()
    const resetLink = `${appUrl}/users/resetPassword?resetToken=${resetToken}&id=${user._id}`
    const cancelResetLink = `${appUrl}/users/cancelPasswordReset?resetToken=${resetToken}&id=${user._id}`
    sendEmail(
        user.email,
        'Password Reset Request',
        {
            name: user.username,
            resetLink,
            cancelResetLink
        },
        './template/forgotPassword.handlebars'
    )

    res.status(200).send({
        resetLink,
        cancelResetLink
    })
}

exports.cancelPasswordReset = async (req, res) => {
    const { id } = req.query

    let passwordResetToken = await req.db.ResetToken.findOne({ userId: id })

    if (!passwordResetToken) {
        res.status(401).send({
            message: 'Invalid or expired token'
        })
        return
    }

    await passwordResetToken.deleteOne()
    res.status(200).send({
        message: 'Password reset canceled'
    })

    return
}

exports.resetPassword = async (req, res) => {
    const { resetToken, id } = req.query
    const { password } = req.body

    let passwordResetToken = await req.db.ResetToken.findOne({ userId: id })

    if (!passwordResetToken) {
        res.status(401).send({
            message: 'Invalid or expired token'
        })
        return
    }

    const isValid = await bcrypt.compare(resetToken, passwordResetToken.token)

    if (!isValid) {
        res.status(401).send({
            message: 'Invalid or expired token'
        })
        return
    }

    if (!password) {
        res.status(401).send({
            message: 'Invalid or no password'
        })
        return
    }

    const hash = await bcrypt.hash(password, bcryptSalt)

    await req.db.User.updateOne(
        { _id: id },
        { $set: { password: hash } },
        { new: true }
    )

    const user = await req.db.User.findById({ _id: id })
    sendEmail(
        user.email,
        'Password Reset Successfully',
        { name: user.username },
        './template/resetPassword.handlebars'
    )

    await passwordResetToken.deleteOne()

    res.status(200).send({
        message: 'Password Reset Successfully'
    })
}
