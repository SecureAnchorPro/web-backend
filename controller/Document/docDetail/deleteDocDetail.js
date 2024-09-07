const asyncHandler = require("express-async-handler");
const mysqlconnection = require("../../../config/mysqlConfig");
const { deleteOnCloudinary } = require("../../../util/cloudinary");

const deleteDocDetail = asyncHandler(async (req, res) => {
    const { doc_detail_id } = req.body;

    try {
        const [rowExist] = await mysqlconnection.query(`
            SELECT * FROM DocumentDetail WHERE doc_detail_id = ?
            `, [doc_detail_id]);

        if (rowExist.length === 0) {
            res.status(404).json({
                message: "Document-Detail not found!"
            })
            return;
        }

        const [deleteRow] = await mysqlconnection.query(`
            DELETE FROM DocumentDetail WHERE doc_detail_id = ?
            `, [doc_detail_id]);

        if(deleteRow.affectedRows === 0){
            res.status(404);
            throw new Error("Document detail not deleted!");
        }

        // Delete the document from Cloudinary
        const deleteOnCloudinaryFile = await deleteOnCloudinary(rowExist[0].publicIdFromCloudinary)

        res.status(200).json({
            message: "Successfully deleted",
        });

    } catch (err) {
        console.error("Error in deleteDocDetail:", err.message);
        res.status(500).json({
            message: err.message || "Internal Server Error"
        });
    }
})

module.exports = deleteDocDetail;