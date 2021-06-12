const headers = async (req, res, next) => {
    res.header(
        'Access-Control-Allow-Headers',
        'x-access-token, Origin, User-Agent, Content-Type, Accept'
    )
    next()
}

module.exports = headers
