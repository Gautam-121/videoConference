const MeetingModel = require("../models/meeting.model");
const { Op } = require("sequelize");
const ErrorHandler = require("../utils/errorHandler");
const {
  isDateGreterThanToday,
  isValidEmail,
  isValidEndTime,
  isValidPhone,
  isValidStartTime,
} = require("../utils/validation");
const moment = require("moment-timezone");
const SalesUserModel = require("../models/saleUser.model");
const { client } = require("../constant");
const asyncHandler = require("../utils/asyncHandler");
const {TIME_SLOT , START_TIME , END_TIME} = require("../constant.js")

// Customer request for video call request
const meetingCreate = asyncHandler(async (req, res, next) => {

  const { name, email, phone, seduledDate, start, end, organizationId } = req.body;

  if (
    [name, email, phone, seduledDate, start, end, organizationId].some((field) => field?.trim() == "")
  ) {
    return next(
      new ErrorHandler("Provide all neccessary field", 400)
    )
  }

  if (!isValidEmail(email)) {
    return next(
      new ErrorHandler("Invalid Email id", 400)
    );
  }

  if (!isValidPhone(phone)) {
    return next(
      new ErrorHandler("Invalid Phone Number", 400)
    );
  }

  if (!isDateGreterThanToday(seduledDate)) {
    return next(
      new ErrorHandler("Seduled date not less than today's date", 400)
    );
  }

  if (!isValidStartTime(start)) {
    return next(
      new ErrorHandler(
        "Startime of meeting should be greater than current time",
        400
      )
    );
  }

  if (!isValidEndTime(start, end)) {
    return next(
      new ErrorHandler(
        "endTime of meeting should not be less than startTime of meeting",
        400
      )
    );
  }

  const isMeetingExist = await MeetingModel.findOne({
    where: {
      email: email,
      seduledDate: moment.tz(seduledDate, "Asia/Kolkata").utc().format(
        "YYYY-MM-DDTHH:mm:ss.SSS[Z]"
      ),
    },
  });

  if (isMeetingExist) {
    return next(
      new ErrorHandler(
        `You have already send a video call Request on ${seduledDate} , Please select another day for seduling video call meeting`,
        400
      )
    );
  }

  const meeting = await MeetingModel.create({
    name,
    email,
    phone,
    organizationId,
    seduledDate: moment.tz(seduledDate, "Asia/Kolkata")
      .utc()
      .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
    start: moment.tz(start, "Asia/Kolkata")
      .utc()
      .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
    end: moment.tz(end, "Asia/Kolkata")
      .utc()
      .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
  });

  const meetingCreted = await MeetingModel.findByPk(meeting.id,{
    attributes:{
      exclude: ["videoCallLink" ,"meetingId", "salePersonId"]
    }
  })

  if (!meetingCreted) {
    return next(
      new ErrorHandler(
        "Something went wrong while creating a meeting", 
        500
      )
    )
  }

  return res.status(201).json({
    success: true,
    message: "Meeting seduled successfully",
    data: meetingCreted,
  });

})

