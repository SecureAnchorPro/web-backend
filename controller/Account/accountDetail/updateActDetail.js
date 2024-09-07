const asyncHandler = require('express-async-handler');
const mysqlconnection = require("../../../config/mysqlConfig");
const { encryptData } = require("../../../util/encrypt&decrypt");
const accessKeyAndIV = require("../../../util/accesskey&iv");

const UpdateActDetail = asyncHandler(async (req, res) => {
    const { actDetail_id, email, password, link } = req.body;
    const currentUser_id = req.user;

    // Start a transaction
    const connection = await mysqlconnection.getConnection();
    await connection.beginTransaction();

    try {

        const aeskeyAndIV = await accessKeyAndIV(currentUser_id);

        const encryptPassword = encryptData(password,aeskeyAndIV.key,aeskeyAndIV.iv);
        const [result] = await connection.query(`
            UPDATE AccountDetail SET email = ?, password = ?, link_website = ? WHERE act_detail_id = ?
        `, [email, encryptPassword, link, actDetail_id]);

        // Check if the update affected any rows
        if (result.affectedRows === 0) {
            res.status(404);
            throw new Error("user not create account-detail");
        }

        // Commit the transaction if successful
        await connection.commit();
        res.status(200).json({
            message: "Successfully updated",
            update: result
        });
    } catch (error) {
        // Rollback the transaction in case of any error
        await connection.rollback();
        res.status(500);
        throw new Error(error.message || "Internal Server Error!");
    } finally {
        // Release the connection back to the pool
        connection.release();
    }
});

module.exports = UpdateActDetail;
