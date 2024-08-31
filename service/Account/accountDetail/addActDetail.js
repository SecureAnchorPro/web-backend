const asyncHandler = require('express-async-handler');
const mysqlconnection = require('../../../config/mysqlConfig');

const AddActDetail = asyncHandler(async (req, res) => {
    const { email, password, link, actTitle } = req.body;

    // Fetch actTitle row
    const [actTitlerows] = await mysqlconnection.query(`
        SELECT * FROM Account WHERE actTitleName = ?
    `, [actTitle]);

    if (actTitlerows.length === 0) {
        res.status(404);
        throw new Error("Account title not found");
    }

    const act_id = actTitlerows[0].act_id;

    const [result] = await mysqlconnection.query(`
        INSERT INTO AccountDetail (email, password, linkWebsite, act_id) VALUES (?, ?, ?, ?)
    `, [email, password, link, act_id]);

    if (result.affectedRows > 0) {
        res.status(201).json({
            message: "Successfully created",
            actDetail_id: result.insertId,
            email: email,
            act_id: act_id
        });
    } else {
        res.status(500);
        throw new Error("Internal Server Error");
    }
});

module.exports = AddActDetail;
