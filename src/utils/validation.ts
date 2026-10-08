// Validation building blocks shared by several forms. Each form's schema lives with its feature
// (features/auth/validation.ts, features/admin/validation.ts).
import { z } from 'zod';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?\d{9,15}$/;

/** Strips spaces and dashes so "077 123 4567" and "077-123-4567" both validate. */
export const normalizePhone = (v: string) => v.replace(/[\s-]/g, '');

export const isEmail = (v: string) => EMAIL.test(v.trim());
export const isPhone = (v: string) => PHONE.test(normalizePhone(v));

/** One field that takes an email or a mobile number. */
export const identifierField = (emptyMessage: string) =>
  z
    .string()
    .trim()
    .min(1, emptyMessage)
    .refine((v) => isEmail(v) || isPhone(v), 'Enter a valid email address or mobile number.');

/** Rules for a new password: 8+ characters with a letter and a number. */
export const newPasswordField = z
  .string()
  .min(8, 'Use at least 8 characters.')
  .regex(/[A-Za-z]/, 'Include at least one letter.')
  .regex(/\d/, 'Include at least one number.');

/** Splits the single identifier field into the email / phone the API expects. */
export function splitIdentifier(value: string): { email?: string; phone?: string } {
  const v = value.trim();
  return isEmail(v) ? { email: v.toLowerCase() } : { phone: normalizePhone(v) };
}
