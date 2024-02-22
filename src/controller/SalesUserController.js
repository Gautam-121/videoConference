const ErrorHandler = require("../utils/errorHandler");
const sendToken = require("../utils/jwtToken");
const SalesUserModel = require("../models/salesUserModel")

const register = async (req, res, next) => {
    try {

    const { name, email, password, phone , organizationId} = req.body;

    if(!name || !email || !password || !phone || !organizationId){
       return next(new ErrorHandler("Please provide all necessary field" , 400)) 
    }

    // Write code for Validate the Phone Number

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

const logins = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new ErrorHandler("Please Enter Email & Password", 400));
        }

        const isSalePersonLogin = await SalesPerson.findOne({ where: { email } });

        if(isSalePersonLogin){

            const isPasswordMatched = await bcrypt.compare(password, isSalePersonLogin.password);

            if (!isPasswordMatched) {
                return next(new ErrorHandler("Invalid email or password", 401));
            }
            sendToken(isSalePersonLogin, 200, res);
        }
        
        // Check login person admin or not
        const users = await axios(
            "http://localhost:7000/api/RegisterBrandAdmin?depth=0"
        );

        const isUserfound = users.docs.find((user) => user.email === email);

        if(!isUserfound) {
            return next(new ErrorHandler("Invalid email or password", 401));
        }
        const isPasswordMatched = await bcrypt.compare(
            password,
            isUserfound.password
        );
        if(!isPasswordMatched) {
            return next(new ErrorHandler("Invalid email or password", 401));
        }
        sendToken(isUserfound, 200, res);

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
};



module.exports = {register , login}