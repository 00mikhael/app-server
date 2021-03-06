require('dotenv').config()
const express = require('express')
const logger = require('morgan')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const jwt = require('express-jwt')
const { connectToDatabase } = require('./config/db.config')

const jwtSecret = process.env.JWT_SECRET
const appUrl = process.env.APP_URL
const app = express()

const {
    indexRouter,
    adminRouter,
    userRouter,
    postRouter,
    fileRouter
} = require('./routes')

const db = async _ => {
    await connectToDatabase()
}
db()

app.use(
    cors({
        origin: appUrl
    })
)

app.use(logger(`${app.get('env') === 'production' ? 'combined' : 'dev'}`))
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))
app.use(
    jwt({
        secret: jwtSecret,
        algorithms: ['HS256'],
        credentialsRequired: false,
        getToken: function fromHeaderOrQuerystring(req) {
            if (
                req.headers.authorization &&
                req.headers.authorization.split(' ')[0] === 'Bearer'
            ) {
                return req.headers.authorization.split(' ')[1]
            } else if (req.query && req.query.token) {
                return req.query.token
            }
            return null
        }
    }).unless({
        path: [
            { url: '/api/', method: 'GET' },
            { url: '/api/posts/:postId', method: 'GET' },
            { url: '/api/users/register', method: 'POST' },
            { url: '/api/users/login', method: 'POST' },
            { url: '/api/admin/login', method: 'POST' },
            { url: '/api/users/logout', method: 'POST' },
            { url: '/api/users/refreshToken', method: 'POST' },
            { url: '/api/users/forgotPassword', method: 'POST' },
            { url: '/api/users/resetPassword', method: 'POST' },
            { url: '/api/users/cancelPasswordReset', method: 'POST' }
        ]
    })
)

app.use('/api', indexRouter)
app.use('/api/users', userRouter)
app.use('/api/admin', adminRouter)
app.use('/api/posts', postRouter)
app.use('/api/files', fileRouter)
app.get('/', (req, res) => {
    res.redirect('/api')
})

app.use((req, res, next) => {
    let err = new Error('Not Found')
    err.status = 404
    next(err)
})

// error handler
app.use(function (err, req, res, next) {
    res.error = req.app.get('env') === 'development' ? err : {}
    res.status(err.status || 500).send({
        status: err.status,
        message: err.message
    })
})

module.exports = app
