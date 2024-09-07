require("dotenv").config();
const { v2: cloudinary } = require("cloudinary");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

// Cloudinary configuration using environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to upload a file to Cloudinary and manage old file
const uploadOnCloudinary = async (localFilePath, oldFilePublicId) => {
    try {
        if (!localFilePath) {
            throw new Error("Local file path is missing");
        }

        // Upload the new file
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        // Delete the old file from Cloudinary if provided
        if (oldFilePublicId) {
            await deleteOnCloudinary(oldFilePublicId);
        }

        // Delete the local file
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        // Return the URL and public ID of the uploaded file
        const urlAndPublicId = {
            url: response.url,
            publicId: response.public_id
        };

        return urlAndPublicId;
    } catch (err) {
        console.error("Error uploading file to Cloudinary:", err.message);

        // Ensure the local file is deleted even if an error occurs
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return null;
    }
};

// Function to delete a file from Cloudinary
const deleteOnCloudinary = async (oldFilePublicId) => {
    try {
        if (!oldFilePublicId) {
            throw new Error("Cloudinary public ID is missing");
        }

        return await cloudinary.uploader.destroy(oldFilePublicId);
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        throw error;
    }
};

// checking directory exits
const ensureDirectoryExistence = (filePath) => {
    const dirname = path.dirname(filePath);
    if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname, { recursive: true });
    }
};

// getting urlbasename
const getFileNameFromUrl = (url) => {
    const parsedUrl = new URL(url);
    return path.basename(parsedUrl.pathname);
};

// downloadFile from cloudinary
const downloadFileFromCloudinary = async (url, outputDirectory) => {
    if (!url) {
        return null;
    }
    try {
        const fileName = getFileNameFromUrl(url);
        const outputPath = path.join(outputDirectory, fileName);
        ensureDirectoryExistence(outputPath);

        const writer = fs.createWriteStream(outputPath);
        const response = await axios({
            url,
            method: "GET",
            responseType: "stream",
        });

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on("finish", () => resolve(outputPath));
            writer.on("error", reject);
        });
    } catch (error) {
        console.error("Error downloading file:", error.message);
        throw error;
    }
};

// const uploadOnCloudinary_1_0 = async (localFilePath) => {
//     try {
//         if (!localFilePath) {
//             throw new Error("Local file path is missing");
//         }

//         const response = await cloudinary.uploader.upload(localFilePath, {
//             resource_type: "auto",
//         });

//         if (fs.existsSync(localFilePath)) {
//             fs.unlinkSync(localFilePath);
//         }

//         const urlAndPublicId = {
//             url: response.url,
//             Id: response.public_id
//         };
//         return urlAndPublicId;
//     } catch (error) {
//         console.error("Error uploading file to Cloudinary:", error.message);

//         if (fs.existsSync(localFilePath)) {
//             fs.unlinkSync(localFilePath);
//         }

//         return null;
//     }
// };


module.exports = { downloadFileFromCloudinary, uploadOnCloudinary, deleteOnCloudinary };
