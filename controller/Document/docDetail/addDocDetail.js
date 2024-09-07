const asyncHandler = require("express-async-handler");
const mysqlconnection = require("../../../config/mysqlConfig");
const upload = require("../../../middleware/multer.middleware");
const fs = require("fs");
const path = require("path");
const { downloadFileFromCloudinary, uploadOnCloudinary } = require("../../../util/cloudinary");
const { encryptFile, decryptFile } = require("../../../util/encrypt&decrypt");
const accessKeyAndIV = require("../../../util/accesskey&iv");
const binaryFileToOriginalFileUrl = require("../../../util/binaryfileToOrginalFile");

const AddDocDetail = asyncHandler(async (req, res) => {
    upload.single("docfile")(req, res, async function (err) {
        if (err) {
            res.status(400);
            throw new Error(err.message);
        }

        const { doc_name, doc_id } = req.body;
        const currentUser_id = req.user;

        if (!doc_name || !doc_id) {
            res.status(400);
            throw new Error("All fields are mandatory!");
        }

        // Start a MySQL transaction
        const connection = await mysqlconnection.getConnection();
        await connection.beginTransaction();

        try {
            // Check if the document title exists
            const [docTitlerows] = await connection.query(`
                SELECT * FROM Document WHERE document_id = ?
            `, [doc_id]);

            if (docTitlerows.length === 0) {
                await connection.rollback();
                res.status(404).json({
                    message: "Document title not found! Please create the document title first."
                })
                return;
            }

            // Get file extension from the uploaded file
            const doc_extension = req.file.mimetype;

            // Insert into DocumentDetail table
            const [rowData] = await connection.query(`
                INSERT INTO DocumentDetail (doc_name, document_id, doc_extension) VALUES (?, ?, ?)
            `, [doc_name, doc_id, doc_extension]);

            if (rowData.affectedRows === 0) {
                // Cleanup local file in case of failure
                if (req.file && req.file.path) {
                    fs.unlink(req.file.path, (err) => {
                        if (err) {
                            console.error("Failed to delete local file:", err);
                        }
                    });
                }
                await connection.rollback();
                res.status(400);
                throw new Error("Failed to insert document details!");
            }

            // Access the AES key and IV for encryption
            const aeskeyAndIV = await accessKeyAndIV(currentUser_id);
            const filePath = req.file.path;

            // Encrypt the file before uploading it to Cloudinary
            const encryptFilePath = await encryptFile(filePath, aeskeyAndIV.key, aeskeyAndIV.iv);

            // Upload the encrypted file to Cloudinary
            const cloudinaryUrlAndPublicID = await uploadOnCloudinary(encryptFilePath, null);

            if (!cloudinaryUrlAndPublicID) {
                await connection.rollback();
                res.status(400);
                throw new Error("Failed to upload document to Cloudinary!");
            }

            // Update the doc_file URL in the DocumentDetail table
            const docfile_Url = cloudinaryUrlAndPublicID.url;
            const publicId = cloudinaryUrlAndPublicID.publicId;

            const [uploadDocFile] = await connection.query(`
                UPDATE DocumentDetail SET doc_file = ? , publicIdFromCloudinary = ?WHERE doc_detail_id = ?
            `, [docfile_Url, publicId, rowData.insertId]);

            if (uploadDocFile.affectedRows === 0) {
                await connection.rollback();
                res.status(400);
                throw new Error("Error updating document file URL.");
            }

            // Commit the transaction after successful update
            await connection.commit();

            // Retrieve the updated document details
            const [result] = await connection.query(`
                SELECT * FROM DocumentDetail WHERE doc_detail_id = ?
            `, [rowData.insertId]);

            // Download encrypted file from Cloudinary
            const encryptedFilePathDownloaded = await downloadFileFromCloudinary(
                result[0].doc_file,
                path.join(__dirname, '../../../public/temp')
            );

            if (!encryptedFilePathDownloaded) {
                throw new Error("Failed to download encrypted document from Cloudinary.");
            }

            // Decrypt the file
            const decryptedFilePath = await decryptFile(encryptedFilePathDownloaded, aeskeyAndIV.key, aeskeyAndIV.iv);

            // Convert binary file to a readable URL
            const doc_file_url = binaryFileToOriginalFileUrl(decryptedFilePath, result[0].doc_extension);

            // Prepare the response data
            const DocDetail = {
                doc_detail_id: result[0].doc_detail_id,
                document_id: result[0].document_id,
                doc_name: result[0].doc_name,
                doc_file: doc_file_url,
                doc_extension: result[0].doc_extension
            };

            res.status(200).send({
                message: "Document details uploaded successfully",
                user: DocDetail
            });

        } catch (error) {
            await connection.rollback();
            res.status(500);
            throw new Error(error.message || "Internal Server Error");
        } finally {
            connection.release();

            // Cleanup: Delete the local file if it exists
            if (req.file && req.file.path) {
                fs.unlink(req.file.path, (err) => {
                    if (err) {
                        console.error("Failed to delete local file:", err);
                    }
                });
            }
        }
    });
});

module.exports = AddDocDetail;
