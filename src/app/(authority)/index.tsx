import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { errorMessage } from '@/api/client';
import { AccountBar } from '@/components/auth/AccountBar';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { byOperator, OperatorFilter } from '@/components/ops/OperatorFilter';
import { StatTile as Tile } from '@/components/ops/StatTile';
import { VehicleCard } from '@/components/ops/VehicleCard';
import { Card, Chips, DashboardHero, EmptyState, ErrorMessage, HeroPill, Loading, SectionTitle, StatusBadge } from '@/components/ui';
import { inBuildRegions, multiRegion } from '@/config/regions';
import { useColors } from '@/hooks/use-colors';
import { useOpsDashboard } from '@/hooks/use-ops';
import { useAuth } from '@/store/auth';
import { spacing, typography } from '@/theme';
import type { Operator, Region } from '@/types';
import { formatClock, REGION_LABEL } from '@/utils/format';
import { firstName, greetingTemplate } from '@/utils/greeting';

const REGIONS: { value: Region | undefined; label: string }[] = [
  { value: undefined, label: 'All' },
  { value: 'SRI_LANKA', label: REGION_LABEL.SRI_LANKA },
  { value: 'DUBAI', label: REGION_LABEL.DUBAI },
];

export default function AuthorityDashboard() {
  const c = useColors();
  const user = useAuth((s) => s.user);
  const ops = useOpsDashboard();
  const [region, setRegion] = useState<Region | undefined>(undefined);
  const [operator, setOperator] = useState<Operator | undefined>(undefined);

  // a one-region build leaves out vehicles a shared server reports for other regions
  const d = ops.data && { ...ops.data, vehicles: ops.data.vehicles.filter((v) => inBuildRegions(v.region)) };
  const shown = (d?.vehicles ?? []).filter((v) => (!region || (v.region ?? 'SRI_LANKA') === region) && byOperator(operator)(v));
  const pct = d && d.occupancy.totalCapacity > 0 ? Math.round((d.occupancy.totalPassengers / d.occupancy.totalCapacity) * 100) : null;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <AccountBar />
          <DashboardHero
            tone="authority"
            illustration="heroAuthority"
            eyebrow={greetingTemplate(user?.name)}
            eyebrowParams={{ name: firstName(user?.name) }}
            title="Operations"
            subtitle="Every bus and train, as it runs.">
            {d && !ops.isError ? (
              <HeroPill
                tone="authority"
                status="success"
                label="Live · {time}"
                params={{ time: formatClock(new Date(ops.dataUpdatedAt).toISOString()) }}
              />
            ) : null}
          </DashboardHero>

          {ops.isPending ? (
            <Loading label="Loading live data…" />
          ) : ops.isError ? (
            <ErrorMessage message={errorMessage(ops.error)} onRetry={() => ops.refetch()} />
          ) : (
            <>
              <View style={styles.tiles}>
                <Tile icon="🚌" label="Vehicles live" value={String(d!.vehicles.length)} />
                <Tile icon="⏱️" tone="warning" label="Active delays" value={String(d!.activeDelays.length)} />
                <Tile
                  icon="🧍"
                  tone="success"
                  label="Passengers on board"
                  value={String(d!.occupancy.totalPassengers)}
                  hint={pct != null ? `${pct}% of seats` : undefined}
                />
                <Tile icon="👥" tone="danger" label="Nearly full" value={String(d!.occupancy.fullVehicles)} hint="90% or more" />
              </View>

              <SectionTitle emoji="🚦" title="Active delays and cancellations" />
              {d!.activeDelays.length === 0 ? (
                <EmptyState title="All running normally" message="No delays or cancellations in the last 12 hours." />
              ) : (
                d!.activeDelays.map((a) => (
                  <Card key={a.alertId}>
                    <StatusBadge label={a.type === 'CANCELLATION' ? 'Cancelled' : 'Delay'} tone={a.type === 'CANCELLATION' ? 'danger' : 'warning'} />
                    <Text style={[styles.body, { color: c.text }]}>{a.message}</Text>
                    {a.delayMinutes ? <Text style={[styles.caption, { color: c.textSecondary }]}>About {a.delayMinutes} minutes late</Text> : null}
                  </Card>
                ))
              )}

              <SectionTitle emoji="🗺️" title="Vehicles" />
              {multiRegion ? <Chips label="Region" options={REGIONS} value={region} onChange={setRegion} /> : null}
              <OperatorFilter vehicles={d!.vehicles} value={operator} onChange={setOperator} />
              {shown.length === 0 ? (
                <EmptyState title="No vehicles reporting" message="No vehicle is sending its position right now." />
              ) : (
                shown.map((v) => <VehicleCard key={v.vehicleId} vehicle={v} />)
              )}
            </>
          )}

          <LogoutButton />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.lg },
  content: { width: '100%', maxWidth: 720, alignSelf: 'center', gap: spacing.md },
  body: { ...typography.body },
  caption: { ...typography.caption },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
