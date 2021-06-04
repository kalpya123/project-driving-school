const express= require("express");
const Book = require("../controller/book");
const checkAuth=require("../middleware/checkAuth");
const router=express.Router();




router.post("/all/:gender/:shift",checkAuth,Book.allInstructors);

router.post("/add",checkAuth,Book.bookInstructor)

router.post("/booking",checkAuth,Book.Booked);

router.get("/user/:_id",checkAuth,Book.GetInfo);

router.post("/update/status/:_id",checkAuth,Book.updateStatus);

router.get("/users/status",checkAuth,Book.userStatus);

router.post("/cancel/:name/:_id",checkAuth,Book.cancel);

module.exports=router;