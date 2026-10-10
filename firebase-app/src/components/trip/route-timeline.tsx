import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { colors, spacing } from '@/constants/theme';
import type { StopState } from '@/lib/trip-progress';
import type { StopTime } from '@/types/models';

const stateLabel: Record<StopState, string> = {
  departed: 'Departed',
  arrived: 'Arrived',
  upcoming: 'Upcoming',
};

type Props = {
  stopTimes: StopTime[];
  /** One state per stop. Leave out to show times only. */
  states?: StopState[];
};

/** Vertical list of stops with a dot, a connecting line, the stop name, its state and its time. */
export function RouteTimeline({ stopTimes, states }: Props) {
  return (
    <View>
      {stopTimes.map(({ stop, time }, index) => {
        const state = states?.[index];
        const passed = state === 'departed' || state === 'arrived';
        const last = index === stopTimes.length - 1;
        return (
          <View key={stop.name} style={styles.row}>
            <View style={styles.rail}>
              <View style={[styles.dot, passed ? styles.dotPassed : styles.dotUpcoming]} />
              {last ? null : <View style={[styles.line, passed && states?.[index + 1] !== 'upcoming' && styles.linePassed]} />}
            </View>
            <View style={styles.text}>
              <Text variant="bodyLarge" style={styles.name}>
                {stop.name}
              </Text>
              {state ? (
                <Text variant="bodySmall" style={styles.muted}>
                  {stateLabel[state]}
                </Text>
              ) : null}
            </View>
            <Text variant="bodyLarge" style={styles.time}>
              {time}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md, minHeight: 56 },
  rail: { alignItems: 'center', width: 16 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, marginTop: 4 },
  dotPassed: { backgroundColor: colors.primary, borderColor: colors.primary },
  dotUpcoming: { backgroundColor: colors.surface, borderColor: colors.border },
  line: { flex: 1, width: 2, backgroundColor: colors.border, marginVertical: 2 },
  linePassed: { backgroundColor: colors.primary },
  text: { flex: 1, gap: 2 },
  name: { fontWeight: '600' },
  muted: { color: colors.textMuted },
  time: { fontWeight: '700', color: colors.text },
});
