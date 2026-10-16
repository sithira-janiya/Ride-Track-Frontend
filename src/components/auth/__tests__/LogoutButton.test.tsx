import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { AccountBar } from '@/components/auth/AccountBar';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { useAuth } from '@/store/auth';
import { useLanguage } from '@/store/language';
import { useShift } from '@/store/shift';
import type { User } from '@/types';
import { confirmAction } from '@/utils/confirm';

jest.mock('@/utils/secure-storage', () => ({ getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() }));
jest.mock('@/utils/confirm', () => ({ confirmAction: jest.fn() }));

const confirm = confirmAction as jest.MockedFunction<typeof confirmAction>;
const passenger: User = { userId: 1, name: 'Nimal Perera', email: 'passenger@ridetrack.test', phone: null, role: 'PASSENGER', isActive: true };
const staff: User = { userId: 2, name: 'Sunil Fernando', email: 'staff@ridetrack.test', phone: null, role: 'STAFF', isActive: true };
const officer: User = { userId: 3, name: 'Dilani Jayasinghe', email: 'officer@ridetrack.test', phone: null, role: 'AUTHORITY', isActive: true };

const signIn = (user: User) => useAuth.setState({ user, accessToken: 'access', refreshToken: 'refresh' });

describe('Log out', () => {
  beforeEach(() => {
    confirm.mockReset();
    useLanguage.setState({ language: 'en' });
    useShift.setState({ shift: null });
  });

  it.each([passenger, staff, officer])('logs out $role after confirming', async (user) => {
    signIn(user);
    confirm.mockResolvedValue(true);
    await render(<LogoutButton />);
    await fireEvent.press(screen.getByRole('button', { name: 'Log out' }));
    await waitFor(() => expect(useAuth.getState().user).toBeNull());
    expect(confirm).toHaveBeenCalledWith('Log out of RideTrack?', expect.any(String), 'Log out');
  });

  it('stays logged in when the person cancels', async () => {
    signIn(passenger);
    confirm.mockResolvedValue(false);
    await render(<LogoutButton compact />);
    await fireEvent.press(screen.getByRole('button', { name: 'Log out' }));
    await waitFor(() => expect(confirm).toHaveBeenCalled());
    expect(useAuth.getState().user?.name).toBe('Nimal Perera');
  });

  it("warns staff that their shift will end", async () => {
    signIn(staff);
    useShift.getState().start({ routeId: 1, routeNo: '138', tripId: 11, vehicleId: 101 });
    confirm.mockResolvedValue(true);
    await render(<LogoutButton />);
    await fireEvent.press(screen.getByRole('button', { name: 'Log out' }));
    await waitFor(() => expect(useAuth.getState().user).toBeNull());
    expect(confirm.mock.calls[0][1]).toContain('Your shift on route 138 will end.');
    expect(useShift.getState().shift).toBeNull();
  });

  it('shows who is logged in on the account bar', async () => {
    signIn(officer);
    await render(<AccountBar />);
    expect(screen.getByText('Dilani Jayasinghe')).toBeTruthy();
    expect(screen.getByText('Authority officer · officer@ridetrack.test')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Log out' })).toBeTruthy();
  });
});
