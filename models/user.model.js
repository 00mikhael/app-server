const mongoose = require('mongoose')

const bcryptSalt = Number(process.env.BCRYPT_SALT)

module.exports = (() => {
    const userSchema = mongoose.Schema(
        {
            username: {
                type: String,
                required: true
            },
            email: {
                type: String,
                required: true
            },
            password: {
                type: String,
                required: true
            },
            favoritePosts: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Post'
                }
            ],
            role: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Role'
            }
        },
        { timestamps: true }
    )

    if (this.isModified) {
        userSchema.pre('save', async next => {
            if (!this.isModified('password')) {
                next()
                return
            }

            const hash = await bcrypt.hash(this.password, bcryptSalt)
            this.password = hash
            next()
        })
    }

    const User = mongoose.model('User', userSchema)

    return User
})()
