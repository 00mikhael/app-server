const isAdmin = async (req, res, next) => {
    await req.db.User.findById(req.user._id).exec(async (err, user) => {
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
    isAdmin,
    denyAccess
}

module.exports = auth
