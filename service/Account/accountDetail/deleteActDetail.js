const asyncHandler = require('express-async-handler');
const mysqlconnection = require('../../../config/mysqlConfig');

const deleteActDetail = asyncHandler(async (req, res) => {
    const { actDetail_id } = req.body;

    const [deleterow] = await mysqlconnection.query(`
        DELETE FROM AccountDetail WHERE actDetail_id = ?
    `, [actDetail_id]);

    // Check if any row was affected
    if (deleterow.affectedRows === 0) {
        res.status(404);
        throw new Error("Account detail not found!");
    }

    res.status(200).json({
        message: "Successfully deleted",
    });
});

module.exports = deleteActDetail;
