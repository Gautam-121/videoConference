const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database.js");
const bcrypt = require("bcryptjs");

const SalesUserModel = sequelize.define("sale", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Name is Mandatory",
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Email is Mandatory",
        },
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Password is Mandatory",
        },
        len: [8, 255],
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
    },
  }
);


SalesUserModel.prototype.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = SalesUserModel;
