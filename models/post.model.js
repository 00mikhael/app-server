const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')

module.exports = (() => {
    const postSchema = mongoose.Schema(
        {
            creator_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            creator_name: {
                type: String,
                trim: true,
                required: true
            },
            title: {
                type: String,
                trim: true,
                required: true
            },
            description: {
                type: String,
                trim: true
            },
            favorites: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                }
            ],
            favoritesCount: {
                type: Number
            },
            published: Boolean
        },
        { timestamps: true }
    )

    postSchema.plugin(mongoosePaginate)

    const Post = mongoose.model('Post', postSchema)

    return Post
})()
