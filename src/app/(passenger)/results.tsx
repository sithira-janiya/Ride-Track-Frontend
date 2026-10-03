import { useLocalSearchParams } from 'expo-router';

import { PlaceholderScreen } from '@/components/ui/placeholder-screen';

/** Starter screen so Search has somewhere to go. Silva replaces it with the real Results list. */
export default function ResultsScreen() {
  const { from, to } = useLocalSearchParams<{ from: string; to: string }>();
  return <PlaceholderScreen title={`${from} to ${to}`} owner="Silva" requirements="FR3, FR4" />;
}
