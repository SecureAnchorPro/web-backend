const asyncHandler = require("express-async-handler");
const mysqlconnection = require("../../../config/mysqlConfig");

const showAllActTitle = asyncHandler(async (req, res) => {
    const {category} = req.body;
    const currentUser_id = req.user;
    const [allActTitle] = await mysqlconnection.query(`
        SELECT * FROM Account WHERE user_id = ? AND name_of_category = ?
    `, [currentUser_id,category]);

    if (allActTitle && allActTitle.length > 0) {
        res.status(200).json({
            message: "Successfully retrieved account details",
            data: allActTitle
        });
    }
    else {
        res.status(404).json({
            message: "No account titles found for the given user ID"
        });
    }
});

module.exports = showAllActTitle;
