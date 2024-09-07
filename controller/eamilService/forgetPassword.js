const asyncHandler = require('express-async-handler');
const sendEmailService = require('../../util/emailUtil');
const mysqlconnection = require("../../config/mysqlConfig");
const bcrypt = require('bcrypt');

const sendEmailPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    // Fetch user based on email
    const [userRow] = await mysqlconnection.query(`
        SELECT * FROM Users WHERE email = ?
    `, [email]);

    if (userRow.length === 0) {
        res.status(404);
        throw new Error("User not found!");
    }

    const user = userRow[0];

    // Send password reset email
    const send = await sendEmailService({
        emailType: "FORGETPASSWORD",
        email:user.email,
        user_id: user.user_id,
        messageTitle: null,
        message: null
    });

    if (!send) {
        res.status(500);
        throw new Error("Failed to send password reset email.");
    }

    res.status(200).json({
        title: "Password reset email sent successfully",
        message: send
    });
});

const forgetPassword = asyncHandler(async (req, res) => {
    const { newPassword } = req.body;

    if (!newPassword) {
        res.status(400);
        throw new Error("Password must not be empty!");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const urlToken = req.query.token;

    // Fetch the record based on the token
    const [tokenRecord] = await mysqlconnection.query(`
        SELECT * FROM EmailVerifyAndForgetPassword
        WHERE forget_passwd_verify_token = ? AND verifyTokenExpiry > NOW()
    `, [urlToken]);

    if (tokenRecord.length === 0) {
        res.status(400);
        throw new Error("Token is invalid or expired.");
    }

    const record = tokenRecord[0];

    await mysqlconnection.query(`
        UPDATE Users
        SET password = ?
        WHERE user_id = ?
    `, [hashedPassword, record.user_id]);

    // Clear the token record
    await mysqlconnection.query(`
        UPDATE EmailVerifyAndForgetPassword
        SET forget_passwd_verify_token = NULL, verifyTokenExpiry = NULL
        WHERE user_id = ?
    `, [record.user_id]);

    res.status(200).json({
        message: "Password updated successfully",
    });
});

module.exports = { sendEmailPassword, forgetPassword };
