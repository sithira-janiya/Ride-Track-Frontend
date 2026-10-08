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

/** Bus drivers sign in with the code an admin issued them (e.g. DRV-4K7Q2M). Matches RideTrack-API `POST /driver/auth/login`. */
export const driverLoginSchema = z.object({
  driverCode: z
    .string()
    .trim()
    .toUpperCase()
    .min(4, 'Enter your driver code, for example DRV-4K7Q2M.')
    .max(12, 'Driver codes have at most 12 characters.'),
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

/** An officer creating a staff or officer account (admin panel). Matches RideTrack-API `POST /admin/users`. */
export const staffAccountSchema = z
  .object({
    role: z.enum(['STAFF', 'AUTHORITY']),
    name: z.string().trim().min(2, 'Enter their full name.').max(100, 'Use 100 characters or fewer.'),
    identifier: z
      .string()
      .trim()
      .min(1, 'Enter their email or mobile number.')
      .refine((v) => isEmail(v) || isPhone(v), 'Enter a valid email address or mobile number.'),
    password,
    employeeNo: z.string().trim().min(1, 'Enter the employee number.').max(30, 'Use 30 characters or fewer.'),
    organisation: z.string().trim().min(1, 'Enter the depot, operator or department.').max(100, 'Use 100 characters or fewer.'),
    staffType: z.enum(['CONDUCTOR', 'INSPECTOR']).optional(),
    vehicleId: z.number().optional(),
  })
  .refine((v) => v.role !== 'STAFF' || v.staffType, { path: ['staffType'], message: 'Choose conductor or inspector.' });

/** Adding a bus or train (admin panel). Capacity is typed, so it arrives as text. */
export const vehicleSchema = z.object({
  regNo: z.string().trim().min(1, 'Enter the registration number.').max(30, 'Use 30 characters or fewer.'),
  capacity: z
    .string()
    .trim()
    .regex(/^\d+$/, 'Enter a whole number of seats and standing places.')
    .refine((v) => Number(v) >= 1 && Number(v) <= 5000, 'Capacity must be between 1 and 5000.'),
  routeId: z.number({ error: 'Choose the route it runs on.' }),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type DriverLoginForm = z.infer<typeof driverLoginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
export type StaffAccountForm = z.infer<typeof staffAccountSchema>;
export type VehicleForm = z.infer<typeof vehicleSchema>;

/** Splits the single identifier field into the email / phone the API expects. */
export function splitIdentifier(value: string): { email?: string; phone?: string } {
  const v = value.trim();
  return isEmail(v) ? { email: v.toLowerCase() } : { phone: normalizePhone(v) };
}
