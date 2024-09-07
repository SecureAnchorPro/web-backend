require('dotenv').config();
const mysqlconnection = require('../../config/mysqlConfig');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const asyncHandler = require('express-async-handler');
const { decryptData, decryptFile } = require("../../util/encrypt&decrypt");
const { downloadFileFromCloudinary } = require("../../util/cloudinary");
const binaryFileToOriginalFileUrl = require("../../util/binaryfileToOrginalFile");
const path = require("path");
const accessKeyAndIV = require("../../util/accesskey&iv");


const currentUser = asyncHandler(async (req, res) => {
    // console.log(req.user)
    const currentUser_id = req.user;

    // acessing key and iv
    const aeskeyAndIV = await accessKeyAndIV(currentUser_id);
    // console.log(aeskeyAndIV.key);
    // console.log(aeskeyAndIV.iv);
    const [user] = await mysqlconnection.query(`
        SELECT * FROM Users WHERE user_id = ?
        `, [currentUser_id]);

    const decryptedPhone_number = decryptData(user[0].phone_number, aeskeyAndIV.key, aeskeyAndIV.iv);

    const encryptedProfileImg = await downloadFileFromCloudinary(
        user[0].profile,
        path.join(__dirname, '../../public/temp')
    );

    const decryptProfileImg = await decryptFile(encryptedProfileImg, aeskeyAndIV.key, aeskeyAndIV.iv);
    const image_url = binaryFileToOriginalFileUrl(decryptProfileImg, 'png');

    const user_detail = {
        user_id:user[0].user_id,
        name: user[0].name,
        email: user[0].email,
        phone_number: decryptedPhone_number,
        profile_url: image_url,
        created_at: user[0].created_at,
        updated_at: user[0].updated_at,
        publicId:user[0].publicIdFromCloudinary
    }
    res.status(200).send({
        message: "Profile updated successfully",
        currentUser: user_detail
    });
})




// const UserLogin = asyncHandler(async (req, res) => {
//     const { email, password } = req.body;

//     if (!email || !password) {
//         res.status(400);
//         throw new Error("All fields are mandatory!");
//     }
//     const [userFind] = await mysqlconnection.query(`
//         SELECT * FROM Users WHERE email = ?
//     `, [email]);

//     if (userFind.length === 0) {
//         res.status(400);
//         throw new Error("Incorrect Email provided.");
//     }

//     // Compare passwords
//     const isPasswordMatch = await bcrypt.compare(password, userFind[0].password);

//     if (isPasswordMatch) {
//         const jwtToken = jwt.sign(
//             {
//                 user: {
//                     name: userFind[0].name,
//                     email: userFind[0].email,
//                     id: userFind[0].user_id,
//                 },
//             },
//             process.env.TOKEN_SECRET,
//             { expiresIn: "1h" }
//         );

//         res.status(200).json({
//             message: "User logged in successfully",
//             token: jwtToken,
//         });
//     } else {
//         res.status(400);
//         throw new Error("Incorrect password provided.");
//     }
// });


module.exports = { currentUser };
