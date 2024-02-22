const express = require('express')
const router = express.Router()
const {isAuthenticatedUser} = require("../middleware/auth")
const {meetingCreate , createMeeting , getAllMeeting , getSingleMeetingById , deleteMeetingById , availableSlots , getAllMeetings} = require("../controller/meetingController")


router.route("/meeting").post(isAuthenticatedUser , meetingCreate)

// router.route("/meetings").get( isAuthenticatedUser , getAllMeeting)

router.route("/meeting/me").get( isAuthenticatedUser , getAllMeetings)

router.route("/meeting/me/:id").get(isAuthenticatedUser , getSingleMeetingById)

router.route("/meeting/me/:id").delete(isAuthenticatedUser , deleteMeetingById)

// router.route("/meetings/availableSlot/:date").get(availableSlots)



module.exports = router