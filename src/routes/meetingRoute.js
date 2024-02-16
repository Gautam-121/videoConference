const express = require('express')
const router = express.Router()
const {meetingCreate , createMeeting , getAllMeeting , getSingleMeetingById , deleteMeetingById , availableSlots} = require("../controller/meetingController")


router.route("/meeting").post(meetingCreate)

router.route("/meetings").get(getAllMeeting)

router.route("/meetings/:id").get(getSingleMeetingById)

router.route("/meetings/:id").delete(deleteMeetingById)

router.route("/meetings/availableSlot/:date").get(availableSlots)



module.exports = router