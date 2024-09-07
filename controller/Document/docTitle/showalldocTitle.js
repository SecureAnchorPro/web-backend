const asyncHandler = require("express-async-handler");
const mysqlconnection = require("../../../config/mysqlConfig");

const showalldocTitle = asyncHandler(async (req, res) => {
    const currentUser_id = req.user;

    const [alldocTile] = await mysqlconnection.query(`
        SELECT * FROM Document WHERE user_id = ? 
        `, [currentUser_id]);

    if(alldocTile.length > 0 ){
        res.status(200).json({
            message: "Successfully retrieved account details",
            data: alldocTile
        });
    }
    else{
        res.status(404).json({
            message: "No account titles found for the given user ID"
        });
    }
})

module.exports = showalldocTitle;