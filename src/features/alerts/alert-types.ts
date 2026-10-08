import type { Tone } from '@/components/ui';
import type { AlertType } from '@/types';

/** How each kind of alert is labelled wherever alerts are listed (passenger alerts, authority dashboard and alerts). */
export const ALERT_TYPE: Record<AlertType, { label: string; tone: Tone }> = {
  DELAY: { label: 'Delay', tone: 'warning' },
  CANCELLATION: { label: 'Cancelled', tone: 'danger' },
  ROUTE_CHANGE: { label: 'Route change', tone: 'info' },
};
