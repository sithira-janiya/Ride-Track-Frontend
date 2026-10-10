import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { useAuth } from '@/store/auth';
import { useLanguage } from '@/store/language';
import { useOnboarding } from '@/store/onboarding';

import LoginScreen from '@/app/(auth)/login';

const mockParams: { identifier?: string } = {};

// the screen only needs Link, Redirect and its params; the root layout's route guard does the real navigation
jest.mock('expo-router', () => {
  const { Text } = jest.requireActual('react-native');
  return {
    Link: ({ children }: { children: React.ReactNode }) => <Text>{children}</Text>,
    Redirect: ({ href }: { href: string }) => <Text>{`redirect:${href}`}</Text>,
    useLocalSearchParams: () => mockParams,
  };
});
jest.mock('@/utils/secure-storage', () => ({ getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() }));

describe('LoginScreen', () => {
  beforeEach(() => {
    useAuth.setState({ user: null, accessToken: null, refreshToken: null });
    useLanguage.setState({ language: 'en', pickedBeforeLogin: false });
    useOnboarding.setState({ seenWelcome: true });
    delete mockParams.identifier;
  });

  it('sends a first-time visitor to the instructions first', async () => {
    useOnboarding.setState({ seenWelcome: false });
    await render(<LoginScreen />);
    expect(screen.getByText('redirect:/welcome')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Log in' })).toBeNull();
  });

  it('fills in a demo account picked on the instructions screen', async () => {
    mockParams.identifier = 'staff@ridetrack.test';
    await render(<LoginScreen />);
    expect(screen.getByLabelText('Email or mobile number').props.value).toBe('staff@ridetrack.test');
    expect(screen.getByText('How RideTrack works')).toBeTruthy();
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
