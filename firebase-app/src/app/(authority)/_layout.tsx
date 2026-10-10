import { RoleTabs } from '@/components/navigation/role-tabs';

export default function AuthorityLayout() {
  return (
    <RoleTabs
      role="authority"
      tabs={[
        { name: 'index', title: 'Dashboard', icon: 'grid-outline' },
        { name: 'vehicles', title: 'Vehicles', icon: 'bus-outline' },
        { name: 'live', title: 'Live', icon: 'map-outline' },
        { name: 'alerts', title: 'Alerts', icon: 'notifications-outline' },
      ]}
    />
  );
}
