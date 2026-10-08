import { z } from 'zod';

import { identifierField, newPasswordField } from '@/utils/validation';

/** An officer creating a staff or officer account. Matches RideTrack-API `POST /admin/users`. */
export const staffAccountSchema = z
  .object({
    role: z.enum(['STAFF', 'AUTHORITY']),
    name: z.string().trim().min(2, 'Enter their full name.').max(100, 'Use 100 characters or fewer.'),
    identifier: identifierField('Enter their email or mobile number.'),
    password: newPasswordField,
    employeeNo: z.string().trim().min(1, 'Enter the employee number.').max(30, 'Use 30 characters or fewer.'),
    organisation: z.string().trim().min(1, 'Enter the depot, operator or department.').max(100, 'Use 100 characters or fewer.'),
    staffType: z.enum(['CONDUCTOR', 'INSPECTOR']).optional(),
    vehicleId: z.number().optional(),
  })
  .refine((v) => v.role !== 'STAFF' || v.staffType, { path: ['staffType'], message: 'Choose conductor or inspector.' });

/** Adding a bus or train. Capacity is typed, so it arrives as text. */
export const vehicleSchema = z.object({
  regNo: z.string().trim().min(1, 'Enter the registration number.').max(30, 'Use 30 characters or fewer.'),
  capacity: z
    .string()
    .trim()
    .regex(/^\d+$/, 'Enter a whole number of seats and standing places.')
    .refine((v) => Number(v) >= 1 && Number(v) <= 5000, 'Capacity must be between 1 and 5000.'),
  routeId: z.number({ error: 'Choose the route it runs on.' }),
});

export type StaffAccountForm = z.infer<typeof staffAccountSchema>;
export type VehicleForm = z.infer<typeof vehicleSchema>;
