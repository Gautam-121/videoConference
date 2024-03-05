const CustomerModel =  require("../models/customerApprochModel")
const ErrorHandler = require("../utils/errorHandler")

const createCustomerData = async(req,res,next)=>{
    try {
        const data = await CustomerModel.create(req.body)
        return res.status(200).json({
            success: true,
            data
        })
    } catch (error) {
        return next(new ErrorHandler(error.message , 500))
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
  
      if (req.query.startDate && req.query.endDate) {
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
  
  const getMeetingBySearch = async (req, res, next) => {
    try {
  
    } catch (error) {
      return next(new ErrorHandler(error.message, 500))
    }
  }
  
  const availableSlots = async (req, res, next) => {
    try {
  
      console.log("Enter")
  
      const date = new Date(req.params.date);
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 10, 0, 0);
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 19, 0, 0);
  
      console.log("date", date)
      console.log("startOfDay", startOfDay)
      console.log("endOfDay", endOfDay)
  
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
  
      console.log("Meetings of host", meetings)
  
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

  
const logins = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new ErrorHandler("Please Enter Email & Password", 400));
        }

        const isSalePersonLogin = await SalesPerson.findOne({ where: { email } });

        if(isSalePersonLogin){

            const isPasswordMatched = await bcrypt.compare(password, isSalePersonLogin.password);

            if (!isPasswordMatched) {
                return next(new ErrorHandler("Invalid email or password", 401));
            }
            sendToken(isSalePersonLogin, 200, res);
        }
        
        // Check login person admin or not
        const users = await axios(
            "http://localhost:7000/api/RegisterBrandAdmin?depth=0"
        );

        const isUserfound = users.docs.find((user) => user.email === email);

        if(!isUserfound) {
            return next(new ErrorHandler("Invalid email or password", 401));
        }
        const isPasswordMatched = await bcrypt.compare(
            password,
            isUserfound.password
        );
        if(!isPasswordMatched) {
            return next(new ErrorHandler("Invalid email or password", 401));
        }
        sendToken(isUserfound, 200, res);

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
};

module.exports = {createCustomerData}