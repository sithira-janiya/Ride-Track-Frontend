import { useState } from 'react';

import { useT } from '@/i18n';
import { useAuth } from '@/store/auth';
import { useShift } from '@/store/shift';
import { useTicketCache } from '@/store/tickets';
import { confirmAction } from '@/utils/confirm';

/**
 * Logging out, the same for every role. It asks first, saying what will end (a staff member's shift, a ticket payment
 * still being confirmed), then signs out. The auth store clears the account's data, the root layout closes the live
 * socket and drops cached account data, and the route guard shows the login screen.
 */
export function useLogout() {
  const t = useT();
  const [busy, setBusy] = useState(false);

  const logOut = async () => {
    if (busy) return;
    const shift = useShift.getState().shift;
    const pending = useTicketCache.getState().pendingIds.length > 0;
    const details = [
      shift ? t('Your shift on route {route} will end.', { route: shift.routeNo }) : null,
      pending ? t('A ticket payment is still being confirmed. Log in again later to see the ticket.') : null,
      t('You will need your email or mobile number and password to log in again.'),
    ]
      .filter(Boolean)
      .join('\n');
    if (!(await confirmAction(t('Log out of RideTrack?'), details, t('Log out')))) return;
    setBusy(true);
    try {
      await useAuth.getState().logout();
    } finally {
      setBusy(false);
    }
  };

  return { logOut, busy };
}