// Create meeting by Sale person
const createMeetingBySalePerson = asyncHandler(async (req, res, next) => {
  
  const { name, email, phone, seduledDate, start, end, organizationId, videoCallLink, meetingId, } = req.body;

  if (
    [name, email, phone, seduledDate, start, end, organizationId,videoCallLink,meetingId].some((field) => field?.trim() == "")
  ) {
    return next(
      new ErrorHandler(
        "Provide all neccessary field", 
        400
      )
    )
  }

  if (!isValidEmail(email)) {
    return next(
      new ErrorHandler("Invalid Email id", 400)
    );
  }

  if (!isValidPhone(phone)) {
    return next(
      new ErrorHandler("Invalid Phone Number", 400)
    );
  }

  if (!isDateGreterThanToday(seduledDate)) {
    return next(
      new ErrorHandler("Seduled date not less than today's date", 400)
    );
  }

  if (!isValidStartTime(start)) {
    return next(
      new ErrorHandler(
        "Startime of meeting should be greater than current time",
        400
      )
    );
  }

  if (!isValidEndTime(start, end)) {
    return next(
      new ErrorHandler(
        "endTime of meeting should not be less than startTime of meeting",
        400
      )
    );
  }

  const isMeetingExisted = await MeetingModel.findOne({
    where: {
      email: email,
      seduledDate: moment.tz(seduledDate, "Asia/Kolkata")
        .utc()
        .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
    },
  });

  if (isMeetingExisted) {
    return next(
      new ErrorHandler(
        `You have already send a video call Request on ${seduledDate} , for ${email} , Please select another day for seduling video call meeting`,
        400
      )
    );
  }

  const meeting = await MeetingModel.create({
    name, 
    email, 
    phone, 
    organizationId,
    videoCallLink,
    meetingId,
    salePersonId: req.user.id,
    status: "confirmed",
    seduledDate: moment.tz(seduledDate, "Asia/Kolkata")
      .utc()
      .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
    start: moment.tz(start, "Asia/Kolkata")
      .utc()
      .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
    end: moment.tz(end, "Asia/Kolkata")
      .utc()
      .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
  });

  const meetingCreated = await MeetingModel.findByPk(meeting.id)

  if(!meetingCreated){
    return next(
      new ErrorHandler("Something Went Wrong while creating a meeting", 500)
    )
  }

  return res.status(201).json({
    success: true,
    message: "Meeting seduled successfully",
    data: meetingCreated,
  });

})

// Update meeting by salePerson
const updateMeeting = async (req, res, next) => {
  try {

    if (!req.params.id) {
      return next(
        new ErrorHandler("missing meeting id", 400)
      );
    }

    let meeting = await MeetingModel.findByPk(req.params.id);

    if (!meeting) {
      return next(
        new ErrorHandler("Meeting not found", 404)
      );
    }

    if (meeting.salePersonId && meeting.salePersonId !== req.user.id) {
      return next(
        new ErrorHandler("You are not authorized person for this resource", 403)
      );
    }

    if (!meeting.salePersonId) {
      const isMeetingAvailable = await MeetingModel.findOne({
        where: {
          seduledDate: meeting.seduledDate,
          start: meeting.start,
          end: meeting.end,
          salePersonId: req.user.id,
        },
      });

      if (isMeetingAvailable) {
        return next(
          new ErrorHandler(`You have already a meeting on that time`, 400)
        );
      }
    }

    if (req.body.seduledDate && (!req.body.start || !req.body.end)) {
      return next(
        new ErrorHandler("missing start and end time", 400)
      );
    }

    if (req.body.seduledDate) {
      if (!isDateGreterThanToday(req.body.seduledDate)) {
        return next(
          new ErrorHandler("Seduled date not less than today's date", 400)
        );
      }

      req.body.seduledDate = moment.tz(req.body.seduledDate, "Asia/Kolkata")
        .utc()
        .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    }

    if (req.body.start) {
      if (!isValidStartTime(req.body.start)) {
        return next(
          new ErrorHandler(
            "Startime of meeting should be greater than current time",
            400
          )
        );
      }
      req.body.start = moment.tz(req.body.start, "Asia/Kolkata")
        .utc()
        .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    }

    if (req.body.end) {
      if (!isValidEndTime(req.body.start, req.body.end)) {
        return next(
          new ErrorHandler(
            "endTime of meeting should not be less than startTime of meeting",
            400
          )
        );
      }
      req.body.end = moment.tz(req.body.end, "Asia/Kolkata")
        .utc()
        .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    }

    const [, updateMeeting] = await MeetingModel.update(
      {
        ...req.body,
        salePersonId: req.user.id,
        status: "confirmed",
      },
      {
        where: {
          id: req.params.id,
        },
        returning: true, // This option ensures that the updated data is returned
        plain: true, // This option ensures that the returned data is a plain object
      }
    );

    return res.status(201).json({
      success: true,
      message: "Meeting Updated successfully",
      data: updateMeeting,
    });
  } catch (error) {
    return next(
      new ErrorHandler(error.message, 500)
    );
  }
};

