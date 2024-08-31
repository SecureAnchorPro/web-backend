require('dotenv').config();
const mysqlconnection = require('../config/mysqlConfig');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');

const userRegister = asyncHandler(async (req, res) => {
    const { name, email, phonenumber, password } = req.body;

    if (!name || !email || !password || !phonenumber) {
        res.status(400);
        throw new Error("All fields are mandatory!");
    }

    const [userExists] = await mysqlconnection.query(`
        SELECT * FROM Users WHERE email = ?
    `, [email]);

    if (userExists.length > 0) {
        res.status(400);
        throw new Error("User is already registered!");
    }

    // Hash the password
    const hashPassword = await bcrypt.hash(password, 10);
    const [newrow] = await mysqlconnection.query(`
        INSERT INTO Users (name, email, password, phonenumber) VALUES (?, ?, ?, ?)
    `, [name, email, hashPassword, phonenumber]);
    const newuser = newrow;

    if (newuser) {
        res.status(201).json({
            user_id: newuser.insertId,
            name: name,
            email: email,
            phonenumber: phonenumber
        });
    } else {
        res.status(500);
        throw new Error("Internal Server Error");
    }
});

module.exports = userRegister;
