const {DataTypes} = require("sequelize")
const {sequelize} = require("../config/database.js")

const UserModel = sequelize.define("user" , {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate:{
            notEmpty:{
                msg:"Name is Mandatory"
            }
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate:{
            notEmpty:{
                msg:"Email is Mandatory"
            }
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate:{
            notEmpty:{
                msg:"Password is Mandatory"
            }
        }
    },
    phone: { // UserId
        type: DataTypes.STRING,
        allowNull: false,
        validate:{
            notEmpty:{
                msg:"Phone is Mandatory"
            }
        }
    },
    role: {
        type: DataTypes.ENUM('host', 'salesPerson'),
        allowNull: false,
        defaultValue: 'salesPerson'
    },
    organizationId:{
        type:DataTypes.STRING,
        allowNull: false
    }
})

module.exports = UserModel



// const { Sequelize, DataTypes } = require('sequelize');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const crypto = require('crypto');

// const sequelize = new Sequelize('your_database', 'your_username', 'your_password', {
//   host: 'your_host',
//   dialect: 'postgres',
// });

// const User = sequelize.define('User', {
//   name: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     validate: {
//       len: [4, 30],
//     },
//   },
//   email: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     unique: true,
//     validate: {
//       isEmail: true,
//     },
//   },
//   password: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     validate: {
//       len: [8, 255],
//     },
//   },
//   avatar_public_id: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   avatar_url: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   role: {
//     type: DataTypes.STRING,
//     defaultValue: 'user',
//   },
//   resetPasswordToken: {
//     type: DataTypes.STRING,
//   },
//   resetPasswordExpire: {
//     type: DataTypes.DATE,
//   },
// }, {
//   hooks: {
//     beforeCreate: async (user) => {
//       user.password = await bcrypt.hash(user.password, 10);
//     },
//   },
// });

// User.prototype.getJWTToken = function () {
//   return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRE,
//   });
// };

// User.prototype.comparePassword = async function (password) {
//   return await bcrypt.compare(password, this.password);
// };

// User.prototype.getResetPasswordToken = async function () {
//   const resetToken = crypto.randomBytes(20).toString('hex');
//   const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
//   const resetPasswordExpire = Date.now() + 15 * 60 * 1000;

//   this.resetPasswordToken = hashedResetToken;
//   this.resetPasswordExpire = resetPasswordExpire;

//   await this.save();

//   return resetToken;
// };

// module.exports = User;
