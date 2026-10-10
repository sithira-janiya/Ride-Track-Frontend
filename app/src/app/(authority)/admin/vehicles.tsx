import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';

import { errorMessage } from '@/api/client';
import { AdminPage } from '@/components/admin/AdminPage';
import { Button, Card, Chips, EmptyState, ErrorMessage, Loading, StatusBadge, TextField } from '@/components/ui';
import { useAdminRoutes, useAdminVehicles, useCreateVehicle, useUpdateVehicle } from '@/hooks/use-admin';
import { useColors } from '@/hooks/use-colors';
import { spacing, typography } from '@/theme';
import type { AdminRoute, AdminVehicle, TransportMode } from '@/types';
import { confirmAction } from '@/utils/confirm';
import { modeLabel } from '@/utils/format';
import { vehicleSchema, type VehicleForm } from '@/utils/validation';

const MODES: { value: TransportMode; label: string }[] = [
  { value: 'BUS', label: 'Bus' },
  { value: 'TRAIN', label: 'Train' },
];

/** A vehicle can only run on a route of its own kind. */
const routeOptions = (routes: AdminRoute[], mode: TransportMode) =>
  routes.filter((r) => r.mode === mode).map((r) => ({ value: r.routeId as number | undefined, label: `${r.routeNo} ${r.name}` }));

function AddVehicle({ routes, onDone }: { routes: AdminRoute[]; onDone: () => void }) {
  const c = useColors();
  const create = useCreateVehicle();
  const [mode, setMode] = useState<TransportMode>('BUS');
  const {
    control,
    handleSubmit,
    resetField,
    formState: { errors },
  } = useForm<VehicleForm>({ resolver: zodResolver(vehicleSchema), defaultValues: { regNo: '', capacity: '' } });

  const onSubmit = handleSubmit(({ regNo, capacity, routeId }) =>
    create.mutate({ regNo: regNo.trim().toUpperCase(), type: mode, capacity: Number(capacity), routeId }, { onSuccess: onDone }),
  );

  return (
    <Card>
      <Text accessibilityRole="header" style={[styles.title, { color: c.text }]}>
        Add a vehicle
      </Text>
      <Controller
        control={control}
        name="regNo"
        render={({ field }) => (
          <TextField label="Registration number" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} autoCapitalize="characters" error={errors.regNo?.message} />
        )}
      />
      <Text style={[styles.label, { color: c.text }]}>Type</Text>
      <Chips
        label="Type"
        options={MODES}
        value={mode}
        onChange={(m) => {
          setMode(m);
          resetField('routeId'); // the old route is the wrong kind now
        }}
      />
      <Text style={[styles.label, { color: c.text }]}>Route</Text>
      <Controller
        control={control}
        name="routeId"
        render={({ field }) => <Chips label="Route" options={routeOptions(routes, mode)} value={field.value} onChange={field.onChange} translateOptions={false} />}
      />
      {errors.routeId ? <ErrorMessage message={errors.routeId.message ?? 'Choose the route it runs on.'} /> : null}
      <Controller
        control={control}
        name="capacity"
        render={({ field }) => (
          <TextField
            label="Capacity (passengers)"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            keyboardType="number-pad"
            maxLength={4}
            error={errors.capacity?.message}
          />
        )}
      />
      {create.isError ? <ErrorMessage message={errorMessage(create.error)} /> : null}
      <View style={styles.actions}>
        <Button title="Add vehicle" loading={create.isPending} onPress={onSubmit} style={styles.grow} />
        <Button title="Cancel" variant="secondary" onPress={onDone} style={styles.grow} />
      </View>
    </Card>
  );
}

