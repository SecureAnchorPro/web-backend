const asyncHandler = require("express-async-handler");
const mysqlconnection = require("../../../config/mysqlConfig");

const showAllActDetail = asyncHandler(async (req, res) => {
    const { titleName } = req.body;
    const currentuser_id = req.user.user_id;
    console.log(currentuser_id);

    const [result] = await mysqlconnection.query(`
        SELECT act_id FROM Account WHERE actTitleName = ? AND user_id = ?
    `, [titleName, currentuser_id]);

    // Check if the act_id was not found
    if (result.length === 0) {
        res.status(404);
        throw new Error("Account not found!");
    }
    const Require_act_id = result[0].act_id;

    const [allDataResult] = await mysqlconnection.query(`
        SELECT * FROM AccountDetail WHERE act_id = ?
    `, [Require_act_id]);

    // Check if any account details are found
    if (allDataResult.length === 0) {
        res.status(404);
        throw new Error("No account details found!");
    }

    const allData = allDataResult;

    if (allData) {
        res.status(200).json({
            message: "Successfully retrieved account details",
            data: allData
        });
    }
    else {
        res.status(500);
        throw new Error("Internal Sever Error!")
    }
});

module.exports = showAllActDetail;
