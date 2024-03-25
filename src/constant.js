const mqtt = require("mqtt")
const {connectUrl,options} = require("./config/mqtt_config.js")

const client = mqtt.connect(connectUrl, options);

module.exports = {client}