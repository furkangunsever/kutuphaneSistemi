const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "İsim alanı zorunludur"],
    },
    email: {
      type: String,
      required: [true, "Email alanı zorunludur"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Şifre alanı zorunludur"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["superadmin", "librarian", "user"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
