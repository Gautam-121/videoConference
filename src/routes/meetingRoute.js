const express = require("express");
const router = express.Router();
const { isAuthenticatedUser } = require("../middleware/auth");
const {
  meetingCreate,
  getSingleMeetingById,
  deleteMeetingById,
  getAllMeetings,
  updateMeeting,
  getMeetingRequest,
  getLiveMeetingCall,
  getUpcomingMeetingCall,
  availableSlotsForSalePerson,
  createMeetingBySalePerson
} = require("../controller/meetingController");

router.route("/meeting/customer").post(meetingCreate);

router.route("/meeting/saleperson").post(isAuthenticatedUser , createMeetingBySalePerson)


// router.route("/meetings").get( isAuthenticatedUser , getAllMeeting)

router.route("/meeting/me").get(isAuthenticatedUser, getAllMeetings);

router.route("/meeting/me/:id").get(isAuthenticatedUser, getSingleMeetingById);

router.route("/meeting/update/:id").put(isAuthenticatedUser, updateMeeting);

router.route("/meeting/me/:id").delete(isAuthenticatedUser, deleteMeetingById);

router.route("/meeting/getMeetingRequest").get(getMeetingRequest);

router.route("/meeting/liveCall").get(isAuthenticatedUser, getLiveMeetingCall);

router.route("/meeting/upcomingCall").get(isAuthenticatedUser, getUpcomingMeetingCall);

router.route("/meeting/availableSlot/saleperson/:date").get(isAuthenticatedUser, availableSlotsForSalePerson);



// router.route("/meetings/availableSlot/:date").get(availableSlots)

module.exports = router;
