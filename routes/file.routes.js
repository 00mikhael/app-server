const router = require('express').Router()

const { auth, upload } = require('../middleware')

router.post('/upload', [auth.isAdmin], upload)

module.exports = router
