import { StyleSheet, View } from 'react-native';

import { errorMessage } from '@/api/client';
import { Button, ErrorMessage } from '@/components/ui';
import { useTripAction } from '@/hooks/use-driver';
import { spacing } from '@/theme';
import type { Trip } from '@/types';
import { confirmAction } from '@/utils/confirm';

/**
 * Start (departing) and end (arrived at the last stop) for one of the driver's trips. A delayed trip may not have left
 * yet or may be on the road, so it offers both, as RideTrack-API allows.
 */
export function TripActions({ trip }: { trip: Trip }) {
  const action = useTripAction();
  const canStart = trip.status === 'SCHEDULED' || trip.status === 'DELAYED';
  const canEnd = trip.status === 'ONGOING' || trip.status === 'DELAYED';
  if (!canStart && !canEnd) return null;

  const end = async () => {
    const ok = await confirmAction('End this trip?', 'Do this at the last stop. Tickets for this trip that were not used then expire.', 'End trip');
    if (ok) action.mutate({ tripId: trip.tripId, action: 'end' });
  };

  return (
    <View style={styles.wrap}>
      {action.isError ? <ErrorMessage message={errorMessage(action.error)} /> : null}
      {canStart ? (
        <Button
          title="Start trip"
          loading={action.isPending && action.variables?.action === 'start'}
          disabled={action.isPending}
          onPress={() => action.mutate({ tripId: trip.tripId, action: 'start' })}
        />
      ) : null}
      {canEnd ? (
        <Button
          title="End trip"
          variant={canStart ? 'secondary' : 'primary'}
          loading={action.isPending && action.variables?.action === 'end'}
          disabled={action.isPending}
          onPress={end}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm, marginTop: spacing.xs },
});
