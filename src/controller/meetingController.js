const MeetingModel = require("../models/meetingModel");
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
const SalesUserModel = require("../models/salesUserModel");

// Customer request for video call
const meetingCreate = async (req, res, next) => {
  try {
    const { name, email, phone, seduledDate, start, end, organizationId } =
      req.body;

    if (
      !name ||
      !email ||
      !phone ||
      !seduledDate ||
      !start ||
      !end ||
      !organizationId
    ) {
      return next(new ErrorHandler("Provide all neccessary field", 400));
    }

    if (!isValidEmail(email)) {
      return next(new ErrorHandler("Invalid Email id", 400));
    }

    if (!isValidPhone(phone)) {
      return next(new ErrorHandler("Invalid Phone Number", 400));
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

    const isExist = await MeetingModel.findOne({
      where: {
        email: email,
        seduledDate: moment
          .tz(seduledDate, "Asia/Kolkata")
          .utc()
          .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
      },
    });

    if (isExist) {
      return next(
        new ErrorHandler(
          `You have already send a video call Request on ${seduledDate} , Please select another day for seduling video call meeting`,
          400
        )
      );
    }

    const meeting = await MeetingModel.create({
      ...req.body,
      seduledDate: moment
        .tz(req.body.seduledDate, "Asia/Kolkata")
        .utc()
        .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
      start: moment
        .tz(req.body.start, "Asia/Kolkata")
        .utc()
        .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
      end: moment
        .tz(req.body.end, "Asia/Kolkata")
        .utc()
        .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
    });

    return res.status(201).json({
      success: true,
      message: "Meeting seduled successfully",
      data: meeting,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};

// Create meeting by Sale person
const createMeetingBySalePerson = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      seduledDate,
      start,
      end,
      organizationId,
      videoCallLink,
      meetingId,
    } = req.body;

    if (
      !name ||
      !email ||
      !phone ||
      !seduledDate ||
      !start ||
      !end ||
      !organizationId ||
      !videoCallLink ||
      !meetingId
    ) {
      return next(new ErrorHandler("Provide all neccessary field", 400));
    }

    if (!isValidEmail(email)) {
      return next(new ErrorHandler("Invalid Email id", 400));
    }

    if (!isValidPhone(phone)) {
      return next(new ErrorHandler("Invalid Phone Number", 400));
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

    const isExist = await MeetingModel.findOne({
      where: {
        email: email,
        seduledDate: moment
          .tz(seduledDate, "Asia/Kolkata")
          .utc()
          .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
      },
    });

    if (isExist) {
      return next(
        new ErrorHandler(
          `You have already send a video call Request on ${seduledDate} , Please select another day for seduling video call meeting`,
          400
        )
      );
    }

    const meeting = await MeetingModel.create({
      ...req.body,
      seduledDate: moment
        .tz(seduledDate, "Asia/Kolkata")
        .utc()
        .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
      start: moment
        .tz(start, "Asia/Kolkata")
        .utc()
        .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
      end: moment
        .tz(end, "Asia/Kolkata")
        .utc()
        .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
      salePersonId: req.user.id,
      status: "confirmed",
    });

    return res.status(201).json({
      success: true,
      message: "Meeting seduled successfully",
      data: meeting,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};

// Update meeting by salePerson
const updateMeeting = async (req, res, next) => {
  try {
    if (!req.params.id) {
      return next(new ErrorHandler("missing meeting id", 400));
    }

    let meeting = await MeetingModel.findByPk(req.params.id);

    if (!meeting) {
      return next(new ErrorHandler("Meeting not found", 404));
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
      return next(new ErrorHandler("missing start and end time", 400));
    }

    if (req.body.seduledDate) {
      if (!isDateGreterThanToday(req.body.seduledDate)) {
        return next(
          new ErrorHandler("Seduled date not less than today's date", 400)
        );
      }
      req.body.seduledDate = moment
        .tz(req.body.seduledDate, "Asia/Kolkata")
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
      req.body.start = moment
        .tz(req.body.start, "Asia/Kolkata")
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
      req.body.end = moment
        .tz(req.body.end, "Asia/Kolkata")
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
    return next(new ErrorHandler(error.message, 500));
  }
};

// get available slot of salePerson
const availableSlotsForSalePerson = async (req, res, next) => {
  try {
    if (!req.params.date) {
      return next(new ErrorHandler("Date is missing", 400));
    }

    // Get the date from the request parameters
    const date = req.params.date;

    if (!isDateGreterThanToday(date)) {
      return next(
        new ErrorHandler("Seduled date not less than today's date", 400)
      );
    }

    // Define the start and end times for the given date
    const startTime = moment
      .tz(date, "Asia/Kolkata")
      .set({ hour: 10, minute: 0, second: 0, millisecond: 0 })
      .utc()
      .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    const endTime = moment
      .tz(date, "Asia/Kolkata")
      .set({ hour: 18, minute: 0, second: 0, millisecond: 0 })
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
    let nextSlotTime = moment
      .tz("Asia/Kolkata")
      .utc()
      .set({
        hour: currentTime.hour(),
        minute: currentTime.minute(),
        second: 0,
        millisecond: 0,
      });
    nextSlotTime.add(30 - (nextSlotTime.minute() % 30), "minutes");

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
      nextSlotTime.add(30, "minutes");
    }

    return res.status(200).json({
      success: true,
      data: availableSlots,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
};

// Get meeting Requested by customer
const getMeetingRequest = async (req, res, next) => {
  try {
    let meetings = await MeetingModel.findAll({
      where: {
        status: "pending",
      },
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
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};

// get Live meeting Call
const getLiveMeetingCall = async (req, res, next) => {
  try {
    const currentTime = moment
      .tz("Asia/Kolkata")
      .utc()
      .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");

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
  } catch (error) {
    next(new ErrorHandler(error.message, 500));
  }
};

// Get just upcoming video call
const getUpcomingMeetingCall = async (req, res, next) => {
  try {
    const currentTime = moment
      .tz("Asia/Kolkata")
      .utc()
      .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");

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
  } catch (error) {
    next(new ErrorHandler(error.message, 500));
  }
};

// Get All meetings by salePerson
const getAllMeetings = async (req, res, next) => {
  try {
    const meetingSearchQuery = {
      where: {
        salePersonId: req.user.id,
        status: "confirmed",
      },
      order: [["start", "ASC"]], // Sort by start time in ascending order
    };

    if (req.query?.date) {
      meetingSearchQuery.where.seduledDate = {
        [Op.eq]: moment
          .tz(req.query.date, "Asia/Kolkata")
          .utc()
          .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
      };
    }

    const meetings = await MeetingModel.findAll(meetingSearchQuery);

    // if (meetings.length > 1) {
    //   meetings.sort((a, b) => {
    //     const dateA = new Date(a.seduledDate);
    //     const dateB = new Date(b.seduledDate);
    //     return dateA - dateB;
    //   });
    // }

    return res.status(200).json({
      success: true,
      message: "Data send Successfully",
      data: meetings,
    });

    // Arranged The meeting according to date;
    const mapWithDate = new Map();

    meetings.forEach((meeting) => {
      const date = new Date(meeting.seduledDate).toISOString().slice(0, 10); // Convert to 'YYYY-MM-DD' format

      if (mapWithDate.has(date)) {
        mapWithDate.get(date).push(meeting); // If the date already exists in the map, append the value to its array
      } else {
        mapWithDate.set(date, [meeting]); // Otherwise, create a new array with the value
      }
    });

    const result = [];
    for (const [time, list] of mapWithDate) {
      result.push({
        date: time,
        list: list,
      });
    }

    if (result.length > 1) {
      result.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB;
      });
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};

// Get a specific meeting by ID with assign salePerson
const getSingleMeetingById = async (req, res, next) => {
  try {
    if (!req.params.id) {
      return next(new ErrorHandler("Missing Meeting id", 400));
    }

    const meeting = await MeetingModel.findOne({
      where: {
        id: req.params.id,
        salePersonId: req.user.id,
      },
    });

    if (!meeting) {
      return next(new ErrorHandler("Meeting not found", 400));
    }

    return res.status(200).json({
      success: true,
      message: "Data send Successfully",
      data: meeting,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};

// Delete a meeting
const deleteMeetingById = async (req, res) => {
  try {
    if (!req.params.id) {
      return next(new ErrorHandler("Missing Meeting Id", 400));
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const availableSlotForCustomerRequest = async (req, res, next) => {
  try {
    if (!req.params.date) {
      return next(new ErrorHandler("Date is missing", 400));
    }

    if (!req.query.organizationId) {
      return next(new ErrorHandler("OrganizationId is missing", 400));
    }

    // Get the date from the request parameters
    const date = req.params.date;

    if (!isDateGreterThanToday(date)) {
      return next(
        new ErrorHandler("Seduled date not less than today's date", 400)
      );
    }

    // Define the start and end times for the given date
    const startTime = moment
      .tz(date, "Asia/Kolkata")
      .set({ hour: 10, minute: 0, second: 0, millisecond: 0 })
      .utc()
      .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    const endTime = moment
      .tz(date, "Asia/Kolkata")
      .set({ hour: 18, minute: 0, second: 0, millisecond: 0 })
      .utc()
      .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");

    // Get all meetings that are happening after the current time
    const meetings = await MeetingModel.findAll({
      where: {
        start: {
          [Op.gte]: startTime,
          [Op.lt]: endTime,
        },
        organizationId: req.query.organizationId,
      },
      order: [["start", "ASC"]], // Sort by start time in ascending order
    });

    // Get All SalesPerson
    const salePersons = await SalesUserModel.findAll({
      where: {
        organizationId: req.query.organizationId,
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
    let nextSlotTime = moment
      .tz("Asia/Kolkata")
      .utc()
      .set({
        hour: currentTime.hour(),
        minute: currentTime.minute(),
        second: 0,
        millisecond: 0,
      });
    nextSlotTime.add(30 - (nextSlotTime.minute() % 30), "minutes");

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
        nextSlotTime.add(30, "minutes");
      }

      nextSlotTime = moment
        .tz("Asia/Kolkata")
        .utc()
        .set({
          hour: currentTime.hour(),
          minute: currentTime.minute(),
          second: 0,
          millisecond: 0,
        });
      nextSlotTime.add(30 - (nextSlotTime.minute() % 30), "minutes");

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
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};

const instantMeetingAvaibillity = async (req, res, next) => {
  try {

    if (!req.params.organizationId) {
      return next(new ErrorHandler("OrganizationId is Missing", 400));
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
    nextSlotStartTime.add(30 - (nextSlotStartTime.minute() % 30), "minutes");

    // Calculate the end time by adding 30 minutes to the start time
    let nextSlotEndTime = moment(nextSlotStartTime).add(30, "minutes")

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
    const startTime = moment.tz("Asia/Kolkata").set({ hour: 10, minute: 0, second: 0, millisecond: 0 }).utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    const endTime = moment.tz("Asia/Kolkata").set({ hour: 18, minute: 0, second: 0, millisecond: 0 }).utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");

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

    return res.status(200).json({
      success: true,
      message: "Salesperson is available to take instant meetings.",
      assignPerson,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};

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
