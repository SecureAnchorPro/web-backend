require('dotenv').config();
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ALGORITHM = 'aes-256-cbc';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;

// Encrypt text data
const encryptData = (plainText, key, iv) => {
    if (!plainText) {
        return null;
    }

    if (!key || !iv) {
        throw new Error('Key and IV must be provided');
    }

    if (key.length !== KEY_LENGTH || iv.length !== IV_LENGTH) {
        throw new Error('Invalid key or IV length');
    }

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(plainText, 'utf-8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
};

// Decrypt text data
const decryptData = (encryptedMessage, key, iv) => {

    if (!encryptedMessage) {
        return null;
    }

    if (!key || !iv) {
        throw new Error('Key and IV must be provided');
    }

    if (key.length !== KEY_LENGTH || iv.length !== IV_LENGTH) {
        throw new Error('Invalid key or IV length');
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedMessage, 'base64', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
};

// Encrypt a file
const encryptFile = (filePath, key, iv) => {

    if (!filePath) {
        return null;
    }

    if (!key || !iv) {
        throw new Error('Key and IV must be provided');
    }

    if (key.length !== KEY_LENGTH || iv.length !== IV_LENGTH) {
        throw new Error('Invalid key or IV length');
    }

    if (!fs.existsSync(filePath)) {
        throw new Error('File does not exist');
    }

    return new Promise((resolve, reject) => {
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        const input = fs.createReadStream(filePath);
        const encryptedFilePath = `${filePath}.enc`;
        const output = fs.createWriteStream(encryptedFilePath);

        input.pipe(cipher).pipe(output);
        output.on('finish', () => {
            console.log('File encrypted successfully');
            resolve(encryptedFilePath);
        });
        output.on('error', (error) => {
            console.error(`File encryption error for file ${filePath}:`, error);
            reject(new Error('File encryption failed'));
        });
    });
};

// Decrypt a file
const decryptFile = (encryptedFilePath, key, iv) => {
    // console.log(`Decrypting file at path: ${encryptedFilePath}`);

    if (!encryptedFilePath) {
        return null;
    }

    if (!key || !iv) {
        throw new Error('Key and IV must be provided');
    }

    if (key.length !== KEY_LENGTH || iv.length !== IV_LENGTH) {
        throw new Error('Invalid key or IV length');
    }

    if (!fs.existsSync(encryptedFilePath)) {
        throw new Error('File does not exist');
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    const decryptedFilePath = encryptedFilePath.replace('.enc', '');
    const input = fs.createReadStream(encryptedFilePath);
    const output = fs.createWriteStream(decryptedFilePath);

    return new Promise((resolve, reject) => {
        input.pipe(decipher).pipe(output);

        output.on('finish', () => {
            fs.readFile(decryptedFilePath, (err, data) => {
                if (err) {
                    reject(new Error('Error reading decrypted file'));
                } else {
                    console.log('File decrypted successfully');

                    resolve(data); // it give binary data

                    fs.unlink(encryptedFilePath, (err) => {
                        if (err) {
                            console.error("Failed to delete local file:", err);
                        }
                    });

                    fs.unlink(decryptedFilePath, (err) => {
                        if (err) {
                            console.error("Failed to delete local file:", err);
                        }
                    });
                }
            });
        });

        output.on('error', (error) => {
            console.error('File decryption error:', error);
            reject(new Error('File decryption failed'));
        });
    });

};

module.exports = { encryptData, decryptData, encryptFile, decryptFile };
