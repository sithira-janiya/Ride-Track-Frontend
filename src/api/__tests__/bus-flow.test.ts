import { MOCK_DRIVER_CODE, MOCK_PASSWORD, mockApi } from '../mock';

// Mirrors RideTrack-API's "bus QR and driver panel" tests against the mock backend.
// Demo bus NB-1234 (vehicle 101, route 138) has sticker code DEMOBUS101 and is run by the demo driver (user 4).
const DRIVER = 4;
const codeOf = (p: Promise<unknown>) => p.then(() => null, (e: { code?: string }) => e.code ?? null);

describe('scanning a bus QR (mock backend)', () => {
  it('shows the bus, its route, trip and live position, for any case of the code', async () => {
    const view = await mockApi.getBus('demobus101');
    expect(view.bus).toMatchObject({ vehicleId: 101, regNo: 'NB-1234', code: 'DEMOBUS101' });
    expect(view.route).toMatchObject({ routeId: 1, routeNo: '138' });
    expect(view.route.stops.length).toBeGreaterThan(1);
    expect(view.trip?.vehicleId).toBe(101);
    expect(view.live?.vehicleId).toBe(101);
  });

  it('says an unknown code is not recognised', async () => {
    expect(await codeOf(mockApi.getBus('NOSUCHBUS'))).toBe('BUS_NOT_FOUND');
  });
});

describe('driver panel (mock backend)', () => {
  it('signs drivers in only with their driver code', async () => {
    const r = await mockApi.driverLogin(MOCK_DRIVER_CODE.toLowerCase(), MOCK_PASSWORD);
    expect(r.user.role).toBe('DRIVER');
    await expect(mockApi.login('driver@ridetrack.test', MOCK_PASSWORD)).rejects.toThrow('Invalid email/phone or password.');
    await expect(mockApi.driverLogin(MOCK_DRIVER_CODE, 'WrongPass1')).rejects.toThrow('Invalid driver code or password.');
    await expect(mockApi.driverLogin('DRV-NOPE99', MOCK_PASSWORD)).rejects.toThrow('Invalid driver code or password.');
  });

  it('shows the driver their bus, route and QR code', async () => {
    const me = await mockApi.driverMe(DRIVER);
    expect(me).toMatchObject({ role: 'DRIVER', driverCode: MOCK_DRIVER_CODE, onDuty: false, bus: { vehicleId: 101, regNo: 'NB-1234' } });
    expect(me.bus?.qr.code).toBe('DEMOBUS101');
    expect(me.bus?.qr.url).toMatch(/\/b\/DEMOBUS101$/);
  });

  it('takes the bus position from the driver phone only while on duty', async () => {
    const fix = { lat: 6.9271, lng: 79.8612 };
    expect(await codeOf(mockApi.driverReportLocation(DRIVER, fix))).toBe('OFF_DUTY');
    expect(await mockApi.driverSetDuty(DRIVER, true)).toEqual({ onDuty: true });
    await mockApi.driverReportLocation(DRIVER, fix);
    const view = await mockApi.getBus('DEMOBUS101');
    expect(view).toMatchObject({ driverOnDuty: true, live: { vehicleId: 101, lat: fix.lat, lng: fix.lng } });
  });

  it('records occupancy up to the bus capacity', async () => {
    expect(await mockApi.driverSetOccupancy(DRIVER, 12)).toEqual({ vehicleId: 101, passengerCount: 12, capacity: 52 });
    expect(await codeOf(mockApi.driverSetOccupancy(DRIVER, 60))).toBe('VALIDATION_ERROR');
  });

  it('lets the driver run only their own trips', async () => {
    const trips = await mockApi.driverTrips(DRIVER);
    expect(trips.length).toBeGreaterThan(0);
    expect(trips.every((t) => t.vehicleId === 101)).toBe(true);
    expect(await codeOf(mockApi.driverStartTrip(DRIVER, 13))).toBe('NOT_FOUND'); // trip 13 is bus 102's

    expect(await codeOf(mockApi.driverEndTrip(DRIVER, 14))).toBe('TRIP_NOT_RUNNING'); // not started yet
    expect((await mockApi.driverEndTrip(DRIVER, 11)).status).toBe('COMPLETED');
    await mockApi.driverSetDuty(DRIVER, false);
    expect((await mockApi.driverStartTrip(DRIVER, 14)).status).toBe('ONGOING');
    expect((await mockApi.driverMe(DRIVER)).onDuty).toBe(true); // departing puts the driver on duty
    expect((await mockApi.getBus('DEMOBUS101')).trip?.tripId).toBe(14);
  });

  it('counts paid and boarded tickets on a trip, without passenger details', async () => {
    const before = await mockApi.driverTripPassengers(DRIVER, 14);
    const { ticketId } = await mockApi.createTicket({ tripId: 14, boardStopId: 1, alightStopId: 3 });
    await mockApi.confirmPayment(ticketId);
    const after = await mockApi.driverTripPassengers(DRIVER, 14);
    expect(after).toMatchObject({ tripId: 14, paid: before.paid + 1, boarded: before.boarded, revenue: before.revenue + 50 });
    expect(JSON.stringify(after)).not.toContain('passenger@ridetrack.test');
  });

  it('sends an alert to the trip the bus is running, and refuses finished trips', async () => {
    const alert = await mockApi.driverRaiseAlert(DRIVER, { type: 'DELAY', message: 'Heavy traffic at Borella.', delayMinutes: 15 });
    expect(alert.tripId).toBe(14);
    expect((await mockApi.getAlerts()).map((a) => a.alertId)).toContain(alert.alertId);
    expect(await codeOf(mockApi.driverRaiseAlert(DRIVER, { tripId: 11, type: 'DELAY', message: 'Too late now.' }))).toBe('TRIP_NOT_RUNNING');
  });

  it('replaces the bus QR code: the old sticker stops working', async () => {
    const qr = await mockApi.driverRotateQr(DRIVER);
    expect(qr.code).toMatch(/^[A-HJ-NP-Z2-9]{8}$/);
    expect(await codeOf(mockApi.getBus('DEMOBUS101'))).toBe('BUS_NOT_FOUND');
    expect((await mockApi.getBus(qr.code)).bus.vehicleId).toBe(101);
    expect((await mockApi.driverBusQr(DRIVER)).code).toBe(qr.code);
  });
});
