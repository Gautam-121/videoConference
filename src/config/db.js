const {Sequelize} = require("sequelize")
require("dotenv").config({path:"./.env"})

const sequelize = new Sequelize(process.env.DATABASE_URI);

const connectDB = async () => {
  try {
    const connectionInstance = await sequelize.sync();
    console.log("Database Connected Successfully !! DB Host :", connectionInstance.config.host);
  } catch (err) {
    console.log("Database Error:", err);
  }
};

module.exports = {connectDB , sequelize}