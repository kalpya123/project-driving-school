const mongoose= require("mongoose");
require('dotenv').config();

module.exports=(url) =>{
    mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
      });

      const connection = mongoose.connection;
      connection.once("open", (err) => {
        if (err) return err;
        console.log("Mongodb database connection established successfully");
      }); 
}