const {DataTypes} = require("sequelize")
const {sequelize} = require("../config/database.js")
const SalesUserModel = require("../models/salesUserModel.js")

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
    },
    organizationId:{
        type:DataTypes.STRING,
        allowNull: false
    },
    salePersonId: {
        type: DataTypes.INTEGER, // Assuming your SalesUserModel uses an auto-incrementing integer id
        allowNull: false,
        references: {
            model: SalesUserModel,
            key: 'id'
        }
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