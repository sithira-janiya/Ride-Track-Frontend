import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { StyleSheet, Text } from 'react-native';

import { errorMessage } from '@/api/client';
import { Button, Card, Chips, ErrorMessage, TextField } from '@/components/ui';
import { AdminPage } from '@/features/admin/components/AdminPage';
import { useAdminVehicles, useCreateStaffAccount } from '@/features/admin/hooks/use-admin';
import { staffAccountSchema, type StaffAccountForm } from '@/features/admin/validation';
import { useColors } from '@/hooks/use-colors';
import { typography } from '@/theme';
import { splitIdentifier } from '@/utils/validation';

const ROLES = [
  { value: 'STAFF' as const, label: 'Staff (conductor or inspector)' },
  { value: 'AUTHORITY' as const, label: 'Authority officer' },
];
const STAFF_TYPES = [
  { value: 'CONDUCTOR' as const, label: 'Conductor' },
  { value: 'INSPECTOR' as const, label: 'Inspector' },
];

/** Creates a staff or officer account. Passengers register themselves in the app. */
export default function NewAccountScreen() {
  const c = useColors();
  const router = useRouter();
  const vehicles = useAdminVehicles();
  const create = useCreateStaffAccount();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<StaffAccountForm>({
    resolver: zodResolver(staffAccountSchema),
    defaultValues: { role: 'STAFF', name: '', identifier: '', password: '', employeeNo: '', organisation: '', staffType: 'CONDUCTOR' },
  });
  const isStaff = useWatch({ control, name: 'role' }) === 'STAFF';

  const onSubmit = handleSubmit(({ identifier, staffType, vehicleId, ...rest }) =>
    create.mutate(
      {
        ...rest,
        name: rest.name.trim(),
        ...splitIdentifier(identifier),
        // officers have no conductor/inspector type or vehicle
        ...(rest.role === 'STAFF' ? { staffType, vehicleId } : {}),
      },
      { onSuccess: () => router.back() },
    ),
  );

  const vehicleOptions = [
    { value: undefined as number | undefined, label: 'None' },
    ...(vehicles.data ?? []).filter((v) => v.isActive).map((v) => ({ value: v.vehicleId as number | undefined, label: `${v.regNo} (${v.routeNo})` })),
  ];

  return (
    <AdminPage>
      <Card>
        <Text style={[styles.label, { color: c.text }]}>Account type</Text>
        <Controller control={control} name="role" render={({ field }) => <Chips label="Account type" options={ROLES} value={field.value} onChange={field.onChange} />} />

        <Controller
          control={control}
          name="name"
          render={({ field }) => <TextField label="Full name" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={errors.name?.message} />}
        />
        <Controller
          control={control}
          name="identifier"
          render={({ field }) => (
            <TextField
              label="Email or mobile number (used to log in)"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              error={errors.identifier?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <TextField
              label="First password (8+ characters, with a letter and a number)"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
              error={errors.password?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="employeeNo"
          render={({ field }) => (
            <TextField label="Employee number" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} autoCapitalize="characters" error={errors.employeeNo?.message} />
          )}
        />
        <Controller
          control={control}
          name="organisation"
          render={({ field }) => (
            <TextField
              label={isStaff ? 'Depot or operator' : 'Department'}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={errors.organisation?.message}
            />
          )}
        />

        {isStaff ? (
          <>
            <Text style={[styles.label, { color: c.text }]}>Role on board</Text>
            <Controller control={control} name="staffType" render={({ field }) => <Chips label="Role on board" options={STAFF_TYPES} value={field.value} onChange={field.onChange} />} />
            {errors.staffType ? <ErrorMessage message={errors.staffType.message ?? 'Choose conductor or inspector.'} /> : null}

            <Text style={[styles.label, { color: c.text }]}>Vehicle (optional)</Text>
            <Controller
              control={control}
              name="vehicleId"
              render={({ field }) => <Chips label="Vehicle" options={vehicleOptions} value={field.value} onChange={field.onChange} translateOptions={false} />}
            />
          </>
        ) : null}

        {create.isError ? <ErrorMessage message={errorMessage(create.error)} /> : null}
        <Button title="Create account" loading={create.isPending} onPress={onSubmit} />
      </Card>
    </AdminPage>
  );
}

const styles = StyleSheet.create({
  label: { ...typography.body, fontWeight: '700' },
});
