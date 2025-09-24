// src/routes/userRoutes.ts
import express from "express";

import {
  deleteUser,
  getAllUsers,
  getUserById,
  getUserByEmail,
  register,
  updateProfile,
  verifyEmail,
} from "../controllers/userController.js";
import validateBody from "../middlewares/validate.js";
import { updateProfileSchema } from "../validations/userValidation.js";

const router = express.Router();

router.get("/", getAllUsers);
router.post("register", register);
router.get("verify-email", verifyEmail);
router.get("/:id", getUserById);
router.get("/email/:email", getUserByEmail);
router.patch("/:id", validateBody(updateProfileSchema), updateProfile);
router.delete("/:id", deleteUser);

export default router;
