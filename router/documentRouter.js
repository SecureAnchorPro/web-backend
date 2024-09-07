const express = require("express");
const router = express.Router();

const AddDocDetail = require("../controller/Document/docDetail/addDocDetail");
const deleteDocDetail = require("../controller/Document/docDetail/deleteDocDetail");
const showAllDetail = require("../controller/Document/docDetail/showAllDetail");
const updateDocDetail = require("../controller/Document/docDetail/updateDocDetail");

const createDocTitle = require("../controller/Document/docTitle/createDocTitle");
const deleteDocTitel = require("../controller/Document/docTitle/deleteDocTitel");
const showalldocTitle = require("../controller/Document/docTitle/showalldocTitle");
const updateDoctitle = require("../controller/Document/docTitle/updateDocTite");

const validateToken2 = require("../middleware/validateToken2.0");

// createDocTitle
router.route("/createtitle").post(validateToken2,createDocTitle);

// deleteDocTitel
router.route("/deletetitle").delete(validateToken2,deleteDocTitel);

// showalldocTitle
router.route("/showalltitle").get(validateToken2,showalldocTitle);

// updateDoctitle
router.route("/updatetitle").put(validateToken2,updateDoctitle);

// AddDocDetail
router.route("/addetail").post(validateToken2,AddDocDetail);

// deleteDocDetail
router.route("/deletedetail").delete(validateToken2,deleteDocDetail);

// showAllDetail
router.route("/showalldetail").get(validateToken2,showAllDetail);

// updateDocDetail
router.route("/updatedetail").put(validateToken2,updateDocDetail);

module.exports = router;
