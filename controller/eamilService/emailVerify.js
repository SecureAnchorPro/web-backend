const asyncHandler = require('express-async-handler');
const sendEmailService = require('../../util/emailUtil');
const mysqlconnection = require("../../config/mysqlConfig");

const sendEmailVerify = asyncHandler(async (req, res) => {
    const currentUser_id = req.user;

    // Fetch user data from the EmailVerifyAndForgetPassword table
    const [rowdata] = await mysqlconnection.query(`
        SELECT * FROM EmailVerifyAndForgetPassword WHERE user_id = ?
    `, [currentUser_id]);

    if (rowdata.length === 0) {
        res.status(404);
        throw new Error("User not found!");
    }

    const user = rowdata[0];

    // Check if the user's email is already verified
    if (user.is_email_verified) {
        res.status(400);
        throw new Error("User's email is already verified.");
    }

    // Send the verification email
    const send = await sendEmailService({
        emailType: "VERIFY",
        email:user.email,
        user_id: currentUser_id,
        messageTitle: null,
        message: null
    });

    if (!send) {
        res.status(500);
        throw new Error("Failed to send verification email.");
    }

    res.status(200).json({
        title: "Verification email sent successfully",
        sendStatus: send
    });
});

const emailVarify = asyncHandler(async (req, res) => {
    // const urlToken = window.location.search.split("=")[1]; // fronted

    const urlToken = req.query.token;

    const [userTokens] = await mysqlconnection.query(`
        SELECT * FROM EmailVerifyAndForgetPassword
        WHERE email_verify_token = ? AND verifyTokenExpiry > NOW()
    `, [urlToken]);

    if (userTokens.length === 0) {
        res.status(400);
        throw new Error("Token is invalid or expired.");
    }

    const userToken = userTokens[0];

    await mysqlconnection.query(`
        UPDATE EmailVerifyAndForgetPassword
        SET is_email_verified = true, email_verify_token = NULL, verifyTokenExpiry = NULL
        WHERE user_id = ?
    `, [userToken.user_id]);

    res.status(200).json({
        message: "Email verified successfully",
    });
});

module.exports = { sendEmailVerify, emailVarify };
