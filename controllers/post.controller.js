const getPagination = (page, size) => {
    const limit = size ? +size : 10
    const offset = page ? page * limit : 0
    return {
        limit,
        offset
    }
}

exports.create = async (req, res) => {
    const post = new req.db.Post({
        creator_id: req.user._id,
        creator_name: req.body.creator_name || req.user.username,
        title: req.body.title,
        description: req.body.description,
        favorites: [],
        published: req.body.published ? req.body.published : false
    })

    await post
        .save()
        .then(data => {
            res.status(201).send(data)
        })
        .catch(err => {
            console.log(err.message)
            res.status(500).send({
                message: err
            })
        })
}

exports.findAllPublished = async (req, res) => {
    const { page, size, title } = req.query
    const { limit, offset } = getPagination(page, size)
    const condition = title
        ? {
              title: {
                  $regex: new RegExp(title),
                  $options: 'i'
              },
              published: true
          }
        : {
              published: true
          }

    await req.db.Post.paginate(condition, {
        offset,
        limit,
        sort: { createdAt: -1 }
    })
        .then(data => {
            res.status(200).send({
                totalItems: data.totalDocs,
                totalPages: data.totalPages,
                currentPage: data.page - 1,
                posts: data.docs
            })
        })
        .catch(err => {
            res.status(500).send({
                message: err
            })
        })
}

exports.findAllByUser = async (req, res) => {
    const { userId } = req.params
    const { page, size } = req.query
    const { limit, offset } = getPagination(page, size)

    await req.db.Post.paginate(
        {
            creator_id: userId || req.user._id
        },
        {
            offset,
            limit,
            sort: { createdAt: -1 }
        }
    )
        .then(data => {
            res.status(200).send({
                totalItems: data.totalDocs,
                totalPages: data.totalPages,
                currentPage: data.page - 1,
                posts: data.docs
            })
        })
        .catch(err => {
            res.status(500).send({
                message: err
            })
        })
}

exports.findOne = async (req, res) => {
    const { postId } = req.params

    await req.db.Post.findById(postId)
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Not Found`
                })
            } else {
                res.status(200).send(data)
            }
        })
        .catch(err => {
            res.status(500).send({
                message: err
            })
        })
}

exports.update = async (req, res) => {
    const { postId } = req.params

    await req.db.Post.findByIdAndUpdate(postId, req.body, {
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
                    post: data
                })
            }
        })
        .catch(err => {
            res.status(500).send({
                message: err
            })
        })
}

exports.delete = async (req, res) => {
    const { postId } = req.params

    await req.db.Post.findByIdAndRemove(postId)
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Not found`
                })
            } else {
                res.status(200).send({
                    message: 'Item deleted successfully',
                    post: data
                })
            }
        })
        .catch(err => {
            res.status(500).send({
                message: err
            })
        })
}

exports.deleteAllByUser = async (req, res) => {
    const { userId } = req.params

    await req.db.Post.deleteMany({
        creator_id: userId || req.user._id
    })
        .then(async data => {
            res.status(200).send({
                message: `${data.deletedCount} items deleted successfully`
            })
        })
        .catch(err => {
            res.status(500).send({
                message: err
            })
        })
}
