import { z } from 'zod';

import { identifierField, newPasswordField } from '@/utils/validation';

const identifier = identifierField('Enter your email or mobile number.');

export const loginSchema = z.object({
  identifier,
  // login only checks presence; the server decides if it is correct
  password: z.string().min(1, 'Enter your password.'),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Enter your full name.'),
    identifier,
    password: newPasswordField,
    confirmPassword: z.string().min(1, 'Re-enter your password.'),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
