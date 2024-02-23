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




// Customer request for video call
const meetingCreate = async(req,res,next)=>{
  try {

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

const getVideoRequest = async(req,res,next)=>{

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
    }

    if(req.query?.date){
      meetingSearchQuery.where.seduledDate = {
        [Op.eq]: req.query.date 
      }
    }

    const meetings = await MeetingModel.findAll(meetingSearchQuery);

    if (meetings.length > 1) {
      meetings.sort((a, b) => {
        const dateA = new Date(a.seduledDate);
        const dateB = new Date(b.seduledDate);
        return dateA - dateB;
      });
    }

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


module.exports = {meetingCreate , updateMeeting , getAllMeetings , getSingleMeetingById , deleteMeetingById };
