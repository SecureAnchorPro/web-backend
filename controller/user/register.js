const mysqlconnection = require('../../config/mysqlConfig');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const { generateKey, generateIV } = require("../../util/key&ivGenerator");
const { encryptData } = require("../../util/encrypt&decrypt");

const userRegister = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error("All fields are mandatory!");
    }

    let connection;
    try {
        // Get a connection from the pool
        connection = await mysqlconnection.getConnection();

        // Start a transaction
        await connection.beginTransaction();

        const [userExists] = await connection.query(`
            SELECT * FROM Users WHERE email = ?
        `, [email]);

        if (userExists.length > 0) {
            res.status(400);
            throw new Error("This email is already taken!");
        }

        // Hash the password
        const hashPassword = await bcrypt.hash(password, 10);
        const [newuser] = await connection.query(`
            INSERT INTO Users (name, email, password) VALUES (?, ?, ?)
        `, [name, email, hashPassword]);

        const [emailCredentialData] = await connection.query(`
            INSERT INTO EmailVerifyAndForgetPassword (user_id) VALUES(?) 
        `, [newuser.insertId]);

        // Generate AES key and IV
        const key = generateKey(password);
        const iv = generateIV();

        // Master key and IV
        const masterKey = process.env.MASTER_CRYPTO_SECRET_KEY;
        const masterIV = process.env.MASTER_CRYPTO_SECRET_IV;

        // Encrypt key and IV (raw buffers)
        const encryptKey = encryptData(key.toString('hex'), masterKey, masterIV);
        const encryptIv = encryptData(iv.toString('hex'), masterKey, masterIV);

        // Store encrypted key and IV in the database (as buffer data)
        const [AesCredentialData] = await connection.query(`
            INSERT INTO AesCredential(aes_key, aes_iv, user_id) VALUES (?, ?, ?)
        `, [encryptKey, encryptIv, newuser.insertId]);

        // If all operations are successful, commit the transaction
        await connection.commit();

        res.status(201).json({
            user_id: newuser.insertId,
            name: name,
            email: email,
        });

    } catch (error) {
        // If any error occurs, rollback the transaction
        if (connection) await connection.rollback();
        res.status(500);
        throw new Error(error.message || "Internal Server Error");
    } finally {
        // Release the connection back to the pool
        if (connection) connection.release();
    }
});

module.exports = userRegister;
