const jwt = require("jsonwebtoken");

const sendToken = (user, statusCode, res) => {

  const token = jwt.sign({ id: user.id, isAdmin: user.type },process.env.JWT_SECRET,{
      expiresIn: process.env.JWT_EXPIRE
  });
  
  return res.status(statusCode).json({
    success: true,
    data:user,
    token,
  });
};

module.exports = sendToken;
