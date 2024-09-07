const asyncHandler = require("express-async-handler");
const mysqlconnection = require("../../../config/mysqlConfig");

const deleteDocTitel = asyncHandler(async (req, res) => {
    const { document_id } = req.body;

    try {
        const [result] = await mysqlconnection.query(
            `DELETE FROM Document WHERE document_id = ?`,
            [document_id]
        );

        // Check if any rows were affected
        if (result.affectedRows === 0) {
            res.status(404);
            throw new Error("Document not found!");
        }

        res.status(200).json({
            message: "Successfully deleted Document and associated details",
        });

    } catch (error) {
        // Handle the error appropriately
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
        });
    }
});

module.exports = deleteDocTitel;
