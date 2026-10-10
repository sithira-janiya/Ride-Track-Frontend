import { useLanguage } from '@/store/language';

import { requestTranslation } from '../google-translate';

jest.mock('@/config/env', () => ({ env: { googleTranslateApiKey: 'test-key' } }));

describe('requestTranslation', () => {
  it('batches strings into one Google Translate request and stores the results', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { translations: [{ translatedText: 'ගෙදර' }, { translatedText: 'ටිකට්' }] } }),
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    requestTranslation('si', 'Home');
    requestTranslation('si', 'Tickets');
    requestTranslation('si', 'Home'); // duplicate: not asked twice
    await new Promise((r) => setTimeout(r, 60));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain('translation.googleapis.com/language/translate/v2?key=test-key');
    expect(JSON.parse(init.body)).toEqual({ q: ['Home', 'Tickets'], source: 'en', target: 'si', format: 'text' });
    expect(useLanguage.getState().translations.si).toEqual({ Home: 'ගෙදර', Tickets: 'ටිකට්' });
  });

  it("keeps Google's error message so the language picker can show why translation failed", async () => {
    jest.useFakeTimers({ doNotFake: ['setImmediate'] });
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { message: 'API key not valid. Please pass a valid API key.' } }),
    }) as unknown as typeof fetch;

    requestTranslation('ta', 'Alerts');
    jest.advanceTimersByTime(30);
    for (let i = 0; i < 5; i++) await new Promise<void>((r) => setImmediate(r));

    expect(useLanguage.getState().translationError).toBe('API key not valid. Please pass a valid API key.');
    expect(useLanguage.getState().translations.ta).toBeUndefined();
    jest.clearAllTimers(); // the one-minute retry wait
    jest.useRealTimers();
  });
});
