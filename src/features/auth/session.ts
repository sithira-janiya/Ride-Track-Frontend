import { userApi } from '@/api/endpoints';
import { useLanguage } from '@/i18n';
import { useAuth } from '@/store/auth';
import type { AuthResult } from '@/types';

/**
 * Starts the session from a login/register result. A language picked on the auth screen (or any device language, for a
 * new account) is kept and saved to the account; otherwise the root layout switches the UI to the account's language.
 */
export async function startSession(r: AuthResult, { newAccount = false } = {}) {
  const { language, pickedBeforeLogin, clearPickBeforeLogin } = useLanguage.getState();
  clearPickBeforeLogin();
  const { setSession, setUser } = useAuth.getState();
  if (!(pickedBeforeLogin || newAccount) || r.user.language === language) return setSession(r);

  await setSession({ ...r, user: { ...r.user, language } });
  try {
    const updated = await userApi.update(r.user.userId, { language });
    const current = useAuth.getState().user;
    if (current?.userId === r.user.userId) await setUser({ ...current, ...updated, language });
  } catch (e) {
    // the UI stays in the picked language; the account keeps its old one until it is changed on the Profile screen
    if (__DEV__) console.warn('[i18n] could not save language to the account', e);
  }
}
