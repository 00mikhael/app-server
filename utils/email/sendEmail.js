const nodemailer = require('nodemailer')
const handlebars = require('handlebars')
const fs = require('fs')
const path = require('path')

const sendEmail = async (email, subject, payload, template) => {
    const emailUser = process.env.EMAIL_USERNAME
    const emailPass = process.env.EMAIL_PASSWORD
    const fromEmail = process.env.FROM_EMAIL
    const emailHost = process.env.EMAIL_HOST

    try {
        // create reusable transporter object using the default SMTP transport
        const transporter = nodemailer.createTransport({
            host: emailHost,
            port: 465,
            auth: {
                user: emailUser,
                pass: emailPass
            }
        })

        const source = fs.readFileSync(path.join(__dirname, template), 'utf8')
        const compiledTemplate = handlebars.compile(source)
        const options = () => {
            return {
                from: fromEmail,
                to: email,
                subject: subject,
                html: compiledTemplate(payload)
            }
        }

        // Send email
        transporter.sendMail(options(), (error, info) => {
            if (error) {
                console.log(error)
                return error
            } else {
                return res.status(200).json({
                    success: true
                })
            }
        })
    } catch (error) {
        return error
    }
}

module.exports = sendEmail
