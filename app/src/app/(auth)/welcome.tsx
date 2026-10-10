import { router } from 'expo-router';

import { WelcomeGuide } from '@/components/auth/WelcomeGuide';
import { env } from '@/config/env';
import { useOnboarding } from '@/store/onboarding';

/** First-launch instructions (e.g. right after scanning the app's QR code). Also opened from the login screen. */
export default function WelcomeScreen() {
  const finishWelcome = useOnboarding((s) => s.finishWelcome);
  const done = (identifier?: string) => {
    finishWelcome();
    router.replace(identifier ? { pathname: '/login', params: { identifier } } : '/login');
  };
  return <WelcomeGuide onDone={() => done()} onDemoLogin={env.showDemoLogins ? done : undefined} />;
}
