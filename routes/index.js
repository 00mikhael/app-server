const indexRouter = require('./index.routes')
const adminRouter = require('./admin.routes')
const userRouter = require('./user.routes')
const postRouter = require('./post.routes')
const fileRouter = require('./file.routes')

module.exports = {
    indexRouter,
    adminRouter,
    userRouter,
    postRouter,
    fileRouter
}
