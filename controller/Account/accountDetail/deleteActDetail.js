const asyncHandler = require('express-async-handler');
const mysqlconnection = require('../../../config/mysqlConfig');

const deleteActDetail = asyncHandler(async (req, res) => {
    const { actDetail_id } = req.body;

    const [deleteRow] = await mysqlconnection.query(`
        DELETE FROM AccountDetail WHERE act_detail_id = ?
    `, [actDetail_id]);

    // Check if any row was affected
    if (deleteRow.affectedRows === 0) {
        res.status(404);
        throw new Error("user not create account-detail!");
    }

    if (deleteRow) {
        res.status(200).json({
            message: "Successfully deleted",
        });
    }
    else {
        res.status(500);
        throw new Error("Internal Server Error!");
    }
});

module.exports = deleteActDetail;
