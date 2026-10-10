/** Icon (Material Community Icons name) and short label for each onboard facility. */
export const facilityInfo: Record<string, { icon: string; short: string }> = {
  'Air Conditioning': { icon: 'snowflake', short: 'AC' },
  'Wi-Fi': { icon: 'wifi', short: 'Wi-Fi' },
  'USB Charging': { icon: 'usb-port', short: 'USB' },
  'Reserved Seating': { icon: 'seat-passenger', short: 'Reserved' },
};

export function facilityIcon(name: string): string {
  return facilityInfo[name]?.icon ?? 'check-circle-outline';
}

export function facilityShort(name: string): string {
  return facilityInfo[name]?.short ?? name;
}
