import { useEffect } from 'react';

import { useLanguage } from './language-store';

/** Once signed in, the account's language wins; before that the device keeps the last one picked. */
export function useAccountLanguage(accountLanguage: string | undefined) {
  useEffect(() => {
    if (!accountLanguage) return;
    const apply = () => useLanguage.getState().setLanguage(accountLanguage);
    // the saved device language loads asynchronously; apply after it so it cannot overwrite the account's
    if (useLanguage.persist.hasHydrated()) apply();
    return useLanguage.persist.onFinishHydration(apply);
  }, [accountLanguage]);
}
