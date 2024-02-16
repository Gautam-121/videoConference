const {DataTypes} = require("sequelize")
const {sequelize} = require("../config/database.js")
const UserModel = require("../models/userModel.js")

const MeetingModel = sequelize.define("meeting" , {
    customerName:{
        type:DataTypes.STRING,
        allowNull:false
    },
    phoneNumber:{
        type:DataTypes.STRING,
        allowNull:false
    },
    videoCallLink:{
        type:DataTypes.STRING,
    },
    meetingId: {
        type: DataTypes.STRING,
        unique: true,
    },
    scheduledDateTime: {
        type: DataTypes.DATE,
        allowNull: false,
        validate:{
            notEmpty:{
                msg:"Seduling Date is Mandatory"
            }
        }
    },
    status:{
        type:DataTypes.ENUM('pending', 'confirmed', 'completed', 'canceled'),
        allowNull:false,
        defaultValue: 'pending'
    }
})

// // Define the association
MeetingModel.belongsTo(UserModel, {
    foreignKey: 'teamMemberId',
    as: 'teamMember',
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