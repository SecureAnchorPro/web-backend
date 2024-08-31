const asyncHandler = require("express-async-handler");
const mysqlconnection = require("../../../config/mysqlConfig");

const deleteActTitle = asyncHandler(async (req, res) => {
    const { act_id } = req.body;

    const [deleterow] = await mysqlconnection.query(`
        DELETE FROM Account WHERE act_id = ?
    `, [act_id]);

    // Check if any rows were affected 
    if (deleterow.affectedRows === 0) {
        res.status(404);
        throw new Error("Account not found!");
    }

    if (deleterow) {
        res.status(200).json({
            message: "Successfully deleted account and associated details",
        });
    }
    else {
        res.status(500);
        throw new Error("Internal Server Error!");
    }
});

module.exports = deleteActTitle;
