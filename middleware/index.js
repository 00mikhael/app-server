const auth = require('./auth.middleware')
const database = require('./db.middleware')
const upload = require('./upload.middleware')
const headers = require('./headers.middleware')
const userValidator = require('./user.middleware')
const postValidator = require('./post.middleware')

module.exports = {
    auth,
    database,
    upload,
    headers,
    userValidator,
    postValidator
}
