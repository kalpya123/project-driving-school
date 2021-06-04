const express= require("express");
const mongooseConnect= require("./config/mongoose");
require('dotenv').config();
const Signup =require("./router/signup");
const Book= require("./router/book");
const app= express();
const cors = require('cors')
const bodyParser= require("body-parser");
const port=process.env.PORT;
const url= process.env.MongoUrl;
const path=require("path");
const cookieParser = require('cookie-parser');
app.use(cookieParser())
app.listen(port,()=>{
    console.log("app is on "+port);
});
mongooseConnect(url);
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended:true, limit:'50mb'}));
app.use(cors());
app.use('/upload',express.static(path.join(__dirname,'upload')))
app.use("/",Signup);
app.use("/book",Book);