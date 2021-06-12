const mongoose = require('mongoose')

const jwtResetExp = Number(process.env.RESET_EXP)

module.exports = (() => {
    const ResetTokenSchema = mongoose.Schema({
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        token: {
            type: String,
            required: true
        },
        expiryDate: {
            type: Date,
            default: Date.now,
            expires: jwtResetExp
        }
    })

    const ResetToken = mongoose.model('ResetToken', ResetTokenSchema)

    return ResetToken
})()
