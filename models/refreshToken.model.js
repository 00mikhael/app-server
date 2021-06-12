const mongoose = require('mongoose')
const { v4: uuidV4 } = require('uuid')

const jwtRefreshExp = Number(process.env.JWT_REFRESH_EXP)

module.exports = (() => {
    const RefreshTokenSchema = mongoose.Schema({
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        username: {
            type: String,
            required: true
        },
        accessToken: {
            type: String,
            required: true
        },
        refreshToken: {
            type: String,
            required: true
        },
        expiryDate: {
            type: Date,
            default: Date.now,
            expires: jwtRefreshExp
        }
    })

    RefreshTokenSchema.statics.createToken = async (
        id,
        username,
        accessToken,
        Token
    ) => {
        const _token = uuidV4()

        const _object = new Token({
            userId: id,
            username,
            accessToken,
            refreshToken: _token,
            expiryDate: Date.now()
        })

        let refreshToken = await _object.save()

        return refreshToken.refreshToken
    }

    const RefreshToken = mongoose.model('RefreshToken', RefreshTokenSchema)

    return RefreshToken
})()
