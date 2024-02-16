const { default: axios } = require("axios");
const ErrorHandler = require("../utils/errorHandler");
const jwt = require("jsonwebtoken");


const isAuthenticatedUser = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            return next(new ErrorHandler("Please Login to access this resource", 401));
        }

        jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
            if (err) {
                let message = err.message = "jwt expiry" ? "token is expired , please login again" : "invalid token"
                return next(new ErrorHandler(message, 401))
            }

            if(decodedToken.isAdmin === "admin"){
                const adminData = axios(
                `http://localhost:7000/api/RegisterBrandAdminAndSalePerson/${decodedToken._id}?depth=0`
                )

                if(adminData?.errors[0]?.message){
                    return next(new ErrorHandler("No user Found", 404))
                }
                req.user = adminData
                next()
            }else{
                req.user = decodedToken
                next()
            }
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.isAdmin)) {
            return next(
                new ErrorHandler(
                    `Role: ${req.user.isAdmin} is not allowed to access this resouce `,
                    403
                )
            );
        }
        next();
    };
};

module.exports = {isAuthenticatedUser , authorizeRoles}