require("dotenv").config({quiet:true});
const express = require("express");
const User = require("../models/userModels");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const router =express.Router();

router.post("/",async(req,res)=>{
  const {username,email,password}=req.body;
  if(!username||!email||!password){
    return res.status(400).json({message:"missing required form fields!!!",success:false})
  }
  const user = await User.findOne({
    $or:[{username:username},{email:email}]
  });
  if(user){
    return res.status(400).json({message:user.username ===username?"Username is already taken!":"Email is already registered!",success:false});
  }
  const hashedPass=await bcrypt.hash(password,10);
  const newUser = new User({
    username,
    email,
    password:hashedPass
  });
  await newUser.save();
  const token=generateToken({_id:newUser._id,username:newUser.username});
  res.status(201).json(token);
})

//user login api
router.post("/login",async(req,res)=>{
  //find the user
  const {username,password}=req.body;
  if(!username||!password)return res.status(400).json({message:"Missing required form fields!!!",success:false})

  let inputEmail;
  if(username.endsWith(".com")){
    inputEmail=username;
  }
  console.log(inputEmail);
    const user = await User.findOne({
      $or:[{username:username},{email:inputEmail}]
    });
    if(!user)return res.status(404).json({message:'Invalid credentials',success:false})
    
    res.json(user)

})


//*==> common functions
const generateToken = (data)=>{
  return jwt.sign(data,process.env.JWT_KEY)
}


module.exports = router;
