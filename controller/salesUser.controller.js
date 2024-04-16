const ErrorHandler = require("../utils/errorHandler");
const SalesUserModel = require("../models/saleUser.model")
const {isValidEmail,isValidPhone ,isValidPassword, isValiLength} = require("../utils/validation");
const asyncHandler = require("../utils/asyncHandler");
const sendEmail = require("../utils/sendEmail.js")
const jwt = require("jsonwebtoken")


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
        return next(
            new ErrorHandler(
                "Invalid Email id", 
                400
            )
        )
    }

    // check phone is valid
    if (!isValidPhone(phone)) {
        return next(new ErrorHandler(
            "Invalid Phone Number", 
            400
            )
        )
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

    if(!isValiLength(name)){
        return next(
            new ErrorHandler(
                "name should be greater than 3 character and less than 30 character" ,
                400
            ) 
        ) 
    }

    const isExistedSales = await SalesUserModel.findOne({
        where:{
            email:email.trim(),
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
        return next(
            new ErrorHandler(
                "Something went wrong while registering the Sale Person", 
                500
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

    const user = await SalesUserModel.findOne({
      where: { email: email.trim() },
    });

    if(!user){
        return next(
            new ErrorHandler(
                "Invalid email or password", 
                401
            )
        )
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(
            new ErrorHandler(
                "Invalid email or password",
                 401
            )
        );
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

const forgotPassword = asyncHandler(async(req,res,next)=>{

    const { email } = req.body

    if(!email){
        return next(
            new ErrorHandler(
                "Email is missing",
                400
            )
        )
    }

    const user = await SalesUserModel.findOne({
        where:{
            email: email.trim()
        }
    })

    if(!user){
        return next(
            new ErrorHandler(
                "Sale Person not found",
                404
            )
        )
    }

    const token = user.generateForgotPasswordToken()
    const resetPasswordUrl = `${req.protocol}://${req.get(
        "host")}/api/v1/user/password/reset/${user.id}/${token}`
    
    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;

    try {
        await sendEmail({
            email: user.email,
            subject: "Password reovery",
            message
        })
    } catch (error) {
        return next(
            new ErrorHandler(
                "Something went wrong while sending a email",
                500
            )
        )
    }

})

const resetPassword = asyncHandler(async(req,res,next)=>{

    const { token } = req.params
    const { password } = req.body

    if(!token){
        return next(
            new ErrorHandler(
                "Unauthorized request",
                401
            )
        )
    }

    const decodedToken = jwt.verify(token , process.env.JWT_FORGOT_SECRET)

    if(!decodedToken){
        return next(
            new ErrorHandler(
                "Invalid token or token is expired"
            )
        )
    }
    
    const user = await SalesUserModel.findByPk(decodedToken.id)

    if(!user){
        return next(
            new ErrorHandler(
                "Invalid token or token is expired"
            )
        )
    }

    if(!password){
        return next(
            new ErrorHandler(
                "Password is missing",
                400
            )
        )
    }

    user.password = password
    const accessToken = await user.generateAccessToken()

    await user.save({validate: false})

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





module.exports = { 
    registerSale, 
    loginSale,
    forgotPassword,
    resetPassword
 };