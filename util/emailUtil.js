require("dotenv").config();
const nodemailer = require('nodemailer');
const mysqlconnection = require("../config/mysqlConfig");
const bcrypt = require('bcrypt');

const sendService = async ({ emailType, email, user_id, messageTitle, message }) => {
    try {


        // Fetch user details from the database
        // const [rowdata] = await mysqlconnection.query(`
        //     SELECT * FROM Users WHERE user_id = ?
        // `, [user_id]);

        // if (rowdata.length === 0) {
        //     throw new Error("User not found!");
        // }
        // const user = rowdata[0];

        // Hash the user_id to create a token
        const hashToken = await bcrypt.hash(user_id.toString(), 10);

        const tokenColumn = emailType === "VERIFY" ? "email_verify_token" : "forget_passwd_verify_token";
        const expiryTime = emailType === "VERIFY" ? '00:15:00' : '00:15:00';

        // Insert the token and expiry time into the database
        await mysqlconnection.query(`
            INSERT INTO EmailVerifyAndForgetPassword (user_id, ${tokenColumn}, verifyTokenExpiry) 
            VALUES (?, ?, ADDTIME(NOW(), ?))
        `, [user_id, hashToken, expiryTime]);

        // Setup the email transporter
        const transport = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            // secure: process.env.SMTP_SECURE === 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            // tls: {
            //     rejectUnauthorized: false, // Allow self-signed certificates
            //     minVersion: 'TLSv1.2' // Specify minimum TLS version
            // }

        });

        // Determine the subject and body of the email
        let subject, htmlBody;

        switch (emailType) {
            case "VERIFY":
                subject = "Verify your email";
                htmlBody = `<p>Click <a href="${process.env.DOMAIN}/user/emailVerify?token=${hashToken}">here</a> to verify your email.</p>`;
                break;
            case "FORGETPASSWORD":
                subject = "Reset your Password";
                htmlBody = `<p>Click <a href="${process.env.DOMAIN}/user/forgetPassword?token=${hashToken}">here</a> to reset your password.</p>`;
                break;
            case "Offers":
                subject = messageTitle;
                htmlBody = `<h1>${messageTitle}</h1><p>${message}</p>`;
                break;
            default:
                throw new Error("Invalid email type provided.");
        }

        // Set mail options
        const mailOptions = {
            from: process.env.SMTP_FROM,
            to: email,
            subject,
            html: htmlBody
        };

        // Send the email
        const mailResponse = await transport.sendMail(mailOptions);

        console.log("Mail Sent: ", mailResponse);
        return mailResponse;

    } catch (err) {
        console.error("Error: ", err.message);
        throw new Error("Failed to process the request.");
    }
};

module.exports = sendService;
