const {DataTypes} = require("sequelize")
const {sequelize} = require("../config/database.js")

const SalesUserModel = sequelize.define("sale" , {
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
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "salePerson"
    },
    organizationId:{
        type:DataTypes.STRING,
        allowNull: false
    }
})

module.exports = SalesUserModel

