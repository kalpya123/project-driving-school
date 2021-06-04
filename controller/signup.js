const shortid = require('shortid');
const bcrypt = require('bcrypt');
var crypto = require('crypto');
const UserModel= require("../model/user");
const CreateAuth = require("../middleware/createAuth");
const Instructor = require("../model/instructor");
const nodemailer = require("nodemailer");
// const Admin = require("../model/book");
const mongoose = require("mongoose");
const path = require("path");
var fs = require("fs")
require("dotenv").config();
const emailid=process.env.Emailid;
const emailpass=process.env.Emailpass;
const port = process.env.PORT;
let cleancode;
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailid,
    pass: emailpass,
  },
});


exports.SignUp= async(req,res) =>{
  const {fullname,
  password,
  email,
  fathername,
  phone,
  dob,
  address
} =req.body;
 const user = await UserModel.find({email});
 (user.length===1 || user.length > 1) ?

    res.status(404).json({error:"user exits"})

:
   bcrypt.hash(password, 10, (err, hash)=>{  
    let secretCode = shortid.generate();
    const url = `http://localhost:${port}/api/auth/verification/verify-account/${secretCode}`;

    var mailOptions = {
      from: emailid,
      to: email,
      subject: "email verification",
      html: `please click on link to verify mail </br> ${url}`,
    };

    transporter.sendMail(mailOptions,  function (error, info) {
      if (error) {
       res.status(501).json({message:"inavild mail"})
      } else {
         const UserSave= new UserModel({
          fullname,
          password:hash,
          email,
          id:secretCode,
          fathername,
          phone,
          dob,
          address,
          profileImage:req.file.path
          // idenitiy:req.files.identity[0].path,
          // otherproof:req.files.addressproof[0].path,
          // profileImage:req.files.profile[0].path,
          // signature:req.files.signature[0].path

        });
        UserSave.save();
     
        res.status(201).json({message:`please check your ${email} and verfiy`});
      }
      })

   
   })
    

} 
exports.verify = async(req,res) =>{
  const {code}=req.params;
   const VerifyMail= await UserModel.findOneAndUpdate({id:code},{$set:{verify:true}});
   (VerifyMail ===  null) ? 
     res.status(404).json({message:'verifaction failed'})
   :
    res.status(200).json({message:'verify done'})
}




exports.SignIn= async(req,res) =>{
  const {email,password} =req.body;
const UserData= await UserModel.findOne({email});
(UserData && UserData.verify === true) ?
    bcrypt.compare(password, UserData.password, (err, result) => {
      (err) ?  
          res.status(401).json({
            message: "password is incorrect"})
          :
          cleancode
          
        if(result==true)
        {
            const Auth= CreateAuth(UserData._id,UserData.email);
           const cookie= res.status(200).cookie('token', Auth, {
                expires: new Date(Date.now() + 10000),
                secure: false, // set to true if your using https
                httpOnly: true,
              }).json({message:"login done"})

        }
        else
            { 
         res.status(404).json({message:"incorrect password"})
            }            
    })
: 
res.status(404).json({error:"no user found "});
}

exports.AdminLogin =(req,res) =>{
  const {username,password}=req.body;
  if(username === "admin" && password ==="admin")
  {
     const _id=password;
    const Auth =CreateAuth(password,username);
    console.log(Auth);
    const cookie= res.status(200).cookie('token', Auth, {
      expires: new Date(Date.now() + 10000),
      secure: false, // set to true if your using https
      httpOnly: true,
    });
    console.log(cookie)
    // res.status(200).json(Auth);
  }
  else
  {
    res.status(404).json({message:"please enter correct username and password"});
  }
}


exports.forgot=async(req,res) =>{
  const {email,password}=req.body;
  var mykey = crypto.createCipher('aes-128-cbc', 'mypassword');
var mystr = mykey.update(password, 'utf8', 'hex')
mystr += mykey.final('hex');
console.log(mystr);
const response=await UserModel.findOne({email})
console.log(response);
if(response)
{
  let url=`http://localhost:${port}/api/auth/verification/forgot-password/${response._id}/${mystr}`;
  var mailOptions = {
    from: emailid,
    to: response.email,
    subject: "email verification",
    html: `please click on link to verify mail </br> <a href=${url}>click here </a>`,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
            res.status(200).json({message:'please verify mail'})
    } 
  }) 
}
else if(response === null)
{
  res.status(404).json({message:"email is incorrect"})
}
}



