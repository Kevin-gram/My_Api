const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config()
const multer = require('multer');
const upload = require('../multer/multer');
const uploadFile = require("../cloud/cloudinary")

//getting all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", getUser, async (req, res) => {
  try {
   const { user } = req
    res.json({ message: "success", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/",upload.single("image"), async (req, res) => {

  try {
    const result = await uploadFile(req.file, res);
    const user = await User.findOne({ email: req.body.email });
    if(user){
      return res.status(400).json({
        status: "failed",
        message: "user with this email already exist",
        
      })
    }
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      image: result.secure_url
    });
    console.log(req.body);
    return res.status(201).json({ status: "success", newUser });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "successfuly deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try{
    const user = await User.findOne({email: req.body.email});
    if(!user){
      return res.status(404).json({status: "failed",
    message: 'user with this email does not exist'})
    }
    if(await bcrypt.compare(req.body.password, user.password)){
      return res.status(200).json({
        status: 'success',
        token: jwt.sign({ userId: user._id}, process.env.JWT_SECRET, { expiresIn: "1d"})
      })
    } else {
      return res.status(400).json({
        status: 'failed',
        message: 'password is incorrect'
      })
    }

  } catch(err){
    res.status(400).json({message: err.message})
  }
})

async function getUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

router.patch("/:id", getUser, async (req, res) => {
  if (req.body.name != null) {
    req.user.name = req.body.name;
  }
  if (req.body.email != null) {
    req.user.email = req.body.email;
  }
  if (req.body.password != null) {
    req.user.password = req.body.password;
  }
  try {
    const updatedUser = await req.user.save();
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
router.put("/:id", getUser, async (req, res) => {
  if (req.body.name != null) {
    req.user.name = req.body.name;
  }
  if (req.body.email != null) {
    req.user.email = req.body.email;
  }
  if (req.body.password != null) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    req.user.password = hashedPassword;
  }
  try {
    const updatedUser = await req.user.save();
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
module.exports = router;
