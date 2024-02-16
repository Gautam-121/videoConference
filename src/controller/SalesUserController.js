const ErrorHandler = require("../utils/errorHandler");
const axios = require("axios");
const bcrypt = require("bcryptjs");
const sendToken = require("../utils/jwtToken");


const login = async (req, res, next) => {
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

module.exports = {login}