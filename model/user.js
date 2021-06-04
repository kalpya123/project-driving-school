const mongoose = require("mongoose");
const Schema=mongoose.Schema;

const UserSchema = new Schema({
    fullname:{
        type:String
    },
    email:{
        type:String,
        required:true,
        unique:true
    }
    ,
    password: {
     type:String,
     required:true,
        unique:true
    },
    id:{
     type:String
     },
     verify:{
         type:Boolean,
         default:false
     }
     ,
    
    date:{
       type:String
    },
    fathername:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
    dob:{
        type:String,
        required:true
    },
    idenitiy:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    otherproof:{
        type:String,
        required:true
    },
    bookdate:{
        type:String
    },
    profileImage:{
        type:String,
        required:true
    },
    signature:{
        type:String,
        required:true
    },
    instructorsdocuments:[
        {
            title:{
                type:String
            },
            doucment:{
                type:String
            }
        }
    ]
})

const Usermodel=mongoose.model("user",UserSchema);

module.exports=Usermodel;