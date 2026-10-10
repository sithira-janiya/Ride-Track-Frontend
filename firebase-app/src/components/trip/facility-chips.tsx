import { StyleSheet, View } from 'react-native';
import { Chip } from 'react-native-paper';

import { colors, spacing } from '@/constants/theme';
import { facilityIcon, facilityShort } from '@/constants/facilities';

type Props = {
  facilities: string[];
  /** Short labels ("AC") for tight spaces; full names ("Air Conditioning") by default. */
  compact?: boolean;
};

/** Row of onboard facility chips with an icon each. */
export function FacilityChips({ facilities, compact }: Props) {
  if (facilities.length === 0) return null;
  return (
    <View style={styles.row}>
      {facilities.map((name) => (
        <Chip key={name} compact={compact} icon={facilityIcon(name)} style={styles.chip} textStyle={styles.text}>
          {compact ? facilityShort(name) : name}
        </Chip>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { backgroundColor: colors.surfaceAlt },
  text: { color: colors.text },
});
