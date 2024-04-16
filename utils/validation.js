const moment = require("moment");
const validator = require("validator");
const { PASSWORD_REGEX } = require("../constant");

// Get today's date
const today = moment();

const isValidEmail = email => validator.isEmail(email);

const isValidPhone = (phone) => validator.isMobilePhone(phone, "en-IN");

const isValidPassword = (password) => PASSWORD_REGEX.test(password)

const isValiLength = name => name.length >= 4 && name.length<=30

const isDateGreterThanToday = date => moment(date).isSameOrAfter(today, "day");

const isValidStartTime = startTime => moment(startTime).isSameOrAfter(today);

const isValidEndTime = (startTime, endTime) => moment(endTime).isAfter(startTime);

module.exports = {
  isValidEmail,
  isValidPhone,
  isDateGreterThanToday,
  isValidStartTime,
  isValidEndTime,
  isValidPassword,
  isValiLength
};




