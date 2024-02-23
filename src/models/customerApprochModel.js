const {DataTypes} = require("sequelize")
const {sequelize} = require("../config/database")

const CustomerModel = sequelize.define("customer", {
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
            isEmail: true
        }
    },
    phone:{
        type:DataTypes.STRING,
        allowNull: false
    },
    videoCallLink:{
        type:DataTypes.STRING,
    },
    meetingId: {
        type: DataTypes.STRING,
        unique: true,
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
    status:{
        type:DataTypes.ENUM('pending', 'confirmed', 'completed', 'canceled'),
        allowNull:false,
        defaultValue: 'pending'
    },
    organizationId:{
        type:DataTypes.STRING,
        allowNull: false
    },
    isDeleted:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    }
})

module.exports = CustomerModel