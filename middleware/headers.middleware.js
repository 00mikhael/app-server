const headers = async (req, res, next) => {
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, User-Agent, Content-Type, Accept refreshToken'
    )
    next()
}

module.exports = headers