exports.verifypass=(req,res)=>{
  const {_id,password} =req.params;
  var mykey = crypto.createDecipher('aes-128-cbc', 'mypassword');
var mystr = mykey.update(password, 'hex', 'utf8')
mystr += mykey.final('utf8');
console.log(mystr);
bcrypt.hash(mystr, 10, async(err, hash)=>{
  if(err)
  {
    res.status(404).json(err)
  }
  else
  {
    const response=await UserModel.findByIdAndUpdate({_id},{$set:{password:hash}})
    console.log(response);
  
    res.status(200).json(response);


   

  }



})
}
exports.LoginInstructor=async(req,res) =>{
const {email,password}= req.body;
try {
  const instructorData=await Instructor.findOne({email});
 (instructorData) ?
    bcrypt.compare(password, instructorData.password, (err, result) => {
      if(err)
      {
        res.status(401).json({message:"wrong password"})
      }
      else
      {
        
      if(result===true)
      {
        let name=instructorData.name;
        let _id=instructorData._id;
        const Auth =CreateAuth(_id,name);
        const cookie= res.status(200).cookie('token', Auth, {
          expires: new Date(Date.now() + 10000),
          secure: false, // set to true if your using https
          httpOnly: true,
        }).json({message:"login successfully"})
      }
      else{
      
        res.status(401).json({message:"wrong password"})
      
    }
    }
  
    }) :
    res.status(401).json({message:"wrong email"})
  
} catch (error) {
  console.log(error);
  res.status(401).json(error)
}



}

// exports.Addinstructor=async(req,res) =>{
//   const {name, time, shifts,gender}=req.body;
//   // time shifts
//   const instructor = await Instructor.findOne({name});
//   if(instructor===1)
//   {
//     res.status(401).json({message:"user exits"})
//   }
//   else
//   {
//     const response= new Instructor({
//       name,
//         gender
//     }); 
//     response.save();
//     console.log(response);
//     res.status(200).json(response); 
//   }
// }


exports.date=async(req,res)=>{
try {
  const name=req.userData.usernames;
 let {date,time,shift}= req.body; 
let dates={
  Date:date,
  Time:time,
  shift
}
 const instructorData=await Instructor.updateOne({name},{$push:{time:dates}}); 
(instructorData.n ==0 || instructorData.nModified ===0) ?
res.status(404).json({message:"only for Instructor or error "})  :
res.status(200).json({message:"dates added successfully"})

} catch (error) {
 res.status(404).json(error)

}
 

}

exports.InstructorSignup=async(req,res)=>{
 try{
  const {email,password,name,gender}=req.body;
  const instructorImage = req.file.path;
  const instructorData = await Instructor.find({email});
  (instructorData.length ===1 ) ? res.status(404).json({error:"user exits"}) :
    bcrypt.hash(password, 10, (err, hash)=>{
     const InstructorSave = new Instructor({
      email,
       password:hash,
       name,
       gender,
       profileImage:instructorImage
     });
     InstructorSave.save();
    res.status(200).json(InstructorSave)
   })
 }
 catch(error)
 {
   res.status(501).json(error)
 }
  
}


exports.sendDocument=async(req,res)=>{
 const _id= req.params._id;
 const title=req.body.title;
 const image=req.file.path;

 const doc ={
    title,
    doucment:image
 }
 const sentDocument=await UserModel.updateOne({_id},{$push:{instructorsdocuments:doc}})
let status=sentDocument.nModified;
 (status===1) ?
  res.status(200).json({message:"document send sucessfully"})

  :

  res.status(404).json({message:"error"})

}

exports.getImage=async(req,res)=>{
  let _id = mongoose.Types.ObjectId(req.params._id);
  let id= mongoose.Types.ObjectId(req.userData.id);
  // add this on matching
  const GetImage=await UserModel.aggregate([{$match:{_id:id}},{$unwind:"$instructorsdocuments"},{$match:{"instructorsdocuments._id":_id}}])
   let status=GetImage.length;
  if(status===0)
{
res.status(401).json({message:"file not found"})
}
else
{
  let image=GetImage[0].instructorsdocuments.doucment;
  res.status(200).sendFile(path.join(__dirname, "../" + image));
 
}

}

exports.getidenitiy=async(req,res)=>{
let _id=req.params._id;
let response=await UserModel.findOne({_id});
if(response)
{
  let idenitiyImage=response.idenitiy;
  res.status(200).sendFile(path.join(__dirname, "../" + idenitiyImage));
}
else
{
  res.status(401).json({message:"no data"})
}


}

