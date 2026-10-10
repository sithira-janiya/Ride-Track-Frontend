import { Redirect } from 'expo-router';

import { RoleTabs } from '@/components/navigation/role-tabs';
import { useTransportStore } from '@/store/transport-store';

export default function PassengerTabsLayout() {
  const hydrated = useTransportStore((s) => s.hydrated);
  const transport = useTransportStore((s) => s.transport);

  // Wait for the saved choice to load, then send first-time passengers to pick bus or train.
  if (!hydrated) return null;
  if (!transport) return <Redirect href="/(passenger)/select-transport" />;

  return (
    <RoleTabs
      role="passenger"
      tabs={[
        { name: 'index', title: 'Home', icon: 'home-outline' },
        { name: 'search', title: 'Search', icon: 'search-outline' },
        { name: 'tickets', title: 'Tickets', icon: 'ticket-outline' },
        { name: 'profile', title: 'Profile', icon: 'person-outline' },
      ]}
    />
  );
}
