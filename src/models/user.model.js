const mongoose = require("mongoose");

const reviewItemSchema = new mongoose.Schema({
  code: { type: String, required: true },
  language: { type: String, required: false },
  description: { type: String, required: false },
  result: { type: Object, required: true },
  status: { type: String, default: "completed" },
  createdAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },

  password: {
    type: String,
    required: function () {
      return !this.google;
    },
  },

  avatarUrl: { type: String, default: "" },
  google: { type: Boolean, default: false },

  reviewHistory: [reviewItemSchema],

  // 🔹 FORGOT PASSWORD FIELDS
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
});

module.exports = mongoose.model("User", userSchema);
