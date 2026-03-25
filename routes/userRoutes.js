require("dotenv").config({ quiet: true });
const express = require("express");
const User = require("../models/userModels");
const authMiddleware = require("../middleware/authMiddleware");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = express.Router();

router.post("/", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ message: "missing required form fields!!!", success: false });
  }
  const user = await User.findOne({
    $or: [{ username: username }, { email: email }],
  });
  if (user) {
    return res.status(400).json({
      message:
        user.username === username
          ? "Username is already taken!"
          : "Email is already registered!",
      success: false,
    });
  }
  const hashedPass = await bcrypt.hash(password, 10);
  const newUser = new User({
    username,
    email,
    password: hashedPass,
  });
  await newUser.save();
  const token = generateToken({ _id: newUser._id, username: newUser.username });
  res.status(201).json(token);
});

//user login api
router.post("/login", async (req, res) => {
  //find the user
  const { username, password } = req.body;
  if (!username || !password)
    return res
      .status(400)
      .json({ message: "Missing required form fields!!!", success: false });

  let inputEmail;
  if (username.endsWith(".com")) {
    inputEmail = username;
  }
  const user = await User.findOne({
    $or: [{ username: username }, { email: inputEmail }],
  });
  if (!user)
    return res
      .status(400)
      .json({ message: "Invalid credentials", success: false });

  //compare password with bcrypt

  const comparedPass = await bcrypt.compare(password, user.password);
  console.log(comparedPass);
  if (!comparedPass)
    return res
      .status(400)
      .json({ message: "Invalid credentials", success: false });
  const token = generateToken({ _id: user._id, username: user.username });
  res.status(200).json(token);
});

//user logged in or not
router.get("/", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password -__v");
  res.json(user);
});

// resetting password
router.post("/request-reset-password", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email });
  if (!user)
    return res
      .status(404)
      .json({
        message: "Email is not register! Please try with new email!",
        success: false,
      });

  const resetToken = jwt.sign({ _id: user._id }, process.env.JWT_KEY, {
    expiresIn: "1h",
  });
  res
    .status(201)
    .json({
      message: "Password reset link send to your email",
      resetToken: resetToken,
    });
});
router.post("/reset-password", async (req, res) => {
  const { resetToken, newPassword } = req.body;
  //verify the token
  const decodedUser = jwt.verify(resetToken, process.env.JWT_KEY);
  if (!decodedUser)
    return res
      .status(401)
      .json({ message: "reset token expires", success: false });

  let user = await User.findById(decodedUser._id);

  const hashedPass = await bcrypt.hash(newPassword, 10);
  user.password = hashedPass;
  await user.save();
  res.json({message:"Password reset successfully",success:true});
});

//? ----------------------------------- common functions ---------------------------------- */

const generateToken = (data) => {
  return jwt.sign(data, process.env.JWT_KEY);
};

module.exports = router;
