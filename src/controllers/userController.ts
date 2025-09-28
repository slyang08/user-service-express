// src/controllers/userController.ts
import { Request, Response, NextFunction } from "express";

import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import { generateVerificationToken, verificationContent } from "../utils/verifyEmail.js";

/**
 * @desc    Register a new user
 * @route   POST /api/user/register
 * @access  Public
 */
export const register = async (req: Request, res: Response) => {
  const { nickname, email } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user && user.verified) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const { token, expires } = generateVerificationToken();

    if (user) {
      // Generate/Update verification token
      user.verificationToken = token;
      user.verificationTokenExpires = expires;
      user.nickname = nickname;
      await user.save();
    } else {
      user = new User({
        nickname,
        email,
        verified: false,
        verificationToken: token,
        verificationTokenExpires: expires,
      });
      await user.save();
    }

    // Send verification email
    const verifyUrl = `${process.env.VERIFY_URL}/verify-email?token=${token}&id=${user._id}`;
    await sendEmail(email, "Verify your email", verificationContent(verifyUrl));

    res.status(201).json({ message: "Verification email sent", userId: user._id });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error });
  }
};

/**
 * @desc    Verify email address
 * @route   GET /api/users/verify-email
 * @access  Public
 */
export const verifyEmail = async (req: Request, res: Response) => {
  const { token, id } = req.query;

  if (!token || !id) {
    return res.status(400).json({ message: "Missing token or id" });
  }

  try {
    // Find the user
    const user = await User.findById(id);
    if (!user) {
      return res.status(400).json({
        message: "User does not exist",
      });
    }

    // Already verified
    if (user.verified) {
      return res.json({
        success: true,
        message: "Already verified!",
        data: {
          redirectUrl: "/login",
          autoRedirect: true,
        },
      });
    }

    // Check token validity
    if (user.verificationToken !== token) {
      return res.status(400).json({
        message: "Verification code is invalid",
      });
    }

    // Check timeliness
    if (!user.verificationTokenExpires || user.verificationTokenExpires.getTime() < Date.now()) {
      return res.status(400).json({
        message: "The verification link has expired, please reapply",
      });
    }

    // Update verification status
    user.verified = true;
    user.verificationToken = undefined; // Clear used token
    user.verificationTokenExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Verification successful!",
      data: {
        redirectUrl: "/login",
        autoRedirect: true,
      },
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Unknown error" });
    }
  }
};

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private (valid JWT required)
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Unknown error" });
    }
  }
};

/**
 * @desc    Get a single user by ID
 * @route   GET /api/users/:id
 * @access  Private (valid JWT required)
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Unknown error" });
    }
  }
};

/**
 * @desc    Get a single user by email
 * @route   GET /api/users/email/:email
 * @access  Private (valid JWT required)
 */
export const getUserByEmail = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ email: req.params.email }).lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Update logged-in user's profile (nickname, phone, language)
 * @route   PATCH /api/users/:id
 * @access  Private (valid JWT required)
 */
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get current login id (supports session or JWT)
    const currentUserId = req.user?._id?.toString() || req.userId;
    // Only allow owner to change itself information
    if (req.params.id !== currentUserId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { nickname, phone, preferredLanguage } = req.body;
    const updateFields: { nickname?: string; phone?: string; preferredLanguage?: string } = {};
    if (nickname !== undefined) updateFields.nickname = nickname;
    if (phone !== undefined) updateFields.phone = phone;
    if (preferredLanguage !== undefined) updateFields.preferredLanguage = preferredLanguage;

    // Update and send back new data
    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private (valid JWT required)
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Unknown error" });
    }
  }
};
