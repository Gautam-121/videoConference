const {DataTypes} = require("sequelize")
const {sequelize} = require("../config/db.js")
const SalesUserModel = require("./saleUser.model.js")

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
    start:{
        type:DataTypes.DATE,
        allowNull:false
    },
    end:{
        type:DataTypes.DATE,
        allowNull: false
    },
    status:{
        type:DataTypes.ENUM('pending', 'confirmed', 'completed', 'canceled'),
        defaultValue: 'pending'
    },
    organizationId:{
        type:DataTypes.STRING,
        allowNull: false
    },
})

// Define the association
MeetingModel.belongsTo(SalesUserModel, {
    foreignKey: 'salePersonId',
    as: 'salepPerson',
});

module.exports = MeetingModel

