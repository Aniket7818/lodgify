const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapasync = require("../utils/wrapasync.js");
const passport = require("passport");
const { savedRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/user.js");

//Signup
router
  .route("/signup")
  .get(userController.signupRender)
  .post(wrapasync(userController.signupForm));

//Login
router
  .route("/login")
  .get(userController.loginRender)
  .post(
    savedRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.login
  );

//Logout
router.get("/logout", userController.logout);
module.exports = router;
