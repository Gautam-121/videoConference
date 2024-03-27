const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")

const SalesUserModel = sequelize.define("sale", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Name is Mandatory",
        },
        len:{
          args:[4,30],
          msg: "Name Should be greater than 4 character and less than 30 character"
        }
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Email is Mandatory",
        },
        isEmail: {
          msg: "Invalid Email Address"
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Password is Mandatory",
        },
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Phone is Mandatory",
        },
      },
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "salePerson",
    },
    organizationId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    hooks: {
      beforeCreate: async (user) => {
        user.password = await bcrypt.hash(user.password, 10);
      },
      beforeUpdate: async (user) => {
        if(user.changed("password")){
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    },
  }
);

SalesUserModel.prototype.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

SalesUserModel.prototype.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this.id, 
      isAdmin: this.type
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE
    }
  )
}

module.exports = SalesUserModel;
