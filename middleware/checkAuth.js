const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwtid= process.env.JWTtoken;

module.exports=(req,res,next) =>{
    try{
            const gettoken = req.headers.authorization.split(" ")[1];
    console.log(gettoken);
    const key = jwtid;
    const token = req.body.token;
    const decoded = jwt.verify(gettoken, key);
    req.userData = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Auth falied",
    });
  }
    
}