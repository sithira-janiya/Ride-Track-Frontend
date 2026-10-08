import { splitIdentifier } from '../validation';

describe('splitIdentifier', () => {
  it('lowercases emails and strips phone separators', () => {
    expect(splitIdentifier(' Nimal@Example.com ')).toEqual({ email: 'nimal@example.com' });
    expect(splitIdentifier('077-123 4567')).toEqual({ phone: '0771234567' });
  });
});
