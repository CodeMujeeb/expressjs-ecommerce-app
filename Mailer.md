# Install Nodemailer
- npm i --save nodemailer 
- Sendgrid (3P email service): npm i --save nodemailer-sendgrid-transport 
  
# Sending emails
- const nodemailer = require('nodemailer')
- const sendGridTransport = require('nodemailer-sendgrid-transport')
- const transporter = nodemailer.createTransport(sendGridTransport({
    auth: {
        api_key: 'YOUR_SENDGRID_API_KEY'
    }
}))
- transporter.sendMail({
    to: email,
    from: 'shop@ecommerce.com',
    subject: 'Welcome',
    html: '<h1>Welcome</h1>'
 });

don't use directly this approach to block execution of code so we should use server side scripts running for sending emails or some thing like Queues processing.