const express = require("express")
const router = express.Router()
const {login , register , logOut} = require("../controller/SalesUserController")
const {isAuthenticatedUser} = require("../middleware/auth")

router.route("/register").post(register)

router.route("/login").post(login)

router.route("/logout").get(isAuthenticatedUser , logOut)




module.exports = router