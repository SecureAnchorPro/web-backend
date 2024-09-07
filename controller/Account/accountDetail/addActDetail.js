const asyncHandler = require('express-async-handler');
const mysqlconnection = require('../../../config/mysqlConfig');
const { encryptData } = require("../../../util/encrypt&decrypt");
const accessKeyAndIV = require("../../../util/accesskey&iv");

const AddActDetail = asyncHandler(async (req, res) => {
    const { email, password, link, act_id } = req.body;
    const currentUser_id = req.user;


    const connection = await mysqlconnection.getConnection();
    await connection.beginTransaction();

    try {
        const [actTitlerows] = await connection.query(`
            SELECT * FROM Account WHERE act_id = ?
        `, [act_id]);

        if (actTitlerows.length === 0) {
            res.status(404);
            throw new Error("Account title not found"); 
        }

        // Access user key and iv
        const aeskeyAndIV = await accessKeyAndIV(currentUser_id);
        const encryptPassword = encryptData(password, aeskeyAndIV.key, aeskeyAndIV.iv);

        // Insert into AccountDetail
        const [result] = await connection.query(`
            INSERT INTO AccountDetail (email, password, link_website, act_id) 
            VALUES (?, ?, ?, ?)
        `, [email, encryptPassword, link, act_id]);

        if (result.affectedRows > 0) {
            await connection.commit();

            res.status(201).json({
                message: "Successfully created",
                act_detail_id: result.insertId,
                email: email,
                act_id: act_id
            });
        } else {
            throw new Error("Internal Server Error");
        }
    } catch (error) {
        // Rollback the transaction in case of an error
        await connection.rollback();
        res.status(500);
        throw new Error(error.message || "Internal Server Error!");
    } finally {
        // Release the connection back to the pool
        connection.release();
    }
});

module.exports = AddActDetail;
