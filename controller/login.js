require('dotenv').config();
const mysqlconnection = require('../config/mysqlConfig');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const asyncHandler = require('express-async-handler');

const UserLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error("All fields are mandatory!");
    }
    const [userFind] = await mysqlconnection.query(`
        SELECT * FROM Users WHERE email = ?
    `, [email]);

    if (userFind.length === 0) {
        res.status(400);
        throw new Error("Incorrect Email provided.");
    }

    // Compare passwords
    const isPasswordMatch = await bcrypt.compare(password, userFind[0].password);

    if (isPasswordMatch) {
        const jwtToken = jwt.sign(
            {
                user: {
                    name: userFind[0].name,
                    email: userFind[0].email,
                    id: userFind[0].user_id,
                },
            },
            process.env.TOKEN_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({
            message: "User logged in successfully",
            token: jwtToken,
        });
    } else {
        res.status(400);
        throw new Error("Incorrect password provided.");
    }
});


const currentUser = asyncHandler(async (req, res) => {
    res.status(200).json(req.user);
})

module.exports = { UserLogin, currentUser };
