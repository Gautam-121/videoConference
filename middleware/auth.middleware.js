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

    const decodedToken = jwt.verify(token , process.env.JWT_SECRET)

    if(!decodedToken){
      return next(
        new ErrorHandler(
          "Invalid token or token is expired",
          401
        )
      )
    }

    const user = await SalesUserModel.findByPk(decodedToken.id);

    if(!user){
      return next(
        new ErrorHandler(
          "Invalid token or token is expired",
          401
        )
      )
    }
  } catch (error) {
    return next(
      new ErrorHandler(
        error?.message || "Invalid access token",
        401
      )
    )
  }
};


module.exports = {isAuthenticatedUser}