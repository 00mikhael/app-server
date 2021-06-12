require('dotenv').config()
const express = require('express')
const logger = require('morgan')
const helmet = require('helmet')
const cors = require('cors')
const { connectToDatabase } = require('./config/db.config')

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
        origin: 'https://post-app-mu.vercel.app'
    })
)

app.use(helmet())
app.use(logger(`${app.get('env') === 'production' ? 'combined' : 'dev'}`))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

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
