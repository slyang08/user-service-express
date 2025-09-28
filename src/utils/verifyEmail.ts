// src/utils/verifyEmail.js
import crypto from "crypto";

// Generate verification token function
export const generateVerificationToken = () => {
  return {
    token: crypto.randomBytes(32).toString("hex"),
    expires: new Date(Date.now() + Number(process.env.VERIFICATION_EXPIRES || 15 * 60 * 1000)), // 15 minutes by default
  };
};

// Email template function
export const verificationContent = (verifyUrl: string, isResend = false) => `
    <h2>${isResend ? "New Verification Link" : "Welcome to register FinTrackEasy"}</h2>
    <p>Please click the link below to complete the email verification</p>
    <p>Your verification link expires in <strong>${process.env.VERIFICATION_EXPIRES ? Number(process.env.VERIFICATION_EXPIRES) / 60000 : 15} minutes</strong>:</p>
    <a href="${verifyUrl}" style="padding: 10px; background: #007bff; color: white; text-decoration: none;">Verify now</a>
    <p>Can't click? Copy this URL:<br/>${verifyUrl}</p>
`;
