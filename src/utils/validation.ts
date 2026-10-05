import { z } from 'zod';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?\d{9,15}$/;

/** Strips spaces and dashes so "077 123 4567" and "077-123-4567" both validate. */
export const normalizePhone = (v: string) => v.replace(/[\s-]/g, '');

export const isEmail = (v: string) => EMAIL.test(v.trim());
export const isPhone = (v: string) => PHONE.test(normalizePhone(v));

const identifier = z
  .string()
  .trim()
  .min(1, 'Enter your email or mobile number.')
  .refine((v) => isEmail(v) || isPhone(v), 'Enter a valid email address or mobile number.');

const password = z
  .string()
  .min(8, 'Use at least 8 characters.')
  .regex(/[A-Za-z]/, 'Include at least one letter.')
  .regex(/\d/, 'Include at least one number.');

export const loginSchema = z.object({
  identifier,
  // login only checks presence; the server decides if it is correct
  password: z.string().min(1, 'Enter your password.'),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Enter your full name.'),
    identifier,
    password,
    confirmPassword: z.string().min(1, 'Re-enter your password.'),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;

/** Splits the single identifier field into the email / phone the API expects. */
export function splitIdentifier(value: string): { email?: string; phone?: string } {
  const v = value.trim();
  return isEmail(v) ? { email: v.toLowerCase() } : { phone: normalizePhone(v) };
}
