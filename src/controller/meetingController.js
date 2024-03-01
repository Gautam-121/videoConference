const MeetingModel = require("../models/meetingModel");
const { Op } = require("sequelize");
const ErrorHandler = require("../utils/errorHandler");
const ApiFeatures = require("../utils/apiFeatures");
const {
  isDateGreterThanToday,
  isValidEmail,
  isValidEndTime,
  isValidPhone,
  isValidStartTime
} = require("../utils/validation");
const UserModel = require("../models/userModel");
const moment = require('moment-timezone');


const createMeeting = async (req, res, next) => {
  try {
    const { topic, meetingId, scheduledDate, startTime, endTime } = req.body;

    if (!topic || !meetingId || !scheduledDate || !startTime || !endTime) {
      return next(new ErrorHandler("Provide all Neccessary Fields", 400));
    }

    const isMeetingIdExist = await MeetingModel.findOne({
      where: { meetingId },
    });

    if (isMeetingIdExist) {
      return next(new ErrorHandler("MeetingId Already Exist", 400));
    }

    if (!isValidDate(scheduledDate)) {
      return next(
        new ErrorHandler("Invalid date format, date must be In YYYY-MM-DD", 400)
      );
    }

    if (!isTimeGreaterThanCurrent(scheduledDate, startTime)) {
      return next(
        new ErrorHandler(
          "Time slot fot start is must be greter than current time",
          400
        )
      );
    }

    if (!isEndTimeGreaterThanStart(scheduledDate, startTime, endTime)) {
      return next(
        new ErrorHandler(
          "Time slot for end is mut be greater than start time slot",
          400
        )
      );
    }

    const meeting = await MeetingModel.create({ ...req.body, host: 12345 });

    return res.status(200).json({
      success: true,
      message: "Meeting Created Successfully",
      meeting,
    });
  } catch (error) {
    return next(new ErrorHandler(error, 500));
  }
};

