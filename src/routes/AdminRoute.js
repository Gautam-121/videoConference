const express = require("express")
const router = express.Router()
const {authorizeRoles,isAuthenticatedUser} = require("../middleware/auth")
const {registerSalesUser} = require("../controller/AdminController")
const {createCustomerData} = require("../controller/customerApprochController")


router.route("/register").post(registerSalesUser)

router.route("/createMeetingCustomer").post(createCustomerData)

module.exports = router
