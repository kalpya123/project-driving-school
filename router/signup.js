const express = require("express");
const SignUp = require("../controller/signup");
const multer  = require('multer')
const checkAuth=require("../middleware/checkAuth");
const router=express.Router();
const path = require("path");

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./upload/");
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  });
  let upload = multer({ storage: storage });

  let uploadMultiple = upload.fields([
    {name:"profile",maxCount:1},
    { name: "identity", maxCount: 1 },
    { name: "addressproof", maxCount: 1 },
    { name: "signature", maxCount: 1 },
  ]);
  //add upload.single("profile")
router.post("/user/signup",uploadMultiple, SignUp.SignUp);

router.post("/",SignUp.SignIn);

// router.post("/instructor",SignUp.Addinstructor);
router.post("/instructor/login",SignUp.LoginInstructor); 

router.post("/admin",SignUp.AdminLogin);

router.get("/api/auth/verification/verify-account/:code",SignUp.verify)

router.post("/forgot-password",SignUp.forgot );

router.get("/api/auth/verification/forgot-password/:_id/:password",SignUp.verifypass)

router.post("/add/date",checkAuth,SignUp.date);

router.post("/instructor/signup",upload.single('profile'),SignUp.InstructorSignup);


router.post("/send/:_id",upload.single("document"),checkAuth,SignUp.sendDocument);//

router.get("/download/:_id",checkAuth,SignUp.getImage);

router.get("/users/images/idenitiy/:_id",checkAuth,SignUp.getidenitiy);

// router.get("/users/images/otherproof/:_id",checkAuth,SignUp.getotherproof);

router.get("/users/images/profileImage/:_id",checkAuth,SignUp.getuserprofileImage);

router.get("/users/images/signature/:_id",checkAuth,SignUp.getsignature);

router.get("/instructor/images/profileImage/:_id",checkAuth,SignUp.getprofileImage);

router.get("/logout",checkAuth,SignUp.logout);

router.post("/upload/documents",checkAuth,uploadMultiple,SignUp.documents);
//short api 
router.get("/users/images/:document/:_id"
,SignUp.example);

// router.get("/update/profile",checkAuth,uploadMultiple,SignUp.updateProfile);
module.exports=router;