import { StyleSheet, View } from 'react-native';
import { Chip, HelperText, TextInput } from 'react-native-paper';

import { colors, radius, spacing } from '@/constants/theme';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  /** Places matching what is typed; tapping one fills the box. */
  suggestions: string[];
  error?: string;
  icon: string;
};

/** Text box for a place name with tappable suggestions underneath. */
export function PlaceInput({ label, value, onChangeText, suggestions, error, icon }: Props) {
  const showSuggestions = suggestions.length > 0 && !suggestions.some((s) => s.toLowerCase() === value.trim().toLowerCase());

  return (
    <View style={styles.wrap}>
      <TextInput
        mode="outlined"
        label={label}
        value={value}
        onChangeText={onChangeText}
        left={<TextInput.Icon icon={icon} />}
        error={!!error}
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType="next"
        style={styles.input}
        outlineStyle={styles.outline}
      />
      {error ? <HelperText type="error">{error}</HelperText> : null}
      {showSuggestions ? (
        <View style={styles.chips}>
          {suggestions.slice(0, 4).map((place) => (
            <Chip key={place} compact style={styles.chip} onPress={() => onChangeText(place)}>
              {place}
            </Chip>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  input: { backgroundColor: colors.surface },
  outline: { borderRadius: radius.md, borderColor: colors.border },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { backgroundColor: colors.surfaceAlt },
});
