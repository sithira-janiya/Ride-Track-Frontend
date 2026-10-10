import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { colors, radius, spacing } from '@/constants/theme';
import { formatDate } from '@/lib/format';

type Props = {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
};

/** Looks like the other inputs; tapping it opens the system date picker. Past dates are not allowed. */
export function DateField({ label, value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${formatDate(value)}. Tap to change`}
        onPress={() => setOpen(true)}
        style={styles.field}
      >
        <Ionicons name="calendar-outline" size={20} color={colors.textMuted} />
        <View style={styles.text}>
          <Text variant="labelSmall" style={styles.label}>
            {label}
          </Text>
          <Text variant="bodyLarge">{formatDate(value)}</Text>
        </View>
      </Pressable>
      {open ? (
        <DateTimePicker
          value={value}
          mode="date"
          minimumDate={new Date(new Date().setHours(0, 0, 0, 0))}
          onChange={(_event, selected) => {
            setOpen(false);
            if (selected) onChange(selected);
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  text: { flex: 1 },
  label: { color: colors.textMuted },
});
