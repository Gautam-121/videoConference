const {DataTypes} = require("sequelize")
const {sequelize} = require("../config/database")

const customerModel = new sequelize.define("customer",{
    name:{
        type:DataTypes.STRING,
        allowNull:false,
        validate:{
            notEmpty:{
                msg:"Name is Mandatory"
            }
        }
    },
    email:{
        type:DataTypes.STRING,
        allowNull:false,
        validate:{
            notEmpty:{
                msg:"Email is Mandatory"
            },
            isEmail
        }
    },
    phone:{
        type:DataTypes.STRING,
        allowNull: false
    },
    seduledDate:{
        type:DataTypes.DATE,
        allowNull:false
    },
    startDate:{
        type:DataTypes.TIME,
        allowNull:false
    },
    endDate:{
        type:DataTypes.TIME,
        allowNull: false
    },
    isDeleted:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    }
})

module.exports = customerModel