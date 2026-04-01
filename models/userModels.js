const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    minLength: 3,
    maxLength: 30,
    unique:true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: { type: String, required: true },
  profileName: { type: String },
  bio: { type: String, maxLength: 150 },
  accountStatus: {
    type: String,
    enum: ["active", "disable", "banned"],
    default: "active",
  },
  isVerified: { type: Boolean, default: false },
  isPrivate: { type: Boolean, default: false },
  gender: { type: String, enum: ["male", "female", "others"] },
  phoneNumber: { type: String, trim: true },
  resetToken:{type:String},
  resetTokenExpires:{type:Date}
});
const User = mongoose.model("User", userSchema);

module.exports = User;
