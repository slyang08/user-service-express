// src/validations/userValidation.js
import { z } from "zod";

export const updateProfileSchema = z.object({
  nickname: z.string().min(2).max(30).optional(),
  phone: z
    .string()
    .regex(/^\d{10}$/, { message: "Phone number must be exactly 10 digits" })
    .optional(),
  preferredLanguage: z.enum(["en", "fr"]).optional(),
});
