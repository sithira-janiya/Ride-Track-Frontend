import { mockApi } from '../mock';

// Route 1 (bus 138), in order: stop 9 Pettah (fare 0), 10 Town Hall (27), 11 Thummulla (35), 12 Kirulapone (45),
// 4 Nugegoda (55) ... 5 Kottawa (96). Trip 11 belongs to route 1.
const TRIP = 11;
const PETTAH = 9;
const TOWN_HALL = 10;
const THUMMULLA = 11;
const KIRULAPONE = 12;
const NUGEGODA = 4;

describe('buying and using a ticket (mock backend)', () => {
  it('charges the fare difference between the boarding and drop-off stops', async () => {
    const { ticketId } = await mockApi.createTicket({ tripId: TRIP, boardStopId: TOWN_HALL, alightStopId: NUGEGODA });
    const ticket = await mockApi.getTicket(ticketId);
    expect(ticket.fare).toBe(55 - 27);
    expect(ticket.status).toBe('PENDING');
    expect(ticket.qrToken).toBeNull();
  });

  it('never charges less than the NTC minimum bus fare', async () => {
    const { ticketId } = await mockApi.createTicket({ tripId: TRIP, boardStopId: TOWN_HALL, alightStopId: THUMMULLA });
    expect((await mockApi.getTicket(ticketId)).fare).toBe(27); // 35 - 27 is only 8
  });

  it('rejects a drop-off stop that is not after the boarding stop', async () => {
    await expect(mockApi.createTicket({ tripId: TRIP, boardStopId: KIRULAPONE, alightStopId: KIRULAPONE })).rejects.toThrow(/after your boarding stop/);
    await expect(mockApi.createTicket({ tripId: TRIP, boardStopId: NUGEGODA, alightStopId: PETTAH })).rejects.toThrow();
  });

  it('activates and issues a QR token only after payment is confirmed', async () => {
    const { ticketId } = await mockApi.createTicket({ tripId: TRIP, boardStopId: PETTAH, alightStopId: KIRULAPONE });
    await mockApi.confirmPayment(ticketId);
    const ticket = await mockApi.getTicket(ticketId);
    expect(ticket.status).toBe('ACTIVE');
    expect(ticket.paymentStatus).toBe('PAID');
    expect(ticket.qrToken).toEqual(expect.any(String));
  });

  it('accepts a valid ticket once, then rejects it as already scanned', async () => {
    const { ticketId } = await mockApi.createTicket({ tripId: TRIP, boardStopId: PETTAH, alightStopId: KIRULAPONE });
    await mockApi.confirmPayment(ticketId);
    const { qrToken } = await mockApi.getTicket(ticketId);

    expect(await mockApi.scanTicket({ qrToken: qrToken! })).toEqual({ result: 'VALID' });
    const second = await mockApi.scanTicket({ qrToken: qrToken! });
    expect(second.result).toBe('INVALID');
    expect(second.reason).toMatch(/already been scanned/);
  });

  it('rejects unpaid, cancelled and unknown tickets with a reason', async () => {
    const unpaid = await mockApi.createTicket({ tripId: TRIP, boardStopId: PETTAH, alightStopId: KIRULAPONE });
    expect((await mockApi.scanTicket({ ticketId: unpaid.ticketId })).reason).toMatch(/Payment/);

    const paid = await mockApi.createTicket({ tripId: TRIP, boardStopId: PETTAH, alightStopId: KIRULAPONE });
    await mockApi.confirmPayment(paid.ticketId);
    await mockApi.cancelTicket(paid.ticketId);
    expect((await mockApi.scanTicket({ ticketId: paid.ticketId })).reason).toMatch(/cancelled/);

    expect((await mockApi.scanTicket({ ticketId: 987654 })).result).toBe('INVALID');
    expect((await mockApi.scanTicket({ qrToken: 'garbage' })).result).toBe('INVALID');
  });

  it('only lets an unused ticket be cancelled, and refunds it', async () => {
    const { ticketId } = await mockApi.createTicket({ tripId: TRIP, boardStopId: PETTAH, alightStopId: KIRULAPONE });
    await expect(mockApi.cancelTicket(ticketId)).rejects.toThrow(/unused/); // still pending
    await mockApi.confirmPayment(ticketId);
    const cancelled = await mockApi.cancelTicket(ticketId);
    expect(cancelled.status).toBe('CANCELLED');
    expect(cancelled.paymentStatus).toBe('REFUNDED');
  });

  it('pages the ticket history', async () => {
    const first = await mockApi.listTickets('USED', 1);
    expect(first.items.length).toBeGreaterThan(0);
    expect(first.items.every((t) => t.status === 'USED')).toBe(true);
    const all = await mockApi.listTickets(undefined, 1);
    if (all.nextPage) expect((await mockApi.listTickets(undefined, all.nextPage)).items.length).toBeGreaterThan(0);
  });
});
