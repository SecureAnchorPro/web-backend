const asyncHandler = require("express-async-handler");
const mysqlconnection = require("../../../config/mysqlConfig");
const upload = require("../../../middleware/multer.middleware");
const fs = require("fs");
const path = require("path");
const { uploadOnCloudinary, downloadFileFromCloudinary } = require("../../../util/cloudinary");
const accessKeyAndIV = require("../../../util/accesskey&iv");
const { encryptFile, decryptFile } = require("../../../util/encrypt&decrypt");
const binaryFileToOriginalFileUrl = require("../../../util/binaryfileToOrginalFile");

const updateDocDetail = asyncHandler(async (req, res) => {
    upload.single("docfile")(req, res, async function (err) {
        if (err) {
            res.status(400);
            throw new Error(err.message);
        }
        
        const { doc_name, doc_detail_id } = req.body;
        const currentUser_id = req.user;

        if (!doc_name || !doc_detail_id) {
            res.status(400);
            throw new Error("All fields are mandatory!");
        }

        // Start a MySQL transaction
        const connection = await mysqlconnection.getConnection();
        await connection.beginTransaction();

        try {
            // Check if document detail exists
            const [rowexists] = await connection.query(`
                    SELECT * FROM DocumentDetail WHERE doc_detail_id = ?
                `, [doc_detail_id]);

            if (rowexists.length === 0) {
                await connection.rollback();
                res.status(404).send({ message: "Document detail not found!" });
                return;
            }

            const aeskeyAndIV = await accessKeyAndIV(currentUser_id);
            const doc_detail_path = req.file.path;

            // Encrypt and upload the file to Cloudinary
            const encryptedFilePath = await encryptFile(doc_detail_path, aeskeyAndIV.key, aeskeyAndIV.iv);
            const oldFilePublicId = rowexists[0].publicIdFromCloudinary;
            const cloudinaryUrlAndPublicID = await uploadOnCloudinary(encryptedFilePath, oldFilePublicId);

            if (!cloudinaryUrlAndPublicID) {
                await connection.rollback();
                res.status(400);
                throw new Error("Unable to upload file to Cloudinary!");
            }

            const doc_extension = req.file.mimetype;
            const docfile_Url = cloudinaryUrlAndPublicID.url;
            const publicId = cloudinaryUrlAndPublicID.url;

            // Update document details in the database
            const [updateRow] = await connection.query(`
                UPDATE DocumentDetail 
                SET doc_name = ?, doc_file = ?, doc_extension = ? , publicIdFromCloudinary = ?
                WHERE doc_detail_id = ? 
            `, [doc_name, docfile_Url, doc_extension, publicId, doc_detail_id]);

            if (updateRow.affectedRows === 0) {
                await connection.rollback();
                res.status(400).send({ message: "Error updating document detail!" });
                return;  // Exit the function here
            }

            await connection.commit();

            // Fetch updated document details
            const [result] = await connection.query(`
                SELECT * FROM DocumentDetail WHERE doc_detail_id = ?
            `, [doc_detail_id]);

            // Download and decrypt the file from Cloudinary
            const encryptedFilePathDownloaded = await downloadFileFromCloudinary(
                result[0].doc_file,
                path.join(__dirname, '../../../public/temp')
            );

            if (!encryptedFilePathDownloaded) {
                throw new Error("Failed to download the encrypted document from Cloudinary.");
            }

            const decryptedFilePath = await decryptFile(encryptedFilePathDownloaded, aeskeyAndIV.key, aeskeyAndIV.iv);
            const doc_file_url = binaryFileToOriginalFileUrl(decryptedFilePath, result[0].doc_extension);

            // Prepare document detail for response
            const DocDetail = {
                doc_detail_id: result[0].doc_detail_id,
                document_id: result[0].document_id,
                doc_name: result[0].doc_name,
                doc_file: doc_file_url,
                doc_extension: result[0].doc_extension
            };

            // Respond with the updated document detail
            res.status(200).send({
                message: "Document detail updated successfully",
                user: DocDetail
            });

        } catch (error) {
            await connection.rollback();
            res.status(500).send({ message: error.message || "Internal Server Error" });
            console.error("Error:", error);  // Log error details
        } finally {
            connection.release();

            // Cleanup: Delete the local file if it exists
            if (req.file && req.file.path) {
                fs.unlink(req.file.path, (err) => {
                    if (err) {
                        console.error("Failed to delete the local file:", err);
                    }
                });
            }
        }
    });
});

module.exports = updateDocDetail;
