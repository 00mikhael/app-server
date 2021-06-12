const db = require('../models')
const dbUrl = process.env.MONGODB_URL

exports.connectToDatabase = async () => {
    await db.mongoose
        .connect(dbUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true,
            autoIndex: true
        })
        .then(() => {
            console.log(`Connected to base-server database!`)
            initializeDatabase(db.Role)
            return true
        })
        .catch(e => {
            console.log(`Unable to connect to database, error: `, e.message)
            process.exit()
        })
}

const initializeDatabase = Role => {
    Role.estimatedDocumentCount((err, count) => {
        if (!err && count <= 0) {
            new Role({
                name: 'admin'
            }).save(err => {
                if (err) {
                    console.log('Error: ', err.message)
                }
            })

            new Role({
                name: 'user'
            }).save(err => {
                if (err) {
                    console.log('Error: ', err.message)
                }
            })
        }
    })
}
