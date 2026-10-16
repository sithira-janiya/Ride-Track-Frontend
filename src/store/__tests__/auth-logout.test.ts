import { useAlertBanner } from '@/store/alert-banner';
import { useAuth } from '@/store/auth';
import { useShift } from '@/store/shift';
import { useTicketCache } from '@/store/tickets';
import type { Ticket, User } from '@/types';
import { removeItem } from '@/utils/secure-storage';

jest.mock('@/utils/secure-storage', () => ({ getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() }));

const staff: User = { userId: 2, name: 'Sunil Fernando', email: 'staff@ridetrack.test', phone: null, role: 'STAFF', isActive: true };

describe('logging out', () => {
  beforeEach(async () => {
    await useAuth.getState().setSession({ user: staff, accessToken: 'access', refreshToken: 'refresh' });
    useShift.getState().start({ routeId: 1, routeNo: '138', tripId: 11, vehicleId: 101 });
    useTicketCache.getState().upsert([{ ticketId: 100 } as Ticket]);
    useTicketCache.getState().addPending(101);
    useAlertBanner.getState().show('Route 138 is running late');
  });

  it('clears the account, its tickets, the shift and the alert banner, and forgets the saved session', async () => {
    await useAuth.getState().logout();
    expect(useAuth.getState()).toMatchObject({ user: null, accessToken: null, refreshToken: null });
    expect(useTicketCache.getState()).toMatchObject({ byId: {}, pendingIds: [] });
    expect(useShift.getState().shift).toBeNull();
    expect(useAlertBanner.getState().message).toBeNull();
    expect(removeItem).toHaveBeenCalledWith('ridetrack.session');
  });
});
