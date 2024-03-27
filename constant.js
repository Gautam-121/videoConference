const mqtt = require("mqtt")
const {connectUrl,options} = require("./config/mqtt_config.js")

const client = mqtt.connect(connectUrl, options);

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const TIME_SLOT = 30

const START_TIME = 10

const END_TIME = 18

module.exports = {client , PASSWORD_REGEX , TIME_SLOT , START_TIME , END_TIME}