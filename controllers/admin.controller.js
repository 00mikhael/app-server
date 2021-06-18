const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const sendEmail = require('../utils/email/sendEmail')

const jwtSecret = process.env.JWT_SECRET
const jwtExp = Number(process.env.JWT_EXP)
const jwtRefreshExp = Number(process.env.JWT_REFRESH_EXP)
const bcryptSalt = Number(process.env.BCRYPT_SALT)

exports.register = async (req, res) => {
    const user = new req.db.User({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, bcryptSalt)
    })

    await user.save(async (err, user) => {
        if (err) {
            res.status(500).send({ message: err })
            return
        }

        if (req.body.role) {
            await req.db.Role.findOne(
                {
                    name: req.body.role
                },
                async (err, role) => {
                    if (err) {
                        res.status(500).send({ message: err })
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
        } else {
            await req.db.Role.findOne(
                {
                    name: 'admin'
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
        }
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
                    message: 'User not found!'
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

            if (!(user.role.name === 'admin')) {
                res.status(401).send({
                    message: 'Access denied'
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
                sameSite: 'None'
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
            return
        })
}

exports.findAll = async (req, res) => {
    await req.db.User.find({}, '-password -__v')
        .then(users => {
            if (!users) {
                res.status(404).send({
                    message: `Users not found`
                })
            } else {
                res.status(200).send({
                    users
                })
            }
        })
        .catch(err => {
            res.status(500).send({
                message: err
            })
        })
}
