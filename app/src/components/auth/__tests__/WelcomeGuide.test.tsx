import { fireEvent, render, screen } from '@testing-library/react-native';

import { DEMO_PASSWORD, WelcomeGuide } from '@/components/auth/WelcomeGuide';
import { useLanguage } from '@/store/language';

describe('WelcomeGuide', () => {
  beforeEach(() => {
    useLanguage.setState({ language: 'en', pickedBeforeLogin: false });
  });

  it('explains the app for passengers, staff and officers, then gets started', async () => {
    const onDone = jest.fn();
    await render(<WelcomeGuide onDone={onDone} />);
    expect(screen.getByText('Welcome! Here is how RideTrack works')).toBeTruthy();
    expect(screen.getByText('Show the QR code when you board')).toBeTruthy();
    expect(screen.getByText('Conductors and inspectors')).toBeTruthy();
    expect(screen.queryByText('Just trying it out?')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Get started' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Skip' }));
    expect(onDone).toHaveBeenCalledTimes(2);
  });

  it('lists demo accounts when asked to, and picks one', async () => {
    const onDemoLogin = jest.fn();
    await render(<WelcomeGuide onDone={jest.fn()} onDemoLogin={onDemoLogin} />);
    expect(screen.getByText(`Use a demo account. The password for each one is ${DEMO_PASSWORD}`)).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Log in as the demo Officer' }));
    expect(onDemoLogin).toHaveBeenCalledWith('officer@ridetrack.test');
  });
});
