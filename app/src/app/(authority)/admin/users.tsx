import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { errorMessage } from '@/api/client';
import { AdminPage } from '@/components/admin/AdminPage';
import { Button, Card, Chips, EmptyState, ErrorMessage, Loading, StatusBadge, TextField } from '@/components/ui';
import { useAdminUsers, useUpdateAccount } from '@/hooks/use-admin';
import { useColors } from '@/hooks/use-colors';
import { useDebounce } from '@/hooks/use-debounce';
import { useAuth } from '@/store/auth';
import { spacing, typography } from '@/theme';
import type { AdminUser, Role } from '@/types';
import { confirmAction } from '@/utils/confirm';

const ROLES: { value: Role | undefined; label: string }[] = [
  { value: undefined, label: 'All' },
  { value: 'PASSENGER', label: 'Passengers' },
  { value: 'STAFF', label: 'Staff' },
  { value: 'AUTHORITY', label: 'Officers' },
];
const ROLE_LABEL: Record<Role, string> = { PASSENGER: 'Passenger', STAFF: 'Staff', AUTHORITY: 'Officer' };

function AccountCard({ user, isSelf }: { user: AdminUser; isSelf: boolean }) {
  const c = useColors();
  const update = useUpdateAccount();

  const toggle = async () => {
    if (user.isActive) {
      const ok = await confirmAction(
        `Disable ${user.name}?`,
        'They are signed out straight away and cannot log in until the account is enabled again.',
        'Disable',
      );
      if (!ok) return;
    }
    update.mutate({ userId: user.userId, isActive: !user.isActive });
  };

  const details = [
    user.employeeNo ? `No. ${user.employeeNo}` : null,
    user.organisation,
    user.staffType ? (user.staffType === 'CONDUCTOR' ? 'Conductor' : 'Inspector') : null,
    user.vehicleId ? `Vehicle ${user.vehicleId}` : null,
  ].filter(Boolean);

  return (
    <Card>
      <View style={styles.row}>
        <Text style={[styles.name, { color: c.text }]}>{user.name}</Text>
        <View style={styles.badges}>
          <StatusBadge label={ROLE_LABEL[user.role]} tone="info" />
          <StatusBadge label={user.isActive ? 'Active' : 'Disabled'} tone={user.isActive ? 'success' : 'danger'} />
        </View>
      </View>
      <Text style={[styles.body, { color: c.textSecondary }]}>{[user.email, user.phone].filter(Boolean).join(' · ') || 'No contact details'}</Text>
      {details.length ? <Text style={[styles.caption, { color: c.textSecondary }]}>{details.join(' · ')}</Text> : null}
      {update.isError ? <ErrorMessage message={errorMessage(update.error)} /> : null}
      {isSelf ? (
        <Text style={[styles.caption, { color: c.textSecondary }]}>This is your account.</Text>
      ) : (
        <Button
          title={user.isActive ? 'Disable account' : 'Enable account'}
          variant={user.isActive ? 'danger' : 'secondary'}
          loading={update.isPending}
          onPress={toggle}
        />
      )}
    </Card>
  );
}

export default function AccountsScreen() {
  const c = useColors();
  const router = useRouter();
  const me = useAuth((s) => s.user);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<Role | undefined>(undefined);
  const q = useDebounce(search.trim(), 400);
  const list = useAdminUsers(q, role);

  const users = list.data?.pages.flatMap((p) => p.users) ?? [];
  const total = list.data?.pages[0]?.total ?? 0;

  return (
    <AdminPage>
      <Button title="Add staff or officer" onPress={() => router.push('/admin/new-account')} />
      <TextField label="Search" placeholder="Name, email or phone" value={search} onChangeText={setSearch} autoCapitalize="none" autoCorrect={false} />
      <Chips label="Role" options={ROLES} value={role} onChange={setRole} />

      {list.isPending ? (
        <Loading label="Loading accounts…" />
      ) : list.isError ? (
        <ErrorMessage message={errorMessage(list.error)} onRetry={() => list.refetch()} />
      ) : users.length === 0 ? (
        <EmptyState title="No accounts found" message="Try a different search or role." />
      ) : (
        <>
          <Text accessibilityLiveRegion="polite" style={[styles.caption, { color: c.textSecondary }]}>
            Showing {users.length} of {total}
          </Text>
          {users.map((u) => (
            <AccountCard key={u.userId} user={u} isSelf={u.userId === me?.userId} />
          ))}
          {list.hasNextPage ? <Button title="Load more" variant="secondary" loading={list.isFetchingNextPage} onPress={() => list.fetchNextPage()} /> : null}
        </>
      )}
    </AdminPage>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, flexWrap: 'wrap' },
  badges: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  name: { ...typography.bodyLarge, fontWeight: '700', flexShrink: 1 },
  body: { ...typography.body },
  caption: { ...typography.caption },
});