function VehicleRow({ vehicle, routes }: { vehicle: AdminVehicle; routes: AdminRoute[] }) {
  const c = useColors();
  const update = useUpdateVehicle();
  const [editing, setEditing] = useState(false);
  const [capacity, setCapacity] = useState(String(vehicle.capacity));
  const [routeId, setRouteId] = useState<number | undefined>(vehicle.routeId);
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    const n = Number(capacity);
    if (!/^\d+$/.test(capacity.trim()) || n < 1 || n > 5000) return setError('Capacity must be a whole number between 1 and 5000.');
    setError(null);
    update.mutate({ vehicleId: vehicle.vehicleId, capacity: n, routeId }, { onSuccess: () => setEditing(false) });
  };

  const toggleService = async () => {
    if (vehicle.isActive) {
      const ok = await confirmAction(`Take ${vehicle.regNo} out of service?`, 'It stops appearing on its route until you return it to service.', 'Take out');
      if (!ok) return;
    }
    update.mutate({ vehicleId: vehicle.vehicleId, isActive: !vehicle.isActive });
  };

  return (
    <Card>
      <View style={styles.row}>
        <Text style={[styles.name, { color: c.text }]}>{vehicle.regNo}</Text>
        <StatusBadge label={vehicle.isActive ? 'In service' : 'Out of service'} tone={vehicle.isActive ? 'success' : 'danger'} />
      </View>
      <Text style={[styles.body, { color: c.textSecondary }]}>
        {modeLabel(vehicle.type)} · Route {vehicle.routeNo} · {vehicle.capacity} passengers
      </Text>

      {editing ? (
        <>
          <TextField label="Capacity (passengers)" value={capacity} onChangeText={setCapacity} keyboardType="number-pad" maxLength={4} />
          <Text style={[styles.label, { color: c.text }]}>Route</Text>
          <Chips label="Route" options={routeOptions(routes, vehicle.type)} value={routeId} onChange={setRouteId} translateOptions={false} />
          {error ? <ErrorMessage message={error} /> : null}
          {update.isError ? <ErrorMessage message={errorMessage(update.error)} /> : null}
          <View style={styles.actions}>
            <Button title="Save" loading={update.isPending} onPress={save} style={styles.grow} />
            <Button
              title="Cancel"
              variant="secondary"
              onPress={() => {
                setEditing(false);
                setCapacity(String(vehicle.capacity));
                setRouteId(vehicle.routeId);
                setError(null);
                update.reset();
              }}
              style={styles.grow}
            />
          </View>
        </>
      ) : (
        <>
          {update.isError ? <ErrorMessage message={errorMessage(update.error)} /> : null}
          <View style={styles.actions}>
            <Button title="Edit" variant="secondary" onPress={() => setEditing(true)} style={styles.grow} />
            <Button
              title={vehicle.isActive ? 'Take out of service' : 'Return to service'}
              variant={vehicle.isActive ? 'danger' : 'secondary'}
              loading={update.isPending}
              onPress={toggleService}
              style={styles.grow}
            />
          </View>
        </>
      )}
    </Card>
  );
}

export default function VehiclesScreen() {
  const vehicles = useAdminVehicles();
  const routes = useAdminRoutes();
  const [adding, setAdding] = useState(false);

  if (vehicles.isPending || routes.isPending) {
    return (
      <AdminPage>
        <Loading label="Loading vehicles…" />
      </AdminPage>
    );
  }
  if (vehicles.isError || routes.isError) {
    return (
      <AdminPage>
        <ErrorMessage
          message={errorMessage(vehicles.error ?? routes.error)}
          onRetry={() => {
            vehicles.refetch();
            routes.refetch();
          }}
        />
      </AdminPage>
    );
  }

  return (
    <AdminPage>
      {adding ? <AddVehicle routes={routes.data} onDone={() => setAdding(false)} /> : <Button title="Add a vehicle" onPress={() => setAdding(true)} />}
      {vehicles.data.length === 0 ? (
        <EmptyState title="No vehicles yet" message="Add the first bus or train above." />
      ) : (
        vehicles.data.map((v) => <VehicleRow key={v.vehicleId} vehicle={v} routes={routes.data} />)
      )}
    </AdminPage>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, flexWrap: 'wrap' },
  name: { ...typography.bodyLarge, fontWeight: '700' },
  title: { ...typography.title },
  label: { ...typography.body, fontWeight: '700' },
  body: { ...typography.body },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  grow: { flexGrow: 1 },
});
