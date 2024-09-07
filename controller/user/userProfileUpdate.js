const asyncHandler = require("express-async-handler");
const mysqlconnection = require("../../config/mysqlConfig");
const upload = require("../../middleware/multer.middleware");
const { downloadFileFromCloudinary, uploadOnCloudinary } = require("../../util/cloudinary");
const fs = require('fs');
const accessKeyAndIV = require("../../util/accesskey&iv");
const { encryptData, decryptData, encryptFile, decryptFile } = require("../../util/encrypt&decrypt");
const path = require("path");
const binaryFileToOriginalFileUrl = require("../../util/binaryfileToOrginalFile");

const updateProfile = asyncHandler(async (req, res) => {
    // multer middleware to handle file upload
    upload.single('profileImg')(req, res, async (err) => {
        if (err) {
            res.status(400);
            throw new Error(err.message);
        }

        const { name, email, phone_number } = req.body;
        const currentUser_id = req.user;

        if (!name || !email || !phone_number) {
            res.status(400);
            throw new Error("All fields are mandatory!");
        }

        // Fetch the current user
        const [userLoginData] = await mysqlconnection.query(
            `SELECT * FROM Users WHERE user_id = ?`,
            [currentUser_id]
        );

        if (userLoginData.length === 0) {
            res.status(400);
            throw new Error("User is not logged in!");
        }

        // Access the AES key and IV
        const aeskeyAndIV = await accessKeyAndIV(currentUser_id);

        // console.log(aeskeyAndIV.key);
        // console.log(aeskeyAndIV.iv);

        // Encrypt the phone number
        const encryptedPhone = encryptData(phone_number, aeskeyAndIV.key, aeskeyAndIV.iv);

        // Update user profile details
        const [updateProfile] = await mysqlconnection.query(
            `UPDATE Users SET name = ?, email = ?, phone_number = ? WHERE user_id = ?`,
            [name, email, encryptedPhone, currentUser_id]
        );

        if (updateProfile.affectedRows === 0) {
            // Clean up uploaded file if profile update fails
            if (req.file && req.file.path) {
                fs.unlink(req.file.path, (err) => {
                    if (err) {
                        console.error("Failed to delete local file:", err);
                    }
                });
            }
            res.status(400);
            throw new Error("Error updating profile details.");
        }

        // Proceed with image upload
        const profileImgPath = req.file?.path;
        if (!profileImgPath) {
            res.status(400);
            throw new Error("Profile image not uploaded.");
        }

        // Encrypt the profile image
        const encryptedProfilePath = await encryptFile(profileImgPath, aeskeyAndIV.key, aeskeyAndIV.iv);

        // Upload encrypted image to Cloudinary
        const oldFilePublicId = userLoginData[0].publicIdFromCloudinary;
        const cloudinaryUrlAndPublicID = await uploadOnCloudinary(encryptedProfilePath, oldFilePublicId);

        if (!cloudinaryUrlAndPublicID) {
            // Clean up file if upload to Cloudinary fails
            fs.unlink(profileImgPath, (err) => {
                if (err) {
                    console.error("Failed to delete local file:", err);
                }
            });
            res.status(400);
            throw new Error("Error update image to Cloudinary.");
        }

        // Update profile with the image URL

        const profileImgUrl = cloudinaryUrlAndPublicID.url;
        const publicId = cloudinaryUrlAndPublicID.publicId;

        const [updateProfileWithImgAndPublicId] = await mysqlconnection.query(
            `UPDATE Users SET profile = ?, publicIdFromCloudinary = ? WHERE user_id = ?`,
            [profileImgUrl, publicId, currentUser_id]
        );

        if (updateProfileWithImgAndPublicId.affectedRows === 0) {
            res.status(400);
            throw new Error("Error updating profile image URL.");
        }

        // Fetch the updated user data
        const [user] = await mysqlconnection.query(
            `SELECT * FROM Users WHERE user_id = ?`,
            [currentUser_id]
        );

        const decryptedPhone_number = decryptData(user[0].phone_number, aeskeyAndIV.key, aeskeyAndIV.iv);

        const encryptedProfileImg = await downloadFileFromCloudinary(
            user[0].profile,
            path.join(__dirname, '../../public/temp')
        );

        const decryptProfileImg = await decryptFile(encryptedProfileImg, aeskeyAndIV.key, aeskeyAndIV.iv);

        const image_url = binaryFileToOriginalFileUrl(decryptProfileImg, 'png');


        // Prepare the updated user object
        const updatedUser = {
            name: user[0].name,
            email: user[0].email,
            phone_number: decryptedPhone_number,
            profileImg: image_url,
            created_at: user[0].created_at,
            updated_at: user[0].updated_at
        };

        // Clean up the uploaded file from local-storge
        // if (decryptProfileImg) {
        //     fs.unlink(encryptedProfileImg, (err) => {
        //         if (err) {
        //             console.error("Failed to delete local file:", err);
        //         }
        //     });
        // }

        if (req.file && req.file.path) {
            fs.unlink(req.file.path, (err) => {
                if (err) {
                    console.error("Failed to delete local file:", err);
                }
            });
        }

        res.status(200).send({
            message: "Profile updated successfully",
            user: updatedUser
        });
    });
});

module.exports = updateProfile;
