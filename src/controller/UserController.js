const UserModel = require("../models/userModel")
const ErrorHandler = require("../utils/errorHandler")

const registerUser = async(req , res , next)=>{
    try {

        if(Object.keys(req.body).length === 0){
            return next(new ErrorHandler("Req body is Empty" , 400))
        }

        const user = await UserModel.create(req.body)
        return res.status(200).json({
            success: true,
            message:"Registration Successull",
            data: user
        });
    } catch (error) {
        return next(new ErrorHandler(error.message , 500))
    }
}

module.exports = {registerUser}