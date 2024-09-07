const express = require('express');
const router = express.Router();

const register = require('../controller/user/register');
const {currentUser } = require('../controller/user/login1.0&currentUser');

const validateToken = require('../middleware/validateToken');
const validateToken2 = require('../middleware/validateToken2.0');
const login2 = require("../controller/user/login2.0");

const { sendEmailVerify, emailVarify } = require("../controller/eamilService/emailVerify");
const { sendEmailPassword, forgetPassword } = require("../controller/eamilService/forgetPassword");
const updateProfile = require("../controller/user/userProfileUpdate");


// // login1.0
// router.route('/login').post(UserLogin);

// // login2.0
router.route('/auth/login').post(login2);

// // sinup
router.route("/sinup").post(register);

// currentuser validateToken1.0
// router.route("/currentuser").get(validateToken, currentUser)

// currentuser validateToken2.0
router.route("/auth/currentuser").get(validateToken2, currentUser);

// sendEmailVerify
router.route("/sendEmailVerify").post(validateToken2,sendEmailVerify);

// emailVarify
router.route("/emailVarify").post(emailVarify);

// sendEmailPassword
router.route("/sendEmailPassword").post(sendEmailPassword);

// forgetPassword
router.route("/forgetPassword").post(forgetPassword);

// updateProfile
router.route('/auth/update-profile').post(validateToken2,updateProfile);


module.exports = router;