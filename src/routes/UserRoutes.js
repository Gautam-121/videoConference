const exprees = require("express")
const router = exprees.Router()
const {registerUser} = require("../controller/UserController")

router.route("/registerUser").post(registerUser)





module.exports = router