require("dotenv").config();
const mysqlconnection = require("../config/mysqlConfig");
const { decryptData } = require("./encrypt&decrypt");

const accessKeyAndIV = async (currentUser_id) => {
    try {

        // Master key and IV
        const masterKey = process.env.MASTER_CRYPTO_SECRET_KEY;
        const masterIV = process.env.MASTER_CRYPTO_SECRET_IV;

        const [userAesCredential] = await mysqlconnection.query(`
            SELECT * FROM AesCredential WHERE user_id = ?
        `, [currentUser_id]);

        if (userAesCredential.length === 0) {
            throw new Error("AesCredential not found!");
        }

        const Credential = {
            key: decryptData(userAesCredential[0].aes_key, masterKey, masterIV),
            iv: decryptData(userAesCredential[0].aes_iv, masterKey, masterIV)
        };

        return Credential;

    } catch (err) {
        throw new Error(err.message);
    }
}


module.exports = accessKeyAndIV;
