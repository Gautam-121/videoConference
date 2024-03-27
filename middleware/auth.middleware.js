const ErrorHandler = require("../utils/errorHandler");
const jwt = require("jsonwebtoken");
const SalesUserModel = require("../models/saleUser.model")


const isAuthenticatedUser = async (req, res, next) => {
  try {
    
    let token = req.headers["authorization"]

    if(!token){
      return next(
        new ErrorHandler("Please Login to access this resource", 401)
      );
    }

    token = token.split(" ")[1]

    if (!token ||token=="null") {
      return next(
        new ErrorHandler("Please Login to access this resource", 401)
      );
    }
    
    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
      if (err) { 
        let message = (err.message = "jwt expiry"
          ? "token is expired , please login again"
          : "invalid token");
        return next(new ErrorHandler(message, 401));
      }
      req.user = await SalesUserModel.findByPk(decodedToken.id);
      next();
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};


module.exports = {isAuthenticatedUser}