import { RoleTabs } from '@/components/navigation/role-tabs';

export default function ConductorLayout() {
  return (
    <RoleTabs
      role="conductor"
      tabs={[
        { name: 'index', title: 'Dashboard', icon: 'speedometer-outline' },
        { name: 'scan', title: 'Scan', icon: 'qr-code-outline' },
        { name: 'passengers', title: 'Passengers', icon: 'people-outline' },
        { name: 'report', title: 'Report', icon: 'warning-outline' },
      ]}
    />
  );
}
