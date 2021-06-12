const checkCreateDetails = async (req, res, next) => {
    if (!req.body.title) {
        res.status(400).send({
            message: 'Incomplete data'
        })
        return
    }

    if (!req.body.description) {
        res.status(400).send({
            message: 'Incomplete data'
        })
        return
    }
    next()
}

const checkFindAllDetails = async (req, res, next) => {
    const { userId } = req.params

    console.log('USER ID ', userId)
    console.log('REQ USER ID ', req.userId)

    let isOwner = false
    if (userId === req.userId) {
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
    const { postId } = req.params

    const post = await req.db.Post.findById(postId)

    if (post._id.toString() === postId) {
        isOwner = true
    }

    if (!isOwner) {
        return res.status(401).send({
            message: 'Unauthorized'
        })
    }

    if (Object.keys(req.body) <= 0) {
        return res.status(400).send({
            message: 'Incomplete data'
        })
    }

    next()
}

const checkDeleteDetails = async (req, res, next) => {
    let isOwner = false
    const { postId } = req.params

    const post = await req.db.Post.findById(postId)

    if (post._id.toString() === postId) {
        isOwner = true
    }

    if (!isOwner) {
        return res.status(401).send({
            message: 'Unauthorized'
        })
    }

    next()
}

const checkDeleteAllDetails = async (req, res, next) => {
    const { userId } = req.params

    let isOwner = false
    if (userId === req.userId) {
        isOwner = true
    }

    if (!isOwner) {
        return res.status(401).send({
            message: 'Unauthorized'
        })
    }

    next()
}

const postValidator = {
    checkCreateDetails,
    checkFindAllDetails,
    checkUpdateDetails,
    checkDeleteDetails,
    checkDeleteAllDetails
}

module.exports = postValidator
