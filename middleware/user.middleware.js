const { isEmail } = require('validator')

const checkFindUserDetails = async (req, res, next) => {
    const { userId } = req.params

    let isOwner = false
    if (userId === req.user._id) {
        isOwner = true
    }

    if (!isOwner) {
        return res.status(401).send({
            message: 'Unauthorized'
        })
    }

    next()
}

const checkUpdateDetails = async (req, res, next) => {
    let isOwner = false
    const { userId } = req.params

    if (userId === req.user._id) {
        isOwner = true
    }

    if (!isOwner) {
        return res.status(401).send({
            message: 'Unauthorized'
        })
    }

    if (Object.keys(req.body) <= 0) {
        console.log(req.body)
        return res.status(400).send({
            message: 'Incomplete data'
        })
    }

    next()
}

const checkLoginDetails = async (req, res, next) => {
    if (!req.body.username) {
        res.status(400).send({
            message: 'Incomplete data'
        })
        return
    }

    if (!req.body.password) {
        res.status(400).send({
            message: 'Incomplete data'
        })
        return
    }
    next()
}

const checkRegisterDetails = async (req, res, next) => {
    if (!req.body.username) {
        res.status(400).send({
            message: 'Incomplete data'
        })
        return
    }

    if (!req.body.email) {
        res.status(400).send({
            message: 'Incomplete data'
        })
        return
    }

    if (!isEmail(req.body.email)) {
        res.status(400).send({
            message: 'Invalid data'
        })
        return
    }

    if (!req.body.password) {
        res.status(400).send({
            message: 'Incomplete data'
        })
        return
    }

    if (req.body.password.length < 4) {
        res.status(400).send({
            message: 'Invalid data'
        })
        return
    }
    next()
}

const checkUserExist = async (req, res, next) => {
    await req.db.User.findOne({
        username: req.body.username
    }).exec(async (err, user) => {
        if (err) {
            res.status(500).send({
                message: err
            })
            return
        }

        if (user) {
            res.status(400).send({
                message: 'Username already in use'
            })
            return
        }

        await req.db.User.findOne({
            email: req.body.email
        }).exec((err, user) => {
            if (err) {
                res.status(500).send({
                    message: err
                })
                return
            }

            if (user) {
                res.status(404).send({
                    message: 'Email already in use'
                })
                return
            }

            next()
        })
    })
}

const checkRolesExist = async (req, res, next) => {
    let role = req.body.role

    if (role) {
        if (!(typeof role === 'string')) {
            res.status(400).send({
                message: `Invalid data`
            })
            return
        }

        if (!req.db.ROLES.includes(role.toLowerCase())) {
            res.status(404).send({
                message: `Invalid role`
            })
            return
        }

        req.body.role = role
    }
    next()
}

const checkEmailExist = async (req, res, next) => {
    const { email, username } = req.body

    if (email) {
        await req.db.User.findOne({ email }).exec(async (err, user) => {
            if (err) {
                res.status(404).send({
                    message: err
                })
                return
            }

            if (!user) {
                res.status(404).send({
                    message: 'An error occurred'
                })
                return
            }

            next()
        })
    }

    if (email) {
        return
    }

    await req.db.User.findOne({ username }).exec(async (err, user) => {
        if (err) {
            res.status(404).send({
                message: err
            })
            return
        }

        if (!user) {
            res.status(404).send({
                message: 'An error occurred'
            })
            return
        }

        next()
    })
}

const userValidator = {
    checkUserExist,
    checkRolesExist,
    checkUpdateDetails,
    checkLoginDetails,
    checkRegisterDetails,
    checkFindUserDetails,
    checkEmailExist
}

module.exports = userValidator
