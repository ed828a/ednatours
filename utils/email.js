const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
    // 1) create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,  
        port: process.env.EMAIL_PORT,                
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    // 2) define the email options
    const mailOptions = {
        from: process.env.EMAIL_ADDRESS, // sender address
        to: options.to, // list of receivers
        subject: options.subject, // Subject line
        text: options.message, // plain text body
        // html: 
    }
    
    // 3) actually send the email
    await transporter.sendMail(mailOptions);
    // transporter.sendMail(mailOptions, (error, info) => {
    //     if (error) {
    //         console.log(error);
    //     } else {
    //         console.log("Email sent: " + info.response);
    //     }
    // })
};

module.exports = sendEmail;