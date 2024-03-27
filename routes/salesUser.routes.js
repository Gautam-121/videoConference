const express = require("express")
const router = express.Router()
const {loginSale , registerSale } = require("../controller/salesUser.controller.js")

router.route("/register").post(registerSale)

router.route("/login").post(loginSale)

module.exports = router