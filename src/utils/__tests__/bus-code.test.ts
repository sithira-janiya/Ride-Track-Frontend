import { busCodeFromReferrer, parseBusCode } from '../bus-code';
import { driverLoginSchema } from '../validation';

describe('reading a bus code from a scan', () => {
  it('takes the code from the sticker URL, whatever the host', () => {
    expect(parseBusCode('https://api.ridetrack.lk/b/DEMOBUS101')).toBe('DEMOBUS101');
    expect(parseBusCode('http://10.0.0.5:3000/b/demobus101/')).toBe('DEMOBUS101');
    expect(parseBusCode('https://api.ridetrack.lk/b/K7Q2MX4P?utm=1')).toBe('K7Q2MX4P');
  });

  it('takes the code from the app link the sticker page opens', () => {
    expect(parseBusCode('rtexpo://bus/DEMOBUS101')).toBe('DEMOBUS101');
    expect(parseBusCode('/bus/demobus101')).toBe('DEMOBUS101');
  });

  it('accepts a typed code in any case, ignoring spaces', () => {
    expect(parseBusCode(' demo bus101 ')).toBe('DEMOBUS101');
  });

  it('rejects ticket QR codes and anything else', () => {
    expect(parseBusCode('mock-qr-101-11')).toBeNull();
    expect(parseBusCode('eyJ0aWNrZXRJZCI6MX0.c2lnbmF0dXJl')).toBeNull();
    expect(parseBusCode('https://example.com/menu')).toBeNull();
    expect(parseBusCode('ABC')).toBeNull(); // too short
    expect(parseBusCode('')).toBeNull();
  });
});

describe('bus code from the Play install referrer', () => {
  it('reads bus=<code> among other referrer values', () => {
    expect(busCodeFromReferrer('bus=DEMOBUS101')).toBe('DEMOBUS101');
    expect(busCodeFromReferrer('utm_source=google-play&bus=k7q2mx4p&utm_medium=x')).toBe('K7Q2MX4P');
  });

  it('ignores an organic install', () => {
    expect(busCodeFromReferrer('utm_source=google-play&utm_medium=organic')).toBeNull();
    expect(busCodeFromReferrer(null)).toBeNull();
  });
});

describe('driver sign-in validation', () => {
  it('upper-cases the driver code, like the API', () => {
    const r = driverLoginSchema.safeParse({ driverCode: ' drv-demo01 ', password: 'x' });
    expect(r.success && r.data.driverCode).toBe('DRV-DEMO01');
  });

  it('needs a code and a password', () => {
    expect(driverLoginSchema.safeParse({ driverCode: '', password: 'x' }).success).toBe(false);
    expect(driverLoginSchema.safeParse({ driverCode: 'DRV-DEMO01', password: '' }).success).toBe(false);
  });
});
