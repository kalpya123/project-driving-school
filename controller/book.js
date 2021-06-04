const Instructor= require("../model/instructor");
const Users =require("../model/user");
const mongoose = require("mongoose");
let cleanCode;
exports.allInstructors = async(req,res) =>{//for get all instructors on date
const date=req.body.date;
const instructorData=await Instructor.aggregate([{$match:{gender:req.params.gender}},{$unwind:"$time"},{$match:{"time.Date":date,"time.shift":req.params.shift}}])
if(instructorData===null || instructorData.length===0)
{
    res.status(404).json({message:"no data found"})
}
else
{
  let arrayofData=[];
  for(let i=0;i<instructorData.length;i++)
  {
arrayofData.push(instructorData[i].name,instructorData[i].gender,instructorData[i].time);
  }
 
    
    res.status(200).json(arrayofData);  
}


}

exports.bookInstructor=async(req,res) =>{//for book 
    const _id=req.userData.id;
    const {name,date,time}=req.body;
    const BookedInstructor=await Instructor.aggregate([{$match:{name}},{$unwind:"$clients"},{$match:{"clients.Date":date,"clients.Time":time}}])
    if(BookedInstructor.length>=2)
   {
    res.status(401).json({message:"slot is full"})
   }
   else
   {
        const Userdata={
        userId:_id,
         Date:date,
        Time:time
    }
    const bookInstructor=await Instructor.findOneAndUpdate({name,"time.Date":Userdata.Date,"time.Time":Userdata.Time},{$push:{clients:Userdata}});
    if(bookInstructor===null)
    {
      res.status(404).json({message:`in correct Date`})
    }
    else
    {
      res.status(200).json({message:`your booking is done on ${date} with ${name}`});
    }

   }//


}


exports.Booked=async(req,res) =>{ //for instructors
    const name=req.userData.usernames;
   const date=req.body.date;

   const booked=await Instructor.aggregate([{$match:{name}},{$unwind:"$clients"},{$match:{"clients.Date":date}}])

const bookedlength=booked.length;

if(bookedlength === 0)
{
    res.status(401).json({message:"not found "})
}
else
{
let clients=[]
for(let i=0;i<bookedlength;i++)
{
   clients.push(booked[i].clients);
}

  res.status(200).json(clients)
}
}

exports.GetInfo=async(req,res) =>{
  
  try{
   const {_id}=req.params;
    const userInfo= await Users.findById({_id});
    
    if(userInfo)
{
    let fullname=userInfo.fullname;
    let email=userInfo.email;
    let phone=userInfo.phone;
    let dob=userInfo.dob;
    let address=userInfo.address;
        const users={
         fullname,
           email,
          phone,
          dob,
        address
        }
        res.status(200).json(users);
}else
{
    res.status(404).json({message:"not found"})
}
  }
  catch(error)
  {   
      res.status(501).json(error)
  }

}


exports.updateStatus=async(req,res)=>{
let _id= req.params._id;
const name=req.userData.usernames;
try {
 const date=req.body.Date;
const updatedStatus=await Instructor.updateOne({name,"clients.Date":date,"clients._id":_id},{"$set":{"clients.$.status":true}})
if(updatedStatus.nModified==0)
{
  res.status(401).json({message:"no data"});
}
else
{
  res.status(200).json({message:"user status updated"})
}



} catch (error) {
  res.status(404).json(error);
}
}


exports.userStatus=async(req,res) =>{
  try {
  const id=req.userData.id;
  // const UserStatus= await Instructor.find({"clients.userId":_id});
  let _id = mongoose.Types.ObjectId(id);
  const UserStatus=await Instructor.aggregate([{$unwind:"$clients"},{$match:{"clients.userId":_id}}])
  if(UserStatus.length===0 || UserStatus=== [])
  {
    res.status(401).json({message:"not found"})
  
  }
  else
  {
  let userData=[];
  for(let i=0;i<UserStatus.length;i++)
  {
    userData.push(UserStatus[i]._id,UserStatus[i].name,UserStatus[i].gender,UserStatus[i].clients)
  }
  console.log(userData.length)
  res.status(200).json(userData);    
} 
} catch (error) {
    res.status(404).json(error);
  }


}


exports.cancel=async(req,res) =>{
  const _id=req.userData.id;
  const date= req.body.date;
  const  name=req.params.name;
  const instructorId=req.params._id;
  console.log(_id);
  const cancelBooking= await Instructor.updateOne({name},{"$pull":{"clients":{"userId":_id ,"_id":instructorId,"status":false}}});
  if(cancelBooking.nModified===0)
{
  res.status(404).json({message:"error"})
}
else
{
  res.status(200).json({message:`your appointment with ${name} cancelled `})
}
}     