const express = require("express")
const router = express.Router()
const {login} = require("../controller/SalesUserController")


router.route("/login", login)







module.exports = router