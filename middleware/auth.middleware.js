const jwt = require('jsonwebtoken')

const { TokenExpiredError } = jwt

const jwtSecret = process.env.JWT_SECRET

const catchError = (err, res) => {
    if (err instanceof TokenExpiredError) {
        res.status(401).send({
            message: 'Access token expired'
        })
        return
    }
    res.status(401).send({ message: err })
    return
}

const verifyToken = async (req, res, next) => {
    let token = req.headers['x-access-token']

    if (!token) {
        res.status(401).send({
            message: 'Requires access token'
        })
        return
    }

    const tokenExists = await req.db.RefreshToken.findOne({
        accessToken: token
    }).exec()

    if (!tokenExists) {
        res.status(401).send({
            message: 'Token does not exist'
        })
        return
    }

    jwt.verify(token, jwtSecret, (err, decoded) => {
        if (err) {
            catchError(err, res)
            return
        }

        req.userId = decoded._id
        req.username = decoded.username
        next()
    })
}

const isAdmin = async (req, res, next) => {
    await req.db.User.findById(req.userId).exec(async (err, user) => {
        if (err) {
            res.status(500).send({
                message: err
            })
            return
        }

        if (!user) {
            res.status(401).send({
                message: 'An error occurred'
            })
            return
        }

        await req.db.Role.findOne(
            {
                _id: user.role
            },
            (err, role) => {
                if (err) {
                    res.status(500).send({
                        message: err
                    })
                    return
                }

                if (role.name === 'admin') {
                    next()
                    return
                }

                res.status(403).send({
                    message: 'Admin access required'
                })
                return
            }
        )
    })
}

const denyAccess = (req, res, next) => {
    return res.status(400).send({
        message: 'Bad Request'
    })
}

const auth = {
    verifyToken,
    isAdmin,
    denyAccess
}

module.exports = auth
