const asyncHandler = require("express-async-handler");
const mysqlconnection = require("../../../config/mysqlConfig");
const path = require("path");
const { downloadFileFromCloudinary, uploadOnCloudinary } = require("../../../util/cloudinary");
const { encryptFile, decryptFile } = require("../../../util/encrypt&decrypt");
const accessKeyAndIV = require("../../../util/accesskey&iv");
const binaryFileToOriginalFileUrl = require("../../../util/binaryfileToOrginalFile");

const showAllDetail = asyncHandler(async (req, res) => {
    const { doctitle } = req.body;
    const currentUser_id = req.user;

    try {
        const [docTitleResult] = await mysqlconnection.query(`
            SELECT * FROM Document WHERE doc_title_name = ? AND user_id = ?
        `, [doctitle, currentUser_id]);

        if (docTitleResult.length === 0) {
            res.status(404);
            throw new Error("Document title not found!");
        }

        const Require_document_id = docTitleResult[0].document_id;

        // Fetch all document details associated with the title
        const [allDataResult] = await mysqlconnection.query(`
            SELECT * FROM DocumentDetail WHERE document_id = ?
        `, [Require_document_id]);

        if (allDataResult.length === 0) {
            res.status(404);
            throw new Error("No documents found under this title.");
        }

        const aeskeyAndIV = await accessKeyAndIV(currentUser_id);

        // Use Promise.all() to handle asynchronous operations in parallel
        const userDocDetail = await Promise.all(
            allDataResult.map(async (item, index) => {

                // Download the encrypted file from Cloudinary
                const encryptedFilePath = await downloadFileFromCloudinary(
                    item.doc_file,
                    path.join(__dirname, '../../../public/temp')
                );

                if (!encryptedFilePath) {
                    console.error(`Failed to download document for item ${index + 1}`);
                    throw new Error("Failed to download encrypted document from Cloudinary.");
                }

                // Decrypt the file
                const decryptedFilePath = await decryptFile(encryptedFilePath, aeskeyAndIV.key, aeskeyAndIV.iv);
                if (!decryptedFilePath) {
                    console.error(`Decryption failed for item ${index + 1}`);
                    throw new Error("Decryption failed for the document.");
                }

                // Convert the decrypted binary file to a readable URL
                const doc_file_url = binaryFileToOriginalFileUrl(decryptedFilePath, item.doc_extension);

                return {
                    doc_detail_id: item.doc_detail_id,
                    document_id: item.document_id,
                    doc_name: item.doc_name,
                    doc_file: doc_file_url,
                    doc_extension: item.doc_extension
                };
            })
        );

        // Send the response with decrypted document details
        res.status(200).json({
            message: "Successfully retrieved document details",
            data: userDocDetail
        });

        // console.log("userDocDetail array (limited):", userDocDetail.map(item => ({
        //     ...item,
        //     doc_file: item.doc_file.substring(0, 100) // Limit base64 output for testing
        // })));
        

    } catch (error) {
        console.error("Error processing document details:", error);
        res.status(500);
        throw new Error(error.message || "Internal Server Error");
    }
});

module.exports = showAllDetail;
