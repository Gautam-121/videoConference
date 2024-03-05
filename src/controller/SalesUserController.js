const ErrorHandler = require("../utils/errorHandler");
const sendToken = require("../utils/jwtToken");
const SalesUserModel = require("../models/salesUserModel")
const {isValidEmail,isValidPhone} = require("../utils/validation")

const register = async (req, res, next) => {
    try {

    const { name, email, password, phone , organizationId} = req.body;

    if(!name || !email || !password || !phone || !organizationId){
       return next(new ErrorHandler("Please provide all necessary fields" , 400)) 
    }

    // Write code for Validate the Phone Number
    if (!isValidEmail(email)) {
        return next(new ErrorHandler("Invalid Email id", 400))
    }
  
    if (!isValidPhone(phone)) {
        return next(new ErrorHandler("Invalid Phone Number", 400))
    }
  

    const user = await SalesUserModel.create({
        name,
        email,
        password,
        phone,
        organizationId
    });

    return res.status(201).json({
        success: true,
        message: "User Register Successfully",
        data: user
    })
    } catch (error) {
        return next(new ErrorHandler(error , 500))
    }
}

const login = async (req , res , next)=>{
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return next(new ErrorHandler("Please Enter Email & Password", 400));
        }

        const user = await SalesUserModel.findOne({ where: { email } });

        if(!user){
            return next(new ErrorHandler("Invalid email or password", 401))
        }

        const isPasswordMatched = await user.comparePassword(password);

        if (!isPasswordMatched) {
            return next(new ErrorHandler("Invalid email or password", 401));
        }
        
        sendToken(user, 200, res);
        
    } catch (error) {
        return next(new ErrorHandler(error.message , 500))
    }
}

const logOut = async (req , res , next)=>{
    
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });
    
      return res.status(200).json({
        success: true,
        message: "Logged Out",
      });
}




module.exports = {register , login , logOut}