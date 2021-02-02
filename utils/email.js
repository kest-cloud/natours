const nodemailer  = require ('nodemailer');
const catchAsync = require('./catchAsync');

const sendEmail =  async options => {
    //1) Create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,  //"2525",
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }

        //Activate in gmail "less secure app" option
    });

    //2) Define the email options
    const mailOptions = {
        from: 'har4lion@yahoo.com',
        to: options.email,
        subject: options.subject,
        text: options.message,
        tls: { rejectUnauthorized: false }
        //html
    }

    //3) Actually send the email
    await transporter.sendMail(mailOptions)
};

module.exports = sendEmail;