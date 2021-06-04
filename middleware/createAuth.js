const jwt = require('jsonwebtoken');
require('dotenv').config();
const JwtKey=process.env.JWTtoken;
const createToken = (id, usernames) => {
   return jwt.sign(
      {
        id,
        usernames,
      },
      JwtKey,
      {
        expiresIn: "7h",
      }
    );
   
  };
  module.exports = createToken;