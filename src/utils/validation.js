const moment = require("moment");
const validator = require("validator");

// Get today's date
const today = moment();

const isValidEmail = email => validator.isEmail(email);

const isValidPhone = (phone) => validator.isMobilePhone(phone, "en-IN");

const isDateGreterThanToday = date => moment(date).isSameOrAfter(today, "day");

const isValidStartTime = startTime => moment(startTime).isSameOrAfter(today);

const isValidEndTime = (startTime, endTime) => moment(endTime).isAfter(startTime);

module.exports = {
  isValidEmail,
  isValidPhone,
  isDateGreterThanToday,
  isValidStartTime,
  isValidEndTime,
};




