const sgMail = require('@sendgrid/mail')
// const sendgridAPIKEY = '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'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from:'adityanair006@gmail.com',
        subject:'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get along with this app.`,
        html:'<h1> Welcome<h1>'
    })
}

const sendCancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from:'adityanair006@gmail.com',
        subject:'Sorry to see you leave!',
        text: `We are sorry to hear you are leaving ${name}. Please do let us know what we could have done better. `
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}