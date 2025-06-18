
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.js'); 
const { verify, verifyAdmin } = require("../auth.js");

router.post("/register", userController.registerUser);
/*  */
router.post("/login", userController.loginUser);

/* router.post("/check-email", userController.checkEmailExists); */

router.get("/details", verify, userController.getProfile);

router.patch('/:id/set-as-admin',verify, verifyAdmin, userController.updateAdmin);

router.patch('/update-password', verify, userController.resetPassword);

module.exports = router;
