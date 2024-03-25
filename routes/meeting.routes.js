const express = require("express");
const router = express.Router();
const { isAuthenticatedUser } = require("../middleware/auth.middleware.js");
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
  createMeetingBySalePerson,
  availableSlotForCustomerRequest,
  instantMeetingAvaibillity
} = require("../controller/meeting.controller.js");

router.route("/customer").post(meetingCreate)

router.route("/saleperson").post(isAuthenticatedUser , createMeetingBySalePerson)

router.route("/me").get(isAuthenticatedUser, getAllMeetings);

router.route("/me/:id").get(isAuthenticatedUser, getSingleMeetingById);

router.route("/update/:id").put(isAuthenticatedUser, updateMeeting);

router.route("/me/:id").delete(isAuthenticatedUser, deleteMeetingById);

router.route("/getMeetingRequest").get(getMeetingRequest);

router.route("/liveCall").get(isAuthenticatedUser, getLiveMeetingCall);

router.route("/upcomingCall").get(isAuthenticatedUser, getUpcomingMeetingCall);

router.route("/availableSlot/saleperson/:date").get(isAuthenticatedUser, availableSlotsForSalePerson);

router.route("/availableSlot/scheduled/:date").get(availableSlotForCustomerRequest)

router.route("/availablePerson/instant/:organizationId").post(instantMeetingAvaibillity)


module.exports = router;
