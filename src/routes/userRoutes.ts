// src/routes/userRoutes.ts
import express from "express";

import {
  deleteUser,
  getAllUsers,
  getMe,
  getUserById,
  updateProfile,
} from "../controllers/userController.js";
import validateBody from "../middlewares/validate.js";
import { updateProfileSchema } from "../validations/userValidation.js";

const router = express.Router();

router.get("/", getAllUsers);
router.get("/me", getMe);
router.get("/:id", getUserById);
router.patch("/:id", validateBody(updateProfileSchema), updateProfile);
router.delete("/:id", deleteUser);

export default router;
