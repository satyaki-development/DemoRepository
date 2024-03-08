const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  companyName: { type: String, required: false },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  department: { type: String, required: true },
  userRole: { type: String, required: true },
  idNumber: { type: String, required: true },
  // idNumber: { // Add idNumber field
  //   type: Number,
  //   unique: true, // Ensure uniqueness
  //   required: true,
  // },
  companyEmail: { type: String, required: true },
  locations: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  category: { type: String, required: false },
  profilePicture: { type: String, required: false },
  id: { type: String },
});



module.exports = mongoose.model("user", userSchema);
