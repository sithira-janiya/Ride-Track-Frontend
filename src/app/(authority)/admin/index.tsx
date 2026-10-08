import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { errorMessage } from '@/api/client';
import { NavRow } from '@/components/admin/NavRow';
import { StatTile } from '@/components/ops/StatTile';
import { ErrorMessage, Loading } from '@/components/ui';
import { useAdminOverview } from '@/hooks/use-admin';
import { useColors } from '@/hooks/use-colors';
import { spacing, typography } from '@/theme';
import { countOf, formatFare } from '@/utils/format';

/** Back-office home: headline numbers from `/admin/overview` and a way into each area. */
export default function AdminHome() {
  const c = useColors();
  const router = useRouter();
  const overview = useAdminOverview();
  const o = overview.data;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <Text accessibilityRole="header" style={[styles.heading, { color: c.text }]}>
            Admin
          </Text>

          {overview.isPending ? (
            <Loading label="Loading overview…" />
          ) : overview.isError ? (
            <ErrorMessage message={errorMessage(overview.error)} onRetry={() => overview.refetch()} />
          ) : (
            <>
              <Text accessibilityRole="header" style={[styles.section, { color: c.text }]}>
                Today
              </Text>
              <View style={styles.tiles}>
                <StatTile label="Trips today" value={String(o!.tripsToday.total)} hint={`${o!.tripsToday.ongoing} running now`} />
                <StatTile
                  label="Delayed or cancelled"
                  value={String(o!.tripsToday.delayed + o!.tripsToday.cancelled)}
                  hint={`${o!.tripsToday.delayed} delayed, ${o!.tripsToday.cancelled} cancelled`}
                />
                <StatTile label="Tickets sold" value={String(o!.salesToday.tickets)} />
                <StatTile label="Revenue" value={formatFare(o!.salesToday.revenue)} />
              </View>

              <Text accessibilityRole="header" style={[styles.section, { color: c.text }]}>
                System
              </Text>
              <View style={styles.tiles}>
                <StatTile
                  label="Accounts"
                  value={String(o!.users.total)}
                  hint={`${countOf(o!.users.passengers, 'passenger')}, ${o!.users.staff} staff, ${countOf(o!.users.officers, 'officer')}`}
                />
                <StatTile label="Disabled accounts" value={String(o!.users.disabled)} />
                <StatTile label="Active vehicles" value={String(o!.fleet.vehicles)} />
                <StatTile label="Active routes" value={String(o!.fleet.routes)} hint={countOf(o!.fleet.stops, 'stop')} />
              </View>
            </>
          )}

          <Text accessibilityRole="header" style={[styles.section, { color: c.text }]}>
            Manage
          </Text>
          <NavRow title="Accounts" detail="Find people, add staff and officers, disable accounts" onPress={() => router.push('/admin/users')} />
          <NavRow title="Vehicles" detail="Add buses and trains, change capacity or route, take out of service" onPress={() => router.push('/admin/vehicles')} />
          <NavRow title="Routes" detail="Every route with its stops and vehicles" onPress={() => router.push('/admin/routes')} />
          <NavRow title="Trips" detail="The timetable for any day, with status and tickets sold" onPress={() => router.push('/admin/trips')} />
          <NavRow title="Tickets" detail="All tickets sold, with payment status" onPress={() => router.push('/admin/tickets')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.lg },
  content: { width: '100%', maxWidth: 720, alignSelf: 'center', gap: spacing.md },
  heading: { ...typography.heading },
  section: { ...typography.title, marginTop: spacing.sm },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
