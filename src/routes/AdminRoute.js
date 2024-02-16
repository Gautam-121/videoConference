const express = require("express")
const router = express.Router()
const {authorizeRoles,isAuthenticatedUser} = require("../middleware/auth")
const {registerSalesUser} = require("../controller/AdminController")


router.route("/register",registerSalesUser)

module.exports = router
