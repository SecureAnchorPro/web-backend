const asyncHandler = require("express-async-handler");
const mysqlconnection = require("../../../config/mysqlConfig");

const createDocTitle = asyncHandler(async (req, res) => {
    const { doctitle } = req.body;
    const currentUser_id = req.user;

    if (!doctitle) {
        res.status(400);
        throw new Error("All fields are mandatory!");
    }

    // Start a MySQL transaction
    const connection = await mysqlconnection.getConnection();
    await connection.beginTransaction(); // Transaction starts

    try {
        const [doctitleData] = await connection.query(`
            INSERT INTO Document (user_id, doc_title_name) VALUES (?, ?)
        `, [currentUser_id, doctitle]);

        if (!doctitleData || doctitleData.length === 0) {
            await connection.rollback();
            res.status(400);
            throw new Error("Error on create doc-title!");
        }

        await connection.commit();

        res.status(200).json({
            message: "Successfully created",
            document_id: doctitleData.insertId,
            docTitle: doctitle,
            user_id: currentUser_id
        });
    } catch (error) {
        await connection.rollback();
        res.status(500);
        throw new Error(error.message || "Internal Server Error");
    } finally {
        connection.release();
    }
});

module.exports = createDocTitle;
