const ErrorHandler = require("../utils/errorHandler");
const SalesUserModel = require("../models/saleUser.model")
const {isValidEmail,isValidPhone ,isValidPassword} = require("../utils/validation");
const asyncHandler = require("../utils/asyncHandler");

const registerSale = asyncHandler(async (req, res, next) => {

    const { name, email, password, phone , organizationId } = req.body;

    if(
        [name,email,password,phone,organizationId].some((field)=> field?.trim() == "")
    ){
        return next(
            new ErrorHandler(
                "Please provide all necessary fields" ,
                 400
            )
        ) 
    }

    // check email is valid
    if (!isValidEmail(email)) {
        return next(new ErrorHandler("Invalid Email id", 400))
    }

    // check phone is valid
    if (!isValidPhone(phone)) {
        return next(new ErrorHandler("Invalid Phone Number", 400))
    }

    // check password matches the regex
    if(!isValidPassword(password)){
        return next(
            new ErrorHandler(
                "Password Should contain atleast 8 character in which 1 Uppercase letter , 1 LowerCase letter , 1 Number and 1 Special character" ,
                400
            ) 
        ) 
    }

    const isExistedSales = await SalesUserModel.findOne({
        where:{
            email,
            organizationId
        }
    })

    if(isExistedSales){
        return next(
            new ErrorHandler(
                "Sale Person alredy been registered with this email",
                409
            )
        )
    }
  
    const user = await SalesUserModel.create({
        name,
        email,
        password,
        phone,
        organizationId
    });

    const createdUser = await SalesUserModel.findByPk(user.id,{
        attributes:{
            exclude: ["password"]
        }
    })

    if(!createdUser){
        return next(new ErrorHandler(
            "Something went wrong while registering the Sale Person", 500
            )
        )
    }

    return res.status(201).json({
        success: true,
        message: "User Register Successfully",
        data: createdUser
    })
})

const loginSale = asyncHandler(async (req , res , next)=>{

    const { email, password } = req.body;

    if (!email || !password) {
        return next(
            new ErrorHandler(
                "Please Enter Email & Password", 
                400
            )
        );
    }

    const user = await SalesUserModel.findOne({ where: { email } });

    if(!user){
        return next(new ErrorHandler("Invalid email or password", 401))
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    const accessToken = await user.generateAccessToken()

    const loggedInUser = await SalesUserModel.findByPk(user.id , {
        attributes:{
            exclude: ["password"]
        }
    })
    
    return res.status(200).json({
        success: true,
        data:loggedInUser,
        token: accessToken,
      });
    
})





module.exports = {registerSale , loginSale }