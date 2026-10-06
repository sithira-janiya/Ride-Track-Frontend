import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { env } from '@/config/env';
import { mockApi } from '@/api/mock';
import type { PaymentSession } from '@/types';

/**
 * Takes the passenger through payment. The result is never trusted: the gateway's webhook is what
 * activates the ticket, so callers always re-fetch the ticket afterwards (docs/07-api.md).
 */
export async function startPayment(session: PaymentSession): Promise<void> {
  if (env.useMockApi || !session.paymentUrl) {
    await mockApi.confirmPayment(session.ticketId);
    return;
  }
  // returns when the gateway redirects back or the passenger closes the browser; either way we re-check status
  await WebBrowser.openAuthSessionAsync(session.paymentUrl, Linking.createURL('payment-return'));
}
