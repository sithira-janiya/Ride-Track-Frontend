import { act, renderHook } from '@testing-library/react-native';

import { useLanguage, useT } from '..';

beforeEach(async () => {
  await act(() => useLanguage.setState({ language: 'en', translations: {} }));
});

describe('useT', () => {
  it('returns English, with placeholders filled, when English is selected', async () => {
    const { result } = await renderHook(() => useT());
    expect(result.current('Pay {amount}', { amount: 'Rs. 50' })).toBe('Pay Rs. 50');
  });

  it('uses a stored Google translation for the selected language', async () => {
    await act(() => useLanguage.setState({ language: 'si', translations: { si: { 'Pay {amount}': '{amount} ගෙවන්න' } } }));
    const { result } = await renderHook(() => useT());
    expect(result.current('Pay {amount}', { amount: 'Rs. 50' })).toBe('Rs. 50 ගෙවන්න');
  });

  it('falls back to English when the translation is missing or lost a placeholder', async () => {
    await act(() => useLanguage.setState({ language: 'ta', translations: { ta: { 'Route {no}': 'பாதை' } } }));
    const { result } = await renderHook(() => useT());
    expect(result.current('Route {no}', { no: 138 })).toBe('Route 138');
    expect(result.current('Not translated yet')).toBe('Not translated yet');
  });
});
