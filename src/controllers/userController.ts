// src/controllers/userController.ts
import { Request, Response, NextFunction } from "express";

import User from "../models/User.js";

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
 * @desc    Get current user info
 * @route   GET /api/auth/me
 * @access  Private (valid JWT required)
 */
export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (err) {
    next(err);
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
