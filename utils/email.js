const nodemailer = require('nodemailer');

const configEmail = async (to, url, text)  =>{
    const transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth:{
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    const options = {
        from: 'Natours <natourswebsite@gamil.com>', 
        to: to,
        subject: 'Natours Web Site',
        html: `
            <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
            <h2 style="text-align: center; text-transform: uppercase;color: teal;">Welcome to the Natours.</h2>
            
            <p> Natour Website❤️</p>
            
            <a href=${url} style="background: crimson; text-decoration: none; color: white; padding: 10px 20px; margin: 10px 0; display: inline-block;">${text}</a>
            </div>
        `,
    }
    await transporter.sendMail(options);
}

const sendMail = async (to, url, text) => {
    try {
        await configEmail(to, url, text);
    } catch (error) {
        // Xử lý lỗi tại đây
        console.error('Error sending email:', error);
        throw new Error('There was an error sending the email. Try again later!');
    }
};
module.exports = sendMail;