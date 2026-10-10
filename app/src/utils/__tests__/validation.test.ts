import { loginSchema, registerSchema, splitIdentifier, staffAccountSchema, vehicleSchema } from '../validation';

describe('login validation', () => {
  it('accepts an email or a phone number', () => {
    expect(loginSchema.safeParse({ identifier: 'a@b.co', password: 'x' }).success).toBe(true);
    expect(loginSchema.safeParse({ identifier: '077 123 4567', password: 'x' }).success).toBe(true);
  });

  it('rejects an empty or malformed identifier with a clear message', () => {
    const empty = loginSchema.safeParse({ identifier: '', password: 'x' });
    expect(empty.success).toBe(false);
    const bad = loginSchema.safeParse({ identifier: 'not-an-email', password: 'x' });
    expect(bad.success).toBe(false);
    if (!bad.success) expect(bad.error.issues[0].message).toMatch(/valid email/i);
  });

  it('requires a password', () => {
    expect(loginSchema.safeParse({ identifier: 'a@b.co', password: '' }).success).toBe(false);
  });
});

describe('register validation', () => {
  const ok = { name: 'Nimal Perera', identifier: 'nimal@example.com', password: 'abcdefg1', confirmPassword: 'abcdefg1' };

  it('accepts a valid form', () => {
    expect(registerSchema.safeParse(ok).success).toBe(true);
  });

  it('rejects weak passwords', () => {
    expect(registerSchema.safeParse({ ...ok, password: 'short1', confirmPassword: 'short1' }).success).toBe(false);
    expect(registerSchema.safeParse({ ...ok, password: 'abcdefgh', confirmPassword: 'abcdefgh' }).success).toBe(false);
    expect(registerSchema.safeParse({ ...ok, password: '12345678', confirmPassword: '12345678' }).success).toBe(false);
  });

  it('rejects mismatched passwords on the confirm field', () => {
    const r = registerSchema.safeParse({ ...ok, confirmPassword: 'different1' });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].path).toEqual(['confirmPassword']);
  });
});

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

describe('splitIdentifier', () => {
  it('lowercases emails and strips phone separators', () => {
    expect(splitIdentifier(' Nimal@Example.com ')).toEqual({ email: 'nimal@example.com' });
    expect(splitIdentifier('077-123 4567')).toEqual({ phone: '0771234567' });
  });
});
