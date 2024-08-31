const asyncHandler = require("express-async-handler");
const mysqlconnection = require("../../../config/mysqlConfig");

const CreateActTitle = asyncHandler(async (req, res) => {
    const { title } = req.body;
    const currentUser_id = req.user.user_id;

    const [newTitle] = await mysqlconnection.query(`
        INSERT INTO Account (user_id, actTitleName) VALUES (?, ?)
    `, [currentUser_id, title]);

    if (newTitle) {
        res.status(201).json({
            message: "Successfully created",
            act_id: newTitle.insertId,
            actTitle: title,
            user_id: currentUser_id
        });
    } else {
        res.status(500);
        throw new Error("Internal Server Error");
    }
});

module.exports = CreateActTitle;
