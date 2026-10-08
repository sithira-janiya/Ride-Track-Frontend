import { staffAccountSchema, vehicleSchema } from '../validation';

describe('staff account validation (admin)', () => {
  const ok = {
    role: 'STAFF' as const,
    name: 'Kamal Silva',
    identifier: '0771234567',
    password: 'abcdefg1',
    employeeNo: 'C-2002',
    organisation: 'SLTB Kottawa Depot',
    staffType: 'CONDUCTOR' as const,
  };

  it('accepts staff and officer accounts', () => {
    expect(staffAccountSchema.safeParse(ok).success).toBe(true);
    expect(staffAccountSchema.safeParse({ ...ok, role: 'AUTHORITY', staffType: undefined }).success).toBe(true);
  });

  it('requires conductor or inspector for staff', () => {
    const r = staffAccountSchema.safeParse({ ...ok, staffType: undefined });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].path).toEqual(['staffType']);
  });

  it('requires an employee number and a strong first password', () => {
    expect(staffAccountSchema.safeParse({ ...ok, employeeNo: ' ' }).success).toBe(false);
    expect(staffAccountSchema.safeParse({ ...ok, password: 'abcdefgh' }).success).toBe(false);
  });
});

describe('vehicle validation (admin)', () => {
  it('accepts a vehicle with a route and a capacity', () => {
    expect(vehicleSchema.safeParse({ regNo: 'NB-9999', capacity: '54', routeId: 1 }).success).toBe(true);
  });

  it('rejects a missing route and out-of-range or non-numeric capacity', () => {
    expect(vehicleSchema.safeParse({ regNo: 'NB-9999', capacity: '54' }).success).toBe(false);
    expect(vehicleSchema.safeParse({ regNo: 'NB-9999', capacity: '0', routeId: 1 }).success).toBe(false);
    expect(vehicleSchema.safeParse({ regNo: 'NB-9999', capacity: '5001', routeId: 1 }).success).toBe(false);
    expect(vehicleSchema.safeParse({ regNo: 'NB-9999', capacity: '4.5', routeId: 1 }).success).toBe(false);
  });
});
