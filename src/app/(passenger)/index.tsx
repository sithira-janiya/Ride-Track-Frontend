import { RoleHome } from '@/components/auth/RoleHome';

export default function PassengerHome() {
  return (
    <RoleHome
      heading="Home"
      note="Route search, live map and tickets are coming in the next phases."
      showLogout={false}
    />
  );
}
