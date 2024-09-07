const crypto = require("crypto");

const generateKey = (password) => {
    const salt = crypto.randomBytes(16);
    return crypto.pbkdf2Sync(password, salt, 100000, 16, 'sha256');
}

const generateIV = () => {
    return crypto.randomBytes(8);
}

module.exports = { generateKey, generateIV }
