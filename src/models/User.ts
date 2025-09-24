// src/models/User.ts
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    nickname: { type: String, required: true },
    googleId: { type: String, required: false },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      lowercase: true,
      trim: true,
    },
    verified: { type: Boolean, default: false },
    phone: { type: String, match: /^\d{10}$/ },
    preferredLanguage: { type: String, enum: ["en", "fr"], default: "en" },
    roles: [{ type: String, default: "User" }],
    verificationToken: { type: String },
    verificationTokenExpires: { type: Date },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
