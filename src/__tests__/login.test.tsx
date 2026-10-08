import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { useLanguage } from '@/i18n';
import { useAuth } from '@/store/auth';

import LoginScreen from '@/app/(auth)/login';

// the screen only needs Link; the root layout's route guard does the real navigation
jest.mock('expo-router', () => {
  const { Text } = jest.requireActual('react-native');
  return { Link: ({ children }: { children: React.ReactNode }) => <Text>{children}</Text> };
});
jest.mock('@/lib/secure-storage', () => ({ getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() }));

describe('LoginScreen', () => {
  beforeEach(() => {
    useAuth.setState({ user: null, accessToken: null, refreshToken: null });
    useLanguage.setState({ language: 'en', pickedBeforeLogin: false });
  });

  it('shows a message for each empty field and does not log in', async () => {
    await render(<LoginScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'Log in' }));
    expect(await screen.findByText(/Enter your email or mobile number/)).toBeTruthy();
    expect(await screen.findByText(/Enter your password/)).toBeTruthy();
    expect(useAuth.getState().user).toBeNull();
  });

  it('shows one generic error for a wrong password', async () => {
    await render(<LoginScreen />);
    await fireEvent.changeText(screen.getByLabelText('Email or mobile number'), 'passenger@ridetrack.test');
    await fireEvent.changeText(screen.getByLabelText('Password'), 'WrongPass1');
    await fireEvent.press(screen.getByRole('button', { name: 'Log in' }));
    expect(await screen.findByText(/Invalid email\/phone or password/)).toBeTruthy();
    expect(useAuth.getState().user).toBeNull();
  });

  it('logs in the demo passenger and stores the session', async () => {
    await render(<LoginScreen />);
    await fireEvent.changeText(screen.getByLabelText('Email or mobile number'), 'passenger@ridetrack.test');
    await fireEvent.changeText(screen.getByLabelText('Password'), 'Password1!');
    await fireEvent.press(screen.getByRole('button', { name: 'Log in' }));
    await waitFor(() => expect(useAuth.getState().user?.role).toBe('PASSENGER'), { timeout: 3000 });
    expect(useAuth.getState().accessToken).toBeTruthy();
  });

  it('keeps a language picked on the login screen and saves it to the account', async () => {
    await render(<LoginScreen />);
    await fireEvent.press(screen.getByText('සිංහල'));
    await fireEvent.changeText(screen.getByLabelText('Email or mobile number'), 'passenger@ridetrack.test');
    await fireEvent.changeText(screen.getByLabelText('Password'), 'Password1!');
    await fireEvent.press(screen.getByRole('button', { name: 'Log in' }));
    await waitFor(() => expect(useAuth.getState().user?.language).toBe('si'), { timeout: 3000 });
    expect(useLanguage.getState()).toMatchObject({ language: 'si', pickedBeforeLogin: false });
  });
});
