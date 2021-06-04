const mongoose = require("mongoose");
const Schema=mongoose.Schema;


const instructorSchema=Schema({
  
    name:{
        type:String,
        required:true
    },
    email:{
        type:String
    },
    password:{
        type:String
    },
    time:[
        {
         Date:{
             type:String
         },
         Time:{
             type:String
         },
         shift:{
             type:String
         }
        }
    ],
    gender:{
        type:String,
        required:true
    },
    clients:[
       {
           userId:{ type:mongoose.Schema.Types.ObjectId},
           Date:{type:String},
           Time:{type:String},
           status:{
               type:Boolean,
               default:false
           }
       }
    ],
    profileImage:{
        type:String,
        required:true
    }

})


const Instructormodel=mongoose.model("instructor",instructorSchema);


module.exports=Instructormodel;