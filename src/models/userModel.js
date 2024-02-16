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

