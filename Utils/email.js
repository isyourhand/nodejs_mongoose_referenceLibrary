const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

// new Email(user,url).sendWelcome()

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `LYX <${process.env.EMAIL_FROM}>`;
    }

    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            // Sendgrid
            console.log('try to sending email with gmail...');
            return nodemailer.createTransport({
                // host: 'smtp.gmail.com',
                // port: 465,
                // secure: true, // use SSL
                service: 'gmail',
                auth: {
                    user: process.env.GEMAIL_USERNAME,
                    pass: process.env.GEMAIL_PASSWORD,
                },
            });
        }
        return nodemailer.createTransport({
            // host: 'smtp.gmail.com',
            // port: 465,
            // secure: true, // use SSL
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }

    async send(template, subject) {
        // sned the actual email

        // 1) Render HTML based on a pug template
        const html = pug.renderFile(
            `${__dirname}/../views/email/${template}.pug`,
            {
                firstName: this.firstName,
                url: this.url,
                subject,
            }
        ); // render the pug into real HTML

        // 2) Define email options

        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.convert(html),
            // html:
        };

        // 3) Create a transport and send email

        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome() {
        await this.send('welcome', ' Welcome to the Natours Family!');
    }

    async sendPasswordReset() {
        await this.send(
            'passwordReset',
            'Your password reset token (valid for only 10 minutes)'
        );
    }
};