exports.getotherproof=async(req,res)=>{
  let _id=req.params._id;
  let response=await UserModel.findOne({_id});

  if(response)
  {
    let otherproofImage=response.otherproof;
    res.status(200).sendFile(path.join(__dirname, "../" + otherproofImage));
  }
  else
  {
    res.status(401).json({message:"no data"})
  }
  
  
  }


  exports.getuserprofileImage=async(req,res)=>{
    let _id=req.params._id;
    let response=await UserModel.findOne({_id});
    if(response)
    {
      let profileImageImage=response.profileImage;
      res.status(200).sendFile(path.join(__dirname, "../" + profileImageImage));
    }
    else
    {
      res.status(401).json({message:"no data"})
    }
    
    
    }


    exports.getsignature=async(req,res)=>{
      let _id=req.params._id;
      let response=await UserModel.findOne({_id});
    
      if(response)
      {
        let signatureImage=response.signature;
        res.status(200).sendFile(path.join(__dirname, "../" + signatureImage));
      }
      else
      {
        res.status(401).json({message:"no data"})
      }
      
      
      }

      exports.getprofileImage=async(req,res)=>{
        let _id=req.params._id;
        let response=await Instructor.findOne({_id});
       
        if(response)
        {
          let profileImage=response.profileImage;
          res.status(200).sendFile(path.join(__dirname, "../" + profileImage));
        }
        else
        {
          res.status(401).json({message:"no data"})
        }
        
        
        }

exports.logout=async(req,res)=>{

  res.clearCookie('token').json({message:"logout done"})
}

exports.documents=async(req,res) =>{
 const _id=req.userData.id;
  let idenitiy= req.files.identity[0].path;
 let otherproof=req.files.addressproof[0].path;
  // let profileImage=req.files.profile[0].path;
 let signature=req.files.signature[0].path;
let documents=await UserModel.findByIdAndUpdate({_id},{idenitiy,otherproof,signature})
if(doucments)
{
  res.status(200).json({message:"doucments uploaded sucessfully"})
}
else
{
  res.status(401).json({message:"error"})
}

}

async function check (req,res,_id,doc)
{
  console.log(_id,doc);
    switch(doc)
    {
      case "signature":
        const signatures=await UserModel.findOne({_id});
        if(signatures===null){res.status(401).json({message:"not found"})}
        else {
        let signature =signatures.signature;
        res.status(200).sendFile(path.join(__dirname, "../" + signature));
        }break;

        case "profileImage":
          const profileImages=await UserModel.findOne({_id});
          if(profileImages===null){res.status(401).json({message:"not found"})}
          else {
        let profileImage =profileImages.profileImage;
        res.status(200).sendFile(path.join(__dirname, "../" + profileImage));
           } break;
       case "otherproof":
        const otherproofs=await UserModel.findOne({_id});
      if(otherproofs===null){res.status(401).json({message:"not found"})}
      else {
        let otherproof =otherproofs.otherproof;;
        res.status(200).sendFile(path.join(__dirname, "../" + otherproof));
       } break;
       case "idenitiy":
         const idenitiys=await UserModel.findOne({_id});
         if(idenitiys===null){res.json({message:"not found"})}
         else {
         let idenitiy= idenitiys.idenitiy;
         res.status(200).sendFile(path.join(__dirname,"../" + idenitiy))
         }break;

         default:
          res.json({message:"no file"})
        }
}
 exports.example=(req,res) =>{
 let _id= req.params._id 
 let doc= req.params.document; 

 check(req,res,_id,doc,)
}


exports.updateProfile=async(req,res) =>{
let _id=userData.id;
  const {fullname,password,email,fathername,phone,dob, address} =req.body;
let  idenitiy=req.files.identity[0].path;
         let otherproof=req.files.addressproof[0].path;
        let  profileImage=req.files.profile[0].path;
        let  signature=req.files.signature[0].path;
        var mykey = crypto.createCipher('aes-128-cbc', 'mypassword');
        var mystr = mykey.update(password, 'utf8', 'hex')
        mystr += mykey.final('hex');   
        let url=`http://localhost:${port}/api/auth/verification/forgot-password/${_id}/${mystr}`;
        var mailOptions = {
          from: emailid,
          to: email,
          subject: "email verification and password ",
          html: `please click on link to verify mail </br> <a href=${url}>click here </a>`,
        };
      
          transporter.sendMail(mailOptions, async function (error, info) {
          if(error)
          {
            res.json(error)
          }
          else
          {
            const Userupdated= await UserModel.findOneAndUpdate({_id},{fullname,email,fathername,phone,dob,address,idenitiy,otherproof,profileImage,signature});
                 if(Userupdated)
                 {
                   res.status(200).json({message:"your account updated"})
                 }
                 else
                 {
                   res.status(401).json({message:"error"})
                 }
          }
          })

        
        
        // })


}