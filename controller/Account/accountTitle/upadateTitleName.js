const asyncHandler = require("express-async-handler");
const mysqlconnection = require("../../../config/mysqlConfig");

const upadateTitleName = asyncHandler(async (req, res) => {
    const { titleName, act_id, category } = req.body;

    // Start a MySQL transaction
    const connection = await mysqlconnection.getConnection();
    await connection.beginTransaction();

    try {
        const [result] = await connection.query(`
            UPDATE Account SET act_title_name = ? WHERE act_id = ? AND name_of_category = ?
        `, [titleName, act_id, category]);

        if (result.affectedRows === 0) {
            await connection.rollback();
            res.status(404);
            throw new Error("Account detail not found or no changes made");
        }

        await connection.commit();
        
        res.status(200).json({
            message: "Successfully updated",
            update: result
        });
    } catch (error) {
        await connection.rollback();
        res.status(500);
        throw new Error(error.message || "Internal Server Error");
    } finally {
        connection.release();
    }
});

module.exports = upadateTitleName;
