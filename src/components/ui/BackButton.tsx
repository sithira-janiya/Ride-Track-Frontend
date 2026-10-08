import { useRouter, type Href } from 'expo-router';

import { Button } from './Button';

/** Goes back, or to `fallback` when the screen was opened directly (web refresh, deep link) and there is no history. */
export function BackButton({ fallback = '/' }: { fallback?: Href }) {
  const router = useRouter();
  return <Button title="← Back" variant="secondary" onPress={() => (router.canGoBack() ? router.back() : router.replace(fallback))} />;
}
