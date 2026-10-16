import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { errorMessage } from '@/api/client';
import { NavRow } from '@/components/admin/NavRow';
import { AccountBar } from '@/components/auth/AccountBar';
import { StatTile } from '@/components/ops/StatTile';
import { DashboardHero, ErrorMessage, Loading, SectionTitle } from '@/components/ui';
import { useAdminOverview } from '@/hooks/use-admin';
import { useColors } from '@/hooks/use-colors';
import { spacing } from '@/theme';
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
          <AccountBar tone="admin" />
          <DashboardHero
            tone="admin"
            illustration="heroAdmin"
            eyebrow="Back office"
            title="Admin"
            subtitle="Accounts, fleet, routes and sales in one place."
          />

          {overview.isPending ? (
            <Loading label="Loading overview…" />
          ) : overview.isError ? (
            <ErrorMessage message={errorMessage(overview.error)} onRetry={() => overview.refetch()} />
          ) : (
            <>
              <SectionTitle emoji="📅" title="Today" />
              <View style={styles.tiles}>
                <StatTile icon="🗓️" label="Trips today" value={String(o!.tripsToday.total)} hint={`${o!.tripsToday.ongoing} running now`} />
                <StatTile
                  icon="⏱️"
                  tone="warning"
                  label="Delayed or cancelled"
                  value={String(o!.tripsToday.delayed + o!.tripsToday.cancelled)}
                  hint={`${o!.tripsToday.delayed} delayed, ${o!.tripsToday.cancelled} cancelled`}
                />
                <StatTile icon="🎫" tone="success" label="Tickets sold" value={String(o!.salesToday.tickets)} />
                {o!.salesToday.byCurrency?.length ? (
                  o!.salesToday.byCurrency.map((s) => (
                    <StatTile key={s.currency} icon="💰" tone="success" label={`Revenue (${s.currency})`} value={formatFare(s.revenue, s.currency)} hint={countOf(s.tickets, 'ticket')} />
                  ))
                ) : (
                  <StatTile icon="💰" tone="success" label="Revenue" value={formatFare(o!.salesToday.revenue)} />
                )}
              </View>

              <SectionTitle emoji="🧩" title="System" />
              <View style={styles.tiles}>
                <StatTile
                  icon="👥"
                  label="Accounts"
                  value={String(o!.users.total)}
                  hint={`${countOf(o!.users.passengers, 'passenger')}, ${o!.users.staff} staff, ${countOf(o!.users.officers, 'officer')}`}
                />
                <StatTile icon="🚫" tone="danger" label="Disabled accounts" value={String(o!.users.disabled)} />
                <StatTile icon="🚌" label="Active vehicles" value={String(o!.fleet.vehicles)} />
                <StatTile icon="🛣️" label="Active routes" value={String(o!.fleet.routes)} hint={countOf(o!.fleet.stops, 'stop')} />
              </View>
            </>
          )}

          <SectionTitle emoji="🛠️" title="Manage" />
          <NavRow tone="admin" icon="👥" title="Accounts" detail="Find people, add staff and officers, disable accounts" onPress={() => router.push('/admin/users')} />
          <NavRow tone="admin" icon="🚌" title="Vehicles" detail="Add buses and trains, change capacity or route, take out of service" onPress={() => router.push('/admin/vehicles')} />
          <NavRow tone="admin" icon="🛣️" title="Routes" detail="Every route with its stops and vehicles" onPress={() => router.push('/admin/routes')} />
          <NavRow tone="admin" icon="🗓️" title="Trips" detail="The timetable for any day, with status and tickets sold" onPress={() => router.push('/admin/trips')} />
          <NavRow tone="admin" icon="🎫" title="Tickets" detail="All tickets sold, with payment status" onPress={() => router.push('/admin/tickets')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.lg },
  content: { width: '100%', maxWidth: 720, alignSelf: 'center', gap: spacing.md },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
