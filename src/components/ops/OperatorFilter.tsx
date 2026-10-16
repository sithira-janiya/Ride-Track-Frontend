import { StyleSheet, Text } from 'react-native';

import { Chips } from '@/components/ui';
import { useColors } from '@/hooks/use-colors';
import { typography } from '@/theme';
import type { FleetVehicle, Operator } from '@/types';
import { OPERATOR_LABEL } from '@/utils/format';

const OPTIONS: { value: Operator | undefined; label: string }[] = [
  { value: undefined, label: 'All operators' },
  ...(Object.keys(OPERATOR_LABEL) as Operator[]).map((o) => ({ value: o, label: OPERATOR_LABEL[o] })),
];

export const byOperator = (operator: Operator | undefined) => (v: FleetVehicle) => !operator || v.operator === operator;

type Props = { vehicles: FleetVehicle[]; value: Operator | undefined; onChange: (v: Operator | undefined) => void };

/**
 * SLTB, private (NTC permit) and railway vehicles side by side: how many of each are live, and a filter to show one.
 * Shows nothing when the server does not say who runs its vehicles.
 */
export function OperatorFilter({ vehicles, value, onChange }: Props) {
  const c = useColors();
  if (!vehicles.some((v) => v.operator)) return null;
  const counts = (Object.keys(OPERATOR_LABEL) as Operator[])
    .map((o) => ({ o, n: vehicles.filter((v) => v.operator === o).length }))
    .filter(({ n }) => n > 0)
    .map(({ o, n }) => `${OPERATOR_LABEL[o]} ${n}`);
  return (
    <>
      <Chips label="Operator" options={OPTIONS} value={value} onChange={onChange} />
      <Text style={[styles.caption, { color: c.textSecondary }]}>Live now: {counts.join(' · ')}</Text>
    </>
  );
}

const styles = StyleSheet.create({
  caption: { ...typography.caption },
});
