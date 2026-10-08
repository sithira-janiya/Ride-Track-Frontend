import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { errorMessage } from '@/api/client';
import { TripActions } from '@/components/driver/TripActions';
import { TripPassengers } from '@/components/driver/TripPassengers';
import { TripCard } from '@/components/routes/TripCard';
import { Button, EmptyState, ErrorMessage, Loading } from '@/components/ui';
import { useColors } from '@/hooks/use-colors';
import { useDriverMe, useDriverTrips } from '@/hooks/use-driver';
import { spacing, typography } from '@/theme';

/** The bus's trips from 12 hours ago to 24 hours ahead: start and end them, and see who has paid and boarded. */
export default function DriverTripsScreen() {
  const c = useColors();
  const me = useDriverMe();
  const hasBus = !!me.data?.bus;
  const trips = useDriverTrips(hasBus);
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <Text accessibilityRole="header" style={[styles.heading, { color: c.text }]}>
            Trips
          </Text>

          {me.isPending ? (
            <Loading label="Loading your bus…" />
          ) : !hasBus ? (
            <EmptyState title="No bus assigned yet" message="Your trips appear here once your administrator assigns you a bus." />
          ) : trips.isPending ? (
            <Loading label="Loading trips…" />
          ) : trips.isError ? (
            <ErrorMessage message={errorMessage(trips.error)} onRetry={() => trips.refetch()} />
          ) : trips.data.length === 0 ? (
            <EmptyState title="No trips" message="Your bus has no trips from 12 hours ago to 24 hours ahead." />
          ) : (
            trips.data.map((trip) => (
              <TripCard key={trip.tripId} trip={trip} highlighted={trip.tripId === me.data?.trip?.tripId}>
                <TripActions trip={trip} />
                <Button
                  title={openId === trip.tripId ? 'Hide passengers' : 'Passengers'}
                  variant="secondary"
                  onPress={() => setOpenId(openId === trip.tripId ? null : trip.tripId)}
                />
                {openId === trip.tripId ? <TripPassengers tripId={trip.tripId} /> : null}
              </TripCard>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.lg },
  content: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: spacing.md },
  heading: { ...typography.heading },
});
