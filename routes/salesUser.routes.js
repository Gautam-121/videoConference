const express = require("express")
const router = express.Router()
const {
  loginSale,
  registerSale,
  forgotPassword,
  resetPassword
} = require("../controller/salesUser.controller.js");

router.route("/register").post(registerSale)

router.route("/login").post(loginSale)

router.route("/password/forgot").post(forgotPassword)

router.route("/password/reset/:token").post(resetPassword)

module.exports = router