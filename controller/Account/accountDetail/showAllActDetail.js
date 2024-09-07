const asyncHandler = require("express-async-handler");
const mysqlconnection = require("../../../config/mysqlConfig");
const { decryptData } = require("../../../util/encrypt&decrypt");
const accessKeyAndIV = require("../../../util/accesskey&iv");
const { response } = require("express");

const showAllActDetail = asyncHandler(async (req, res) => {
    const { titleName, category } = req.body;
    const currentuser_id = req.user;

    const [result] = await mysqlconnection.query(`
        SELECT act_id FROM Account WHERE act_title_name = ? AND user_id = ? AND name_of_category = ?
    `, [titleName, currentuser_id, category]);

    // Check if the act_id was not found
    if (result.length === 0) {
        res.status(404);
        throw new Error("user not create account-titel!");
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

    // Decrypt account details and format response
    const userActDetail = [];
    const aeskeyAndIV = await accessKeyAndIV(currentuser_id);

    allDataResult.forEach((item) => {
        const tempStorage = {
            act_detail_id: item.act_detail_id,
            act_id: item.act_id,
            email: item.email,
            password: decryptData(item.password, aeskeyAndIV.key, aeskeyAndIV.iv),
            link_website: item.link_website
        };
        userActDetail.push(tempStorage);
    });

    if (allDataResult) {
        res.status(200).json({
            message: "Successfully retrieved account details",
            data: userActDetail
        });
    }
    else {
        res.status(500);
        throw new Error("Internal Sever Error!")
    }
});

module.exports = showAllActDetail;
