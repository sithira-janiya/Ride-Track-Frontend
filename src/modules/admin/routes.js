import { Router } from 'express';
import { z } from 'zod';

import { requireBackOffice } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { send, wrap } from '../../utils/async.js';
import { ADMIN_PASSWORD, EMAIL, NAME, PASSWORD, PHONE } from '../auth/schemas.js';
import {
  createUser,
  createVehicle,
  listRoutes,
  listTickets,
  listTrips,
  listUsers,
  listVehicles,
  overview,
  updateUser,
  updateVehicle,
} from './service.js';

const id = z.coerce.number().int().positive();
const page = z.coerce.number().int().min(1).default(1);
const limit = z.coerce.number().int().min(1).max(100).default(50);
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the format YYYY-MM-DD.');

/**
 * Back-office endpoints, mounted at /admin: the app's Admin tab and the web panel (authority officers),
 * and admin accounts (signed in through /admin/auth). Only an admin can create or change an admin account.
 */
const router = Router();
router.use(requireBackOffice);

router.get('/overview', wrap(async (_req, res) => send(res, await overview())));

router.get(
  '/users',
  validate({
    query: z.object({
      q: z.string().trim().max(100).optional(),
      role: z.enum(['PASSENGER', 'STAFF', 'AUTHORITY', 'ADMIN']).optional(),
      page,
      limit,
    }),
  }),
  wrap(async (req, res) => send(res, await listUsers(req.valid.query))),
);

const unitName = z.string().trim().min(1).max(100);

router.post(
  '/users',
  validate({
    body: z
      .object({
        name: NAME,
        email: EMAIL.optional(),
        phone: PHONE.optional(),
        password: PASSWORD,
        role: z.enum(['STAFF', 'AUTHORITY', 'ADMIN']),
        employeeNo: z.string().trim().min(1).max(30).optional(),
        organisation: unitName.optional(),
        department: unitName.optional(), // same as organisation, for officers
        staffType: z.enum(['CONDUCTOR', 'INSPECTOR']).optional(),
        vehicleId: id.optional(),
      })
      .refine((v) => v.email || v.phone, { message: 'Provide an email address or a mobile number.', path: ['email'] })
      // admins sign in by email only, with a longer password
      .refine((v) => v.role !== 'ADMIN' || v.email, { message: 'Admins need an email address.', path: ['email'] })
      .superRefine((v, ctx) => {
        if (v.role !== 'ADMIN') return;
        const check = ADMIN_PASSWORD.safeParse(v.password);
        if (!check.success) ctx.addIssue({ code: 'custom', path: ['password'], message: check.error.issues[0].message });
      }),
  }),
  wrap(async (req, res) => send(res, await createUser(req.user, req.valid.body), 201)),
);

router.patch(
  '/users/:id',
  validate({ params: z.object({ id }), body: z.object({ isActive: z.boolean().optional(), vehicleId: id.nullable().optional() }) }),
  wrap(async (req, res) => send(res, await updateUser(req.user, req.valid.params.id, req.valid.body))),
);

router.get('/routes', wrap(async (_req, res) => send(res, await listRoutes())));

router.get('/vehicles', wrap(async (_req, res) => send(res, await listVehicles())));

router.post(
  '/vehicles',
  validate({
    body: z.object({
      regNo: z.string().trim().min(1).max(30),
      type: z.enum(['BUS', 'TRAIN']),
      capacity: z.number().int().min(1).max(5000),
      routeId: id,
    }),
  }),
  wrap(async (req, res) => send(res, await createVehicle(req.valid.body), 201)),
);

router.patch(
  '/vehicles/:id',
  validate({
    params: z.object({ id }),
    body: z
      .object({ regNo: z.string().trim().min(1).max(30), capacity: z.number().int().min(1).max(5000), routeId: id, isActive: z.boolean() })
      .partial(),
  }),
  wrap(async (req, res) => send(res, await updateVehicle(req.valid.params.id, req.valid.body))),
);

router.get(
  '/trips',
  validate({ query: z.object({ date: day, routeId: id.optional() }) }),
  wrap(async (req, res) => send(res, await listTrips(req.valid.query))),
);

router.get(
  '/tickets',
  validate({ query: z.object({ status: z.enum(['PENDING', 'ACTIVE', 'USED', 'EXPIRED', 'CANCELLED']).optional(), page, limit }) }),
  wrap(async (req, res) => send(res, await listTickets(req.valid.query))),
);

export default router;
