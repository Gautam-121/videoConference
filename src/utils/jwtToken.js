const jwt = require("jsonwebtoken");

const sendToken = (user, statusCode, res) => {
    
  const token = jwt.sign({ id: user.id, isAdmin: user.type },process.env.JWT_SECRET,{
      expiresIn: process.env.JWT_EXPIRE,
    });

  // options for cookie
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: true

  };
  
  return res.status(statusCode).cookie("token", token, options).json({
    success: true,
    data:user,
    token,
  });
};

const sendTokens = (user, statusCode, res) => {
    
  const token = jwt.sign({ id: user._id, isAdmin: user.type },process.env.JWT_SECRET,{
      expiresIn: process.env.JWT_EXPIRE,
    });

  // options for cookie
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  const {password , type , ...otherDetails} = user

  return res.status(statusCode).cookie("token", token, options).json({
    success: true,
    data: otherDetails,
    token,
  });
};

module.exports = sendToken;
