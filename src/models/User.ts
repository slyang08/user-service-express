// src/models/User.ts
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    nickname: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    verified: { type: Boolean, default: false },
    phone: { type: String, match: /^\d{10}$/ },
    preferredLanguage: { type: String, enum: ["en", "fr"], default: "en" },
    roles: [{ type: String }],
    status: { type: String, default: "Active" },
    socialAccounts: {
      google: String,
    },
    oauthLastLogin: Date,
    oauthProvider: String,
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
