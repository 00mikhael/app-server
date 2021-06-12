const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const db = {}

db.mongoose = mongoose
db.Role = require('./role.model')
db.User = require('./user.model')
db.Post = require('./post.model')
db.RefreshToken = require('./refreshToken.model')
db.ResetToken = require('./resetToken.model')
db.ROLES = ['user', 'admin']

module.exports = db
