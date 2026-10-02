import { RoleTabs } from '@/components/role-tabs';

export default function PassengerLayout() {
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
