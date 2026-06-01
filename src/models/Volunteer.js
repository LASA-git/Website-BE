const mongoose = require("mongoose");

const volunteerSchema = new mongoose.Schema(
  {
    fullName: { type: String, trim: true, required: true },
    age: { type: Number, required: true },
    gender: { type: String, trim: true, required: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    interests: [{ type: String, trim: true, required: true }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Volunteer", volunteerSchema);
