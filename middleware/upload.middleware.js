const path = require('path')
const multer = require('multer')
const maxSize = 10 * 1024 * 1025

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname + '../../public/assets/'))
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname.toLowerCase())
    }
})

let upload = multer({
    storage: storage,
    limits: { fileSize: maxSize }
}).single('file')

const uploadFile = async (req, res) => {
    upload(req, res, err => {
        if (err) {
            if (err.code == 'LIMIT_FILE_SIZE') {
                return res.status(400).send({
                    message: 'File size cannot be larger than 10MB!'
                })
            }
            res.status(500).send({
                message: err
            })
            return
        }
        res.status(201).send(req.file)
    })
}

module.exports = uploadFile
