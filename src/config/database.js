const {Sequelize} = require("sequelize")
const dotenv = require("dotenv").config()


const sequelize = new Sequelize({
    dialect: process.env.Dialect,
    host: process.env.Host,
    username: process.env.User,
    password:  process.env.Password,
    database: process.env.Database
});

const connection = () => {
  sequelize.sync().then(() => {
      console.log("Database Connected Successfull");
    }).catch((err) => {
      console.log("Database Eroor is", err);
    });
};

module.exports = {connection , sequelize}