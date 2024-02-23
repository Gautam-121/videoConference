const {DataTypes} = require("sequelize")
const {sequelize} = require("../config/database.js")
const SalesUserModel = require("../models/salesUserModel.js")

const MeetingModel = sequelize.define("meeting" , {
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
    }
})

// // Define the association
MeetingModel.belongsTo(SalesUserModel, {
    foreignKey: 'salePersonId',
    as: 'salepPerson',
});

module.exports = MeetingModel

/*


meetingTimeDate:{
    scheduledDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    startTime: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    endTime:{
        type: DataTypes.TIME,
        allowNull: false
    }
}

// Example: Getting current date in "MMM D, YYYY" format
const currentDate = new Date();
const formattedDate = currentDate.toLocaleDateString('en-US', {
    month: 'short', // Abbreviated month name (e.g., Jan, Feb)
    day: 'numeric', // Day of the month (e.g., 7)
    year: 'numeric', // Full year (e.g., 2024)
});

console.log(formattedDate); // Output: Feb 7, 2024
 */