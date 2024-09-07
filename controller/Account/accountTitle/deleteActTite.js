const asyncHandler = require("express-async-handler");
const mysqlconnection = require("../../../config/mysqlConfig");

const deleteActTitle = asyncHandler(async (req, res) => {
    const { act_id } = req.body;

    const [deleteRow] = await mysqlconnection.query(`
        DELETE FROM Account WHERE act_id = ?
    `, [act_id]);

    // Check if any rows were affected 
    if (deleteRow.affectedRows === 0) {
        res.status(404);
        throw new Error("Account not found!");
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

module.exports = deleteActTitle;
