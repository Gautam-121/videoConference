const MeetingModel = require("../models/meetingModel");
const { Op } = require("sequelize");
const ErrorHandler = require("../utils/errorHandler");
const ApiFeatures = require("../utils/apiFeatures");
const {
  isValidDate,
  isTimeGreaterThanCurrent,
  isEndTimeGreaterThanStart,
} = require("../utils/validation");
const UserModel = require("../models/userModel");


const meetingCreate = async(req,res,next)=>{
  try {

    const {customerName,phoneNumber,scheduledDateTime} = req.body

    const meeting  = await MeetingModel.create(req.body)

    return res.status(201).json({
      success: true,
      message: "Meeting seduled successfully",
      data : meeting
    })

  } catch (error) {
    return next(new ErrorHandler(error.message,500))
  }
}

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

    if (meetings.length == 0) {
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

// Get a specific meeting by ID
const getSingleMeetingById = async (req, res) => {
  try {

    if (!req.params.id) {
      return next(new ErrorHandler("Missing Meeting id", 400));
    }

    const meeting = await MeetingModel.findByPk(req.params.id);

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    if(meeting.teamMemberId && meeting.teamMemberId !== req.user.id){
      return next(new ErrorHandler("You are not Authorized for this operation" , 403))
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

    const meeting = await MeetingModel.findByPk(req.params.id);

    if(!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    if(meeting.teamMemberId && meeting.teamMemberId !== req.user.id){
      return next(new ErrorHandler("You are not Authorized for this operation" , 403))
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


module.exports = { createMeeting, getAllMeeting , getSingleMeetingById , deleteMeetingById , availableSlots , meetingCreate};