// get available slot of salePerson
const availableSlotsForSalePerson = asyncHandler(async (req, res, next) => {
  // Get the date from the request parameters
  const date = req.params.date;

  if (!date) {
    return next(new ErrorHandler("Date is missing", 400));
  }

  if (!isDateGreterThanToday(date)) {
    return next(
      new ErrorHandler("Seduled date not less than today's date", 400)
    );
  }

  // Define the start and end times for the given date
  const startTime = moment
    .tz(date, "Asia/Kolkata")
    .set({ hour: START_TIME, minute: 0, second: 0, millisecond: 0 })
    .utc()
    .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");

  const endTime = moment
    .tz(date, "Asia/Kolkata")
    .set({ hour: END_TIME, minute: 0, second: 0, millisecond: 0 })
    .utc()
    .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");

  // Get all meetings for the salesperson that are happening after the current time
  const meetings = await MeetingModel.findAll({
    where: {
      salePersonId: req.user.id,
      start: {
        [Op.gte]: startTime,
        [Op.lt]: endTime,
      },
    },
    order: [["start", "ASC"]], // Sort by start time in ascending order
  });

  // Create an array to store the available slots
  const availableSlots = [];

  // Get the current time
  const currentTime = moment.tz("Asia/Kolkata").utc();

  // Initialize the start time as the next half-hour slot after the current time
  let nextSlotTime = moment.tz("Asia/Kolkata").utc().set({
    hour: currentTime.hour(),
    minute: currentTime.minute(),
    second: 0,
    millisecond: 0,
  });

  // If current start time is less than START_TIME, set the start time to 10:00 AM
  if (nextSlotTime.hour() < START_TIME) {
    nextSlotTime = moment.tz(startTime, "Asia/Kolkata").utc();
  } else {
    nextSlotTime.add(
      TIME_SLOT - (nextSlotTime.minute() % TIME_SLOT),
      "minutes"
    );
  }

  // If the request is for today's date, use the current time as the start time
  if (!moment.tz(date, "Asia/Kolkata").isSame(currentTime, "day")) {
    nextSlotTime = moment.tz(startTime, "Asia/Kolkata").utc();
  }

  while (nextSlotTime.isBefore(endTime)) {
    const meetingAtSlot = meetings.find((meeting) =>
      moment(meeting.start).isSame(nextSlotTime)
    );

    if (!meetingAtSlot) {
      availableSlots.push(nextSlotTime.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"));
    }
    // Move to the Interval
    nextSlotTime.add(TIME_SLOT, "minutes");
  }

  return res.status(200).json({
    success: true,
    data: availableSlots,
  });
})

// Get meeting Requested by customer
const getMeetingRequest = asyncHandler(async (req, res, next) => {

  let meetings = await MeetingModel.findAll({
    where: {
      status: "pending",
    },
    attributes: { exclude: ['videoCallLink', 'meetingId', 'salePersonId'] }
  });

  if (meetings.length == 0) {
    return res.status(200).json({
      success: true,
      data: meetings,
    });
  }

  let uniqueStartTimes = new Map();

  meetings.forEach((meet) => {
    uniqueStartTimes.set(meet.start.toISOString(), meet);
  });

  let uniqueMeetings = Array.from(uniqueStartTimes.values());

  return res.status(200).json({
    success: true,
    message: "Data fetch Successfully",
    data: uniqueMeetings,
  });
})

// get Live meeting Call byy SalePerson
const getLiveMeetingCall = asyncHandler(async (req, res, next) => {

  const currentTime = moment.tz("Asia/Kolkata").utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");

  const liveCalls = await MeetingModel.findOne({
    where: {
      salePersonId: req.user.id,
      start: {
        [Op.lte]: currentTime,
      },
      end: {
        [Op.gte]: currentTime,
      },
    },
  });

  return res.status(200).json({
    success: true,
    message: "Data send successfully",
    data: liveCalls,
  });
})
// Get just upcoming video call
const getUpcomingMeetingCall = asyncHandler( async (req, res, next) => {

  const currentTime = moment.tz("Asia/Kolkata").utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");

  const upcomingCalls = await MeetingModel.findAll({
    where: {
      salePersonId: req.user.id,
      start: {
        [Op.gt]: currentTime,
      },
    },
    order: [["start", "ASC"]], // Sort by start time in ascending order
    limit: 2, // Limit the number of results to 1
  });

  return res.status(200).json({
    success: true,
    data: upcomingCalls,
  });
})

// Get All meetings by salePerson
const getAllMeetings = asyncHandler(async (req, res, next) => {

  const meetingSearchQuery = {
    where: {
      salePersonId: req.user.id,
      status: "confirmed",
    },
    order: [["start", "ASC"]], // Sort by start time in ascending order
  };

  if (req.query?.date) {
    meetingSearchQuery.where.seduledDate = {
      [Op.eq]: moment.tz(req.query.date, "Asia/Kolkata")
        .utc()
        .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
    };
  }

  const meetings = await MeetingModel.findAll(meetingSearchQuery);

  return res.status(200).json({
    success: true,
    message: "Data send Successfully",
    data: meetings,
  });
})

// Get a specific meeting by ID with assign salePerson
const getSingleMeetingById = asyncHandler(async (req, res, next) => {

  if (!req.params.id) {
    return next(
      new ErrorHandler("Missing Meeting id", 400)
    );
  }

  const meeting = await MeetingModel.findOne({
    where: {
      id: req.params.id,
      salePersonId: req.user.id,
    },
  });

  if (!meeting) {
    return next(
      new ErrorHandler("Meeting not found", 400)
    );
  }

  return res.status(200).json({
    success: true,
    message: "Data send Successfully",
    data: meeting,
  });
})

// Delete a meeting by salePerson
const deleteMeetingById = asyncHandler(async (req, res) => {

  if (!req.params.id) {
    return next(
      new ErrorHandler("Missing Meeting Id", 400)
    );
  }

  const meeting = await MeetingModel.findOne({
    where: {
      id: req.params.id,
      salePersonId: req.user.id,
    },
  });

  if (!meeting) {
    return res.status(404).json({
      success: false,
      message: "Meeting not found",
    });
  }

   await MeetingModel.destroy({
    where: {
      id: req.params.id,
    },
  });

  return res.status(200).json({
    success: true,
    message: "Meeting Deleted Successfully",
  });
})

const availableSlotForCustomerRequest = asyncHandler(async (req, res, next) => {

  const {date , organizationId} = req.params

  if (!date) {
    return next(
      new ErrorHandler("Date is missing", 400)
    );
  }

  if (!organizationId) {
    return next(
      new ErrorHandler("OrganizationId is missing", 400)
    );
  }

  if (!isDateGreterThanToday(date)) {
    return next(
      new ErrorHandler("Seduled date not less than today's date", 400)
    );
  }

  // Define the start and end times for the given date
  const startTime = moment.tz(date, "Asia/Kolkata")
    .set({ hour: START_TIME, minute: 0, second: 0, millisecond: 0 })
    .utc()
    .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");

  const endTime = moment.tz(date, "Asia/Kolkata")
    .set({ hour: END_TIME, minute: 0, second: 0, millisecond: 0 })
    .utc()
    .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");

  // Get all meetings that are happening after the current time
  const meetings = await MeetingModel.findAll({
    where: {
      start: {
        [Op.gte]: startTime,
        [Op.lt]: endTime,
      },
      organizationId: organizationId,
    },
    order: [["start", "ASC"]], // Sort by start time in ascending order
  });

  // Get All SalesPerson
  const salePersons = await SalesUserModel.findAll({
    where: {
      organizationId: organizationId,
    },
  });

  if (salePersons.length == 0) {
    return next(
      new ErrorHandler("No salePerson Register with OrganizationId", 400)
    );
  }

  // Create an Set to store the unique available slots
  const availableSlots = new Set();

  // Get the current time
  const currentTime = moment.tz("Asia/Kolkata").utc();

  // Initialize the start time as the next half-hour slot after the current time
  let nextSlotTime = moment.tz("Asia/Kolkata")
    .utc()
    .set({
      hour: currentTime.hour(),
      minute: currentTime.minute(),
      second: 0,
      millisecond: 0,
    });

    // If current start time is less than START_TIME, set the start time to 10:00 AM
  if (nextSlotTime.hour() < START_TIME) {
    nextSlotTime = moment.tz(startTime, "Asia/Kolkata").utc();
  } else {
    nextSlotTime.add(
      TIME_SLOT - (nextSlotTime.minute() % TIME_SLOT),
      "minutes"
    );
  }

  // If the request is for today's date, use the current time as the start time
  if (!moment.tz(date, "Asia/Kolkata").isSame(currentTime, "day")) {
    nextSlotTime = moment.tz(startTime, "Asia/Kolkata").utc();
  }

  salePersons.forEach((salePerson) => {
    while (nextSlotTime.isBefore(endTime)) {
      const meetingBySalePerson = meetings.filter(
        (meeting) => meeting.salePersonId === salePerson.id
      );

      const meetingAtSlot = meetingBySalePerson.find((meeting) =>
        moment(meeting.start).isSame(nextSlotTime)
      );

      if (!meetingAtSlot) {
        availableSlots.add(nextSlotTime.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"));
      }
      // Move to the Interval
      nextSlotTime.add(TIME_SLOT, "minutes");
    }

    nextSlotTime = moment.tz("Asia/Kolkata")
      .utc()
      .set({
        hour: currentTime.hour(),
        minute: currentTime.minute(),
        second: 0,
        millisecond: 0,
      });

    nextSlotTime.add(TIME_SLOT- (nextSlotTime.minute() % TIME_SLOT), "minutes");

    // If the request is for today's date, use the current time as the start time
    if (!moment.tz(date, "Asia/Kolkata").isSame(currentTime, "day")) {
      nextSlotTime = moment.tz(startTime, "Asia/Kolkata").utc();
    }
  });

  let uniqueMeetings = Array.from(availableSlots.values());

  return res.status(200).json({
    success: true,
    data: uniqueMeetings,
  });
})

const instantMeetingAvaibillity = asyncHandler( async (req, res, next) => {

  const { name, email, phone, videoCallLink, meetingId } = req.body;

  if (!req.params.organizationId) {
    return next(
      new ErrorHandler("OrganizationId is Missing", 400)
    );
  }

  if (
    [name, email, videoCallLink, phone, meetingId].some(
      (field) => field?.trim() == ""
    )
  ) {
    return next(new ErrorHandler("Please provide all necessary fields", 400));
  }

  const salePersons = await SalesUserModel.findAll({
    where: {
      organizationId: req.params.organizationId,
    },
  });

  if (salePersons.length == 0) {
    return next(
      new ErrorHandler("No one Register in this OrganizationId", 400)
    );
  }

  // Get the current time
  const currentTime = moment.tz("Asia/Kolkata").utc();

  // Define the threshold time (5:30 PM) in Asia/Kolkata timezone
  const thresholdTime = moment.tz("17:45", "HH:mm:ss", "Asia/Kolkata").utc();


  if (currentTime >= thresholdTime) {
    return next(
      new ErrorHandler(
        "All slots for today have been filled. Please select the next available day to schedule a meeting.",
        400
      )
    );
  }

  // Initialize the start time as the next half-hour slot after the current time
  let nextSlotStartTime = moment.tz("Asia/Kolkata").utc().set({
    hour: currentTime.hour(),
    minute: currentTime.minute(),
    second: 0,
    millisecond: 0,
  });

   // If current start time is less than START_TIME, set the start time to 10:00 AM
   if (nextSlotStartTime.hour() < START_TIME) {
    return next(
      new ErrorHandler(`Meeting time is between ${START_TIME} to ${END_TIME}`, 400)
    )
   } 

  

  nextSlotStartTime.add(TIME_SLOT - (nextSlotStartTime.minute() % TIME_SLOT), "minutes");

  // Calculate the end time by adding TIME_SSLOT minutes to the start time
  let nextSlotEndTime = moment(nextSlotStartTime).add(TIME_SLOT, "minutes");

  let meetings = await MeetingModel.findAll({
    where: {
      organizationId: req.params.organizationId,
      start: nextSlotStartTime,
      end: nextSlotEndTime,
    },
  });

  if (meetings.length === salePersons.length) {
    return next(
      new ErrorHandler(
        "All salespersons are currently engaged in other meetings. Please try again later or schedule your meeting for another time.",
        400
      )
    );
  }

  let availablePerson;

  if (meetings.length != 0) {
    availablePerson = salePersons.filter((salePerson) => {
      return !meetings.some(
        (meeting) => meeting.salePersonId === salePerson.id
      );
    });
  } else {
    availablePerson = salePersons;
  }

  // Define the start and end times for the given date
  const startTime = moment.tz("Asia/Kolkata")
    .set({ hour: START_TIME, minute: 0, second: 0, millisecond: 0 })
    .utc()
    .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");

  const endTime = moment.tz("Asia/Kolkata")
    .set({ hour: END_TIME, minute: 0, second: 0, millisecond: 0 })
    .utc()
    .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");

  meetings = await MeetingModel.findAll({
    where: {
      start: {
        [Op.gte]: startTime,
        [Op.lt]: endTime,
      },
      organizationId: req.params.organizationId,
      salePersonId: {
        [Op.in]: availablePerson.map((available) => available.id), // Include all meetings with either salePersonId1 or salePersonId2
      },
    },
  });

  let count = Number.MAX_VALUE;
  let assignPerson;

  availablePerson.forEach((available) => {
    const meeting = meetings.filter(
      (meet) => meet.salePersonId == available.id
    );

    if (meeting.length <= count) {
      count = meeting.length;
      assignPerson = available;
    }
  });

  const meeting = await MeetingModel.create({
    name, 
    email, 
    phone, 
    videoCallLink, 
    meetingId,
    salePersonId: assignPerson.id,
    seduledDate: moment().tz("Asia/Kolkata").startOf('day').utc(),
    start: nextSlotStartTime,
    end: nextSlotEndTime,
    status: "confirmed",
    organizationId: req.params.organizationId
  });

  if(!meeting){
    return next(
      new ErrorHandler(
        "Something went wrong while finding available salePerson for instant meeting",
        500
      )
    )
  }

  const topic = `${assignPerson.name}/${assignPerson.id}`;
  const message = `${name} is requesting for an instant meeting now , click here to join ${meeting.videoCallLink}`;

  console.log(message , `The meeting assigned to ${assignPerson.email}`)

  // Check if MQTT client is connected before publishing
  try {
    if (client.connected) {
      client.publish(topic, message, (err) => {
        if (err) {
          console.error('Error publishing message:', err);
          return res.status(500).json({ error: 'Failed to publish message' });
        } else {
          console.log('Message published successfully');
          return res.status(200).json({
            success: true,
            message: "A salesperson is available for an instant meeting.",
            meetingUrl: meeting.videoCallLink
          });
        }
      });
    } else {
      console.error('MQTT client is not connected');
      return res.status(500).json({ error: 'MQTT client is not connected' });
    }
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
})

module.exports = {
  meetingCreate,
  updateMeeting,
  getAllMeetings,
  getSingleMeetingById,
  deleteMeetingById,
  getMeetingRequest,
  getLiveMeetingCall,
  getUpcomingMeetingCall,
  availableSlotsForSalePerson,
  createMeetingBySalePerson,
  availableSlotForCustomerRequest,
  instantMeetingAvaibillity,
};
