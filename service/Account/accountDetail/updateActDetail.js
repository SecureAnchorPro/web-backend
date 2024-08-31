const asyncHandler = require('express-async-handler');
const mysqlconnection = require("../../../config/mysqlConfig");

const UpdateActDetail = asyncHandler(async (req, res) => {
    const { actDetail_id, email, password, link } = req.body;

    const [result] = await mysqlconnection.query(`
        UPDATE AccountDetail SET email = ?, password = ?, linkWebsite = ? WHERE actDetail_id = ?
    `, [email, password, link, actDetail_id]);

    // Check if the update affected any rows
    if (result.affectedRows === 0) {
        res.status(404);
        throw new Error("Account detail not found or no changes made");
    }
    const updateData = result;

    if (updateData) {
        res.status(200).json({
            message: "Successfully updated",
            update: updateData
        });
    }
    else {
        res.status(500);
        throw new Error("Internal Server Error!");
    }

});

module.exports = UpdateActDetail;
