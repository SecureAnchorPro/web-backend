require("dotenv").config();
const asyncHandler = require("express-async-handler");
const mysqlconnection = require("../../../config/mysqlConfig");
const GenerateContent = require("../../../config/openaiConfig");

const CreateActTitle = asyncHandler(async (req, res) => {
    const { title, category } = req.body;
    const currentUser_id = req.user;

    if (!title || !category) {
        res.status(400);
        throw new Error("All fields are mandatory!");
    }

    // Start a MySQL transaction
    const connection = await mysqlconnection.getConnection();
    await connection.beginTransaction();

    try {
        // const response = await GenerateContent(process.env.INTIAL_PROMPT);
        // console.log(response);

        const [newTitle] = await connection.query(`
            INSERT INTO Account (user_id, act_title_name, name_of_category) VALUES (?, ?, ?)
        `, [currentUser_id, title, category]);

        if (newTitle) {
            await connection.commit();
            res.status(201).json({
                message: "Successfully created",
                act_id: newTitle.insertId,
                actTitle: title,
                category: category,
                user_id: currentUser_id
            });
        } else {
            throw new Error("Internal Server Error");
        }
    } catch (error) {
        await connection.rollback();
        res.status(500);
        throw new Error(error.message || "An error occurred during the transaction");
    } finally {
        connection.release();
    }
});

module.exports = CreateActTitle;
