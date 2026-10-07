import { MOCK_PASSWORD, mockApi } from '../mock';

// The mock admin API stands in for RideTrack-API `/admin/*` when EXPO_PUBLIC_USE_MOCK_API=true.
describe('admin panel (mock backend)', () => {
  it('creates a staff account that can log in with its own password', async () => {
    const user = await mockApi.adminCreateUser({
      role: 'STAFF',
      name: 'Kamal Silva',
      email: 'kamal@ridetrack.test',
      password: 'Kamal2026',
      employeeNo: 'C-2002',
      organisation: 'SLTB Kottawa Depot',
      staffType: 'INSPECTOR',
    });
    expect(user.role).toBe('STAFF');
    await expect(mockApi.login('kamal@ridetrack.test', MOCK_PASSWORD)).rejects.toThrow(/Invalid/);
    await expect(mockApi.login('kamal@ridetrack.test', 'Kamal2026')).resolves.toMatchObject({ user: { userId: user.userId } });

    const page = await mockApi.adminUsers({ q: 'kamal', page: 1, limit: 20 });
    expect(page.total).toBe(1);
    expect(page.users[0]).toMatchObject({ employeeNo: 'C-2002', staffType: 'INSPECTOR', organisation: 'SLTB Kottawa Depot' });
  });

  it('rejects a duplicate email', async () => {
    await expect(
      mockApi.adminCreateUser({ role: 'AUTHORITY', name: 'Copy', email: 'officer@ridetrack.test', password: 'abcdefg1', employeeNo: 'X', organisation: 'Y' }),
    ).rejects.toThrow(/already exists/);
  });

  it('stops a disabled account from logging in, and lets it back in once enabled', async () => {
    await mockApi.adminUpdateUser(1, { isActive: false });
    await expect(mockApi.login('passenger@ridetrack.test', MOCK_PASSWORD)).rejects.toThrow(/Invalid/);
    expect((await mockApi.adminOverview()).users.disabled).toBe(1);
    await mockApi.adminUpdateUser(1, { isActive: true });
    await expect(mockApi.login('passenger@ridetrack.test', MOCK_PASSWORD)).resolves.toBeTruthy();
  });

  it('filters accounts by role', async () => {
    const staff = await mockApi.adminUsers({ role: 'STAFF', page: 1, limit: 20 });
    expect(staff.users.every((u) => u.role === 'STAFF')).toBe(true);
  });

  it('adds a vehicle only to a route of the same kind', async () => {
    await expect(mockApi.adminCreateVehicle({ regNo: 'TR-9', type: 'TRAIN', capacity: 400, routeId: 1 })).rejects.toThrow(/cannot run on a bus route/);
    const v = await mockApi.adminCreateVehicle({ regNo: 'NB-9999', type: 'BUS', capacity: 54, routeId: 3 });
    expect(v).toMatchObject({ routeNo: '177', isActive: true });
    await expect(mockApi.adminCreateVehicle({ regNo: 'nb-9999', type: 'BUS', capacity: 54, routeId: 3 })).rejects.toThrow(/already exists/);
    expect((await mockApi.adminRoutes()).find((r) => r.routeId === 3)?.vehicles).toBe(1);
  });

  it('takes a vehicle out of service so it no longer runs trips', async () => {
    const date = new Date().toISOString().slice(0, 10);
    const before = await mockApi.adminTrips(date, 1);
    expect(before.some((t) => t.vehicleId === 102)).toBe(true);
    await mockApi.adminUpdateVehicle(102, { isActive: false });
    const after = await mockApi.adminTrips(date, 1);
    expect(after.some((t) => t.vehicleId === 102)).toBe(false);
    await mockApi.adminUpdateVehicle(102, { isActive: true });
  });

  it('pages tickets newest first', async () => {
    const first = await mockApi.adminTickets({ page: 1, limit: 5 });
    expect(first.tickets).toHaveLength(5);
    expect(first.total).toBeGreaterThan(5);
    expect(first.tickets[0].ticketId).toBeGreaterThan(first.tickets[4].ticketId);
  });
});
