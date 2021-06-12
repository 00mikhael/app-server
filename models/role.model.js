const mongoose = require('mongoose')

module.exports = (() => {
    const roleSchema = mongoose.Schema({
        name: {
            type: String,
            required: true
        }
    })

    const Role = mongoose.model('Role', roleSchema)

    return Role
})()
