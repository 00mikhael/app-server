const router = require('express').Router();

const { auth, upload } = require('../middleware');


router.post('/upload', [auth.verifyToken, auth.isAdmin], upload);

module.exports = router;