const getAllMeeting = async (req, res, next) => {
  try {
    //Fetch query according to condition Object
    const filterMeetings = {
      where: {
        hostId: 123445,
      },
    };

    if(req.query.startDate && req.query.endDate) {
      filterMeetings.where.scheduledDate = {
        [Op.between]: [
          req.query.startDate + "T00:00:00.000Z",
          req.query.endDate + "T00:00:00.000Z",
        ],
      };
    }

    // Pagination and Skip in Meeting Pages
    const resultPerPage = Number(req.query.pageSize) || 15;
    const currentPage = Number(req.query.page) || 1;
    const skip = resultPerPage * (currentPage - 1);

    const meetings = await MeetingModel.findAll({
      ...filterMeetings,
      offset: skip,
      limit: resultPerPage,
    });

    if(meetings.length == 0) {
      return res.status(200).json({
        success: true,
        data: meetings,
      });
    }

    // Arranged The meeting according to date;
    const mapWithDate = new Map();

    meetings.forEach((meeting) => {
      const date = new Date(meeting.scheduledDate).toISOString().slice(0, 10); // Convert to 'YYYY-MM-DD' format
      if (mapWithDate.has(date)) {
        mapWithDate.get(date).push(meeting); // If the date already exists in the map, append the value to its array
      } else {
        mapWithDate.set(date, [meeting]); // Otherwise, create a new array with the value
      }
    });

    const result = [];
    for (const [time, list] of mapWithDate) {
      result.push({
        time: time,
        list: list,
      });
    }

    if (result.length == 1) {
      const todayDate = new Date().toISOString().slice(0, 10);
      if (result[0].time === todayDate) {
        result[0].time = "today";
      }
      return res.status(200).json({
        success: true,
        data: result,
      });
    }

    if (result.length > 1) {
      result.sort((a, b) => {
        const dateA = new Date(a.time);
        const dateB = new Date(b.time);

        return dateA - dateB;
      });
    }

    result.forEach((date) => {
      const todayDate = new Date().toISOString().slice(0, 10);
      if (date.time === todayDate) {
        date.time = "today";
      }
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};

const getMeetingBySearch = async (req , res , next)=>{
  try {
    
  } catch (error) {
    return next(new ErrorHandler(error.message , 500))
  }
}

const availableSlots = async (req , res , next)=>{
  try {

    console.log("Enter")

    const date = new Date(req.params.date);
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() , 10, 0, 0);
    const endOfDay =   new Date(date.getFullYear(), date.getMonth(), date.getDate(), 19, 0, 0);

    console.log("date" , date)
    console.log("startOfDay" , startOfDay)
    console.log("endOfDay" , endOfDay)
    
  // Get all meetings scheduled on the given date
const meetings = await MeetingModel.findAll({
  where: {
    scheduledDateTime: {
      [Op.gte]: startOfDay,
      [Op.lt]: endOfDay
    },
    status: {
      [Op.in]: ['pending', 'confirmed']
    },
  },
  include: {
    model: UserModel,
    as: 'teamMember',
    where: { role: 'host' },
  },
});

console.log("Meetings of host" , meetings)

// return res.status(200).json({
//   success: true,
//   data: meetings
// })

// Get all team members with the role 'host'
const teamMembers = await UserModel.findAll({
  where: { 
    role: 'host'
  }
});
    // Determine the available slots
    const availableSlots = [];
    let currentSlot = startOfDay;

    while (currentSlot < endOfDay) {
      const meetingAtSlot = meetings.find(meeting => meeting.scheduledDateTime.getTime() === currentSlot.getTime());
      if (!meetingAtSlot) {
        availableSlots.push(currentSlot);
      }
      currentSlot = new Date(currentSlot.getTime() + 30 * 60 * 1000); // Increment by 30 minutes
    }

    res.json(availableSlots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

const availableSlotsForSalePerson = async (req , res , next)=>{
  try {

    if (!req.params.date) {
      return next(new ErrorHandler("Date is missing", 400));
    }

    // Get the date from the request parameters
    const date = req.params.date;

    console.log("date" , date)
    moment.tz(req.query.date, 'Asia/Kolkata').utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')

    // Define the start and end times for the given date
    const startTime = moment.tz(date, 'Asia/Kolkata').set({ hour: 10, minute: 0, second: 0, millisecond: 0 }).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
    const endTime = moment.tz(date, 'Asia/Kolkata').set({ hour: 18, minute: 0, second: 0, millisecond: 0 }).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');




    console.log("startTime" , startTime , "  " , endTime)

    // Get all meetings for the salesperson that are happening after the current time
    const meetings = await MeetingModel.findAll({
      where: {
        salePersonId: req.user.id,
        start: {
          [Op.gte]: startTime,
          [Op.lt]: endTime
        }
      },
      order: [['start', 'ASC']] // Sort by start time in ascending order
    });

    // Create an array to store the available slots
    const availableSlots = [];

    // Get the current time
    const currentTime = moment.tz('Asia/Kolkata').utc();

    console.log("currentTime" , currentTime)

    // Initialize the start time as the next half-hour slot after the current time
    let nextSlotTime = moment.tz('Asia/Kolkata').utc().set({ hour: currentTime.hour(), minute: currentTime.minute(), second: 0, millisecond: 0 });
    nextSlotTime.add(30 - nextSlotTime.minute() % 30, 'minutes');


    console.log("nextTimeSlot" ,  nextSlotTime)


    while (nextSlotTime.isBefore(endTime)) {
      const meetingAtSlot = meetings.find(meeting => moment(meeting.start).isSame(nextSlotTime));
      if (!meetingAtSlot) {
        availableSlots.push(nextSlotTime.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'));
      }
       // Move to the next hour
       nextSlotTime.add(30, 'minutes');
    }

    // // Iterate through the meetings
    // meetings.forEach((meeting, index) => {

    //   // Calculate the end time of the meeting
    //   const endTime = moment(meeting.start);

    //   // If there's a gap between the current time and the meeting
    //   if (currentTime.isBefore(endTime)) {
    //     // Add the available slot to the list
    //     availableSlots.push({
    //       start: currentTime.toISOString(),
    //       end: endTime.toISOString()
    //     });
    //   }

    //   // Update the current time to the end time of the meeting
    //   currentTime = moment(meeting.end);
    // });

    // // If there's a gap between the last meeting and the end of the day
    // if (currentTime.isBefore(endTime)) {
    //   // Add the available slot to the list
    //   availableSlots.push({
    //     start: currentTime.toISOString(),
    //     end: endTime.toISOString()
    //   });
    // }

    return res.status(200).json({
      success: true,
      data: availableSlots
    });

  } catch (error) {
    return next(new ErrorHandler(error.message , 400))
  }
}

// Customer request for video call
const meetingCreate = async(req,res,next)=>{
  try {

    const {name ,email , phone , seduledDate , start , end , organizationId} = req.body

    if(!name || !email || !phone || !seduledDate || !start || !end || !organizationId){
      return next(new ErrorHandler("Provide all neccessary field" , 400))
    }

    if(!isValidEmail(email)){
      return next(new ErrorHandler("Invalid Email id" , 400))
    }

    if(!isValidPhone(phone)){
      return next(new ErrorHandler("Invalid Phone Number" , 400))
    }

    if(!isDateGreterThanToday(seduledDate)){
      return next(new ErrorHandler("Seduled date not less than today's date",400))
    }

    if(!isValidStartTime(start)){
      return next(new ErrorHandler("Startime of meeting should be greater than current time",400))
    }

    if(!isValidEndTime(start , end)){
      return next(new ErrorHandler("endTime of meeting should not be less than startTime of meeting",400))
    }

    const isExist =  await MeetingModel.findOne({
      where:{
        email:email,
        seduledDate:moment.tz(seduledDate, 'Asia/Kolkata').utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
      }
    })

    if(isExist){
      return next(new ErrorHandler(`You have already send a video call Request on ${seduledDate} , Please select another day for seduling video call meeting` , 400))
    }

    const meeting  = await MeetingModel.create({
      ...req.body,
      seduledDate:moment.tz(req.body.seduledDate, 'Asia/Kolkata').utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
      start:moment.tz(req.body.start, 'Asia/Kolkata').utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
      end:moment.tz(req.body.end, 'Asia/Kolkata').utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
    })

    return res.status(201).json({
      success: true,
      message: "Meeting seduled successfully",
      data : meeting
    })

  } catch (error) {
    return next(new ErrorHandler(error.message,500))
  }
}

// Get meeting Requested by customer
const getMeetingRequest = async(req,res,next)=>{
  try {

    let meetings = await MeetingModel.findAll({
      where:{
        status: "pending"
      }
    })

    if(meetings.length==0){
      return res.status(200).json({
        success: true,
        data: meetings
      })
    }

    let uniqueStartTimes = new Map()

    meetings.forEach(meet => {
      uniqueStartTimes.set(meet.start.toISOString(), meet)
    })

    let uniqueMeetings = Array.from(uniqueStartTimes.values())

    return res.status(200).json({
      success: true,
      message: "Data fetch Successfully",
      data: uniqueMeetings
    })
    
  } catch (error) {
    return next(new ErrorHandler(error.message , 500))
  }
}

// get Live meeting Call
const getLiveMeetingCall = async (req, res, next) => {
  try {

    const currentTime = moment.tz('Asia/Kolkata').utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');

    const liveCalls = await MeetingModel.findOne({
      where: {
        salePersonId: req.user.id,
        start: {
          [Op.lte]: currentTime
        },
        end: {
          [Op.gte]: currentTime
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: "Data send successfully",
      data: liveCalls
    })
  } catch (error) {
    next(new ErrorHandler(error.message, 500));
  }
}

// Get just upcoming video call
const getUpcomingMeetingCall = async (req, res, next) => {
  try {

    const currentTime = moment.tz('Asia/Kolkata').utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');

    const upcomingCalls = await MeetingModel.findAll({
      where: {
        salePersonId: req.user.id,
        start: {
          [Op.gt]: currentTime
        }
      },
      order: [['start', 'ASC']], // Sort by start time in ascending order
      limit: 2 // Limit the number of results to 1
    });

    return res.status(200).json({
      success: true,
      data: upcomingCalls
    })

  } catch (error) {
    next(new ErrorHandler(error.message, 500));
  }
}

// Update meeting by salePerson
const updateMeeting = async(req,res,next)=>{
  try {

    if(!req.params.id){
      return next(new ErrorHandler("missing meeting id", 400))
    }

    let meeting = await MeetingModel.findByPk(req.params.id)

    if(!meeting){
      return next(new ErrorHandler("Meeting not found",404))
    }

    if(meeting.salePersonId && meeting.salePersonId !== req.user.id){
      return next(new ErrorHandler("You are not authorized person for this resource",403))
    }

    if(req.body.seduledDate && (!req.body.start || !req.body.end)){
        return next(new ErrorHandler("missing start and end time",400))
    }

    if(req.body.seduledDate){
      if(!isDateGreterThanToday(req.body.seduledDate)){
        return next(new ErrorHandler("Seduled date not less than today's date",400))
      }
    }

    if(req.body.start){
      if(!isValidStartTime(req.body.start)){
        return next(new ErrorHandler("Startime of meeting should be greater than current time",400))
      }  
    }

    if(req.body.end){
      if(!isValidEndTime(req.body.start , req.body.end)){
        return next(new ErrorHandler("endTime of meeting should not be less than startTime of meeting",400))
      }
    }

    const [,updateMeeting]  = await MeetingModel.update({ 
      ...req.body, 
        salePersonId:req.user.id , 
        status: "confirmed"  
      },
      {
        where: { 
          id: req.params.id
        },
        returning: true, // This option ensures that the updated data is returned
        plain: true // This option ensures that the returned data is a plain object
      }
    );

    return res.status(201).json({
      success: true,
      message: "Meeting Updated successfully",
      data : updateMeeting
    })

  } catch (error) {
    return next(new ErrorHandler(error.message,500))
  }
}

// Get All meetings by salePerson
const getAllMeetings = async (req, res, next) => {
  try {

    const meetingSearchQuery = {
      where: {
        salePersonId: req.user.id,
        status: "confirmed",
      },
      order: [['start', 'ASC']] // Sort by start time in ascending order
    }

    if(req.query?.date){
      meetingSearchQuery.where.seduledDate = {
        [Op.eq]: moment.tz(req.query.date, 'Asia/Kolkata').utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
      }
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
      data: meetings
    })

    // Arranged The meeting according to date;
    const mapWithDate = new Map();

    meetings.forEach((meeting) => {
      const date = new Date(meeting.seduledDate)
        .toISOString()
        .slice(0, 10); // Convert to 'YYYY-MM-DD' format

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
const getSingleMeetingById = async (req, res , next) => {
  try {

    if (!req.params.id) {
      return next(new ErrorHandler("Missing Meeting id", 400));
    }

    const meeting = await MeetingModel.findOne({
      where:{
        id: req.params.id,
        salePersonId: req.user.id
      }
    });

    if (!meeting) {
      return next(new ErrorHandler("Meeting not found",400))
    }

    return res.status(200).json({
      success: true,
      message:"Data send Successfully",
      data: meeting
    })

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
      where:{
        id:  req.params.id,
        salePersonId: req.user.id
      }
    });

    if(!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    await MeetingModel.destroy({
      where: {
        id: req.params.id
      }
    })

    return res.status(200).json({
      success: true,
      message: "Meeting Deleted Successfully"
    })

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  meetingCreate , 
  updateMeeting , 
  getAllMeetings , 
  getSingleMeetingById , 
  deleteMeetingById , 
  getMeetingRequest, 
  getLiveMeetingCall , 
  getUpcomingMeetingCall,
  availableSlotsForSalePerson
};
