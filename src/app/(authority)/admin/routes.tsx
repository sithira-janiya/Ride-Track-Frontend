import { StyleSheet, Text, View } from 'react-native';

import { errorMessage } from '@/api/client';
import { Card, EmptyState, ErrorMessage, Loading, StatusBadge } from '@/components/ui';
import { AdminPage } from '@/features/admin/components/AdminPage';
import { useAdminRoutes } from '@/features/admin/hooks/use-admin';
import { useColors } from '@/hooks/use-colors';
import { spacing, typography } from '@/theme';
import { countOf, modeLabel } from '@/utils/format';

/** Every route, including inactive ones, with how many stops and vehicles it has. */
export default function RoutesScreen() {
  const c = useColors();
  const routes = useAdminRoutes();

  return (
    <AdminPage>
      {routes.isPending ? (
        <Loading label="Loading routes…" />
      ) : routes.isError ? (
        <ErrorMessage message={errorMessage(routes.error)} onRetry={() => routes.refetch()} />
      ) : routes.data.length === 0 ? (
        <EmptyState title="No routes yet" message="Routes are added on the server." />
      ) : (
        routes.data.map((r) => (
          <Card key={r.routeId}>
            <View style={styles.row}>
              <Text style={[styles.name, { color: c.text }]}>
                {r.routeNo} · {r.name}
              </Text>
              <StatusBadge label={r.isActive ? 'Active' : 'Inactive'} tone={r.isActive ? 'success' : 'danger'} />
            </View>
            <Text style={[styles.body, { color: c.textSecondary }]}>
              {modeLabel(r.mode)} · {r.origin} → {r.destination}
            </Text>
            <Text style={[styles.caption, { color: c.textSecondary }]}>
              {countOf(r.stops, 'stop')} · {countOf(r.vehicles, 'vehicle')} in service
            </Text>
          </Card>
        ))
      )}
    </AdminPage>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, flexWrap: 'wrap' },
  name: { ...typography.bodyLarge, fontWeight: '700', flexShrink: 1 },
  body: { ...typography.body },
  caption: { ...typography.caption },
});
