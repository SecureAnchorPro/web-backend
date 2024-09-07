const asyncHandler = require("express-async-handler");
const mysqlconnection = require("../../../config/mysqlConfig");

const updateDoctitle = asyncHandler(async (req, res) => {
    const { docTite,document_id } = req.body;

    // Start a MySQL transaction
    const connection = await mysqlconnection.getConnection();
    await connection.beginTransaction(); // Transaction starts

    try {
        const [updateData] = await connection.query(`
            UPDATE Document SET doc_title_name = ? WHERE document_id = ?
        `, [docTite, document_id]);

        if (updateData.affectedRows === 0) {
            await connection.rollback();
            res.status(404);
            throw new Error("Document detail not found!");
        }

        await connection.commit();

        res.status(200).json({
            message: "Successfully updated",
            update: updateData
        });
    } catch (error) {
        await connection.rollback();
        res.status(500);
        throw new Error(error.message || "Internal Server Error");
    } finally {
        connection.release();
    }
});

module.exports = updateDoctitle;
