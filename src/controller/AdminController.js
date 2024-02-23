const ErrorHandler = require("../utils/errorHandler");
const SalesUserModel = require("../models/salesUserModel")

const registerSalesUser = async (req, res, next) => {
    try {

    const { name, email, password, phone} = req.body;

    if(!name || !email || password || phone){
       return next(new ErrorHandler("Please provide all necessary fielda" , 400)) 
    }

    const user = await SalesUserModel.create({
        name,
        email,
        password,
        avatar: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        },
    });

    sendToken(user, 201, res);
    } catch (error) {
        
    }
}

module.exports = {registerSalesUser}

