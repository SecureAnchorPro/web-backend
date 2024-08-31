const asyncHandler = require("express-async-handler");
const mysqlconnection = require("../../../config/mysqlConfig");

const upadateTitleName = asyncHandler(async (req, res) => {
    const { titleName, act_id } = req.body;

    const [result] = await mysqlconnection.query(`
        UPDATE Account SET actTitleName = ? WHERE act_id = ?
        `, [titleName, act_id]);


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
        es.status(500);
        throw new Error("Internal Sever Error!");
    }
})

module.exports = upadateTitleName;