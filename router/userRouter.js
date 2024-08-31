const express = require('express');
const router = express.Router();

const register = require('../controller/register');
const { UserLogin , currentUser } = require('../controller/login');
const validateToken = require('../middleware/validateToken');
const validateToken2 = require('../middleware/validateToken2.0');
const login2 = require("../controller/login2.0");
// login
router.route('/login').post(UserLogin);

// login2.0
router.route('/auth/login').post(login2);

// sinup
router.route("/sinup").post(register);

// currentuser validateToken1.0
router.route("/currentuser").get(validateToken,currentUser)

// currentuser validateToken2.0
router.route("/auth/currentuser").get(validateToken2,currentUser);
// 

module.exports = router;