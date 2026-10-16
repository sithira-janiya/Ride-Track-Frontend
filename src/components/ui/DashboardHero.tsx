import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';

import { useT } from '@/i18n';
import { heroColors, radius, spacing, typography, type HeroTone } from '@/theme';

import { illustrations, type IllustrationName } from './illustrations';

const WHITE = '#FFFFFF';
// decorative, so colour alone is fine here: the pill's text says the same thing
const DOT = { success: '#16A34A', warning: '#D97706' } as const;

function useHeroColor(tone: HeroTone) {
  return heroColors[tone][useColorScheme() === 'dark' ? 'dark' : 'light'];
}

type Props = {
  tone: HeroTone;
  illustration: IllustrationName;
  title: string;
  /** Small line above the title, such as a greeting. */
  eyebrow?: string;
  /** Fills `{placeholders}` in the eyebrow only, so the title and subtitle translate on their own. */
  eyebrowParams?: Record<string, string | number>;
  subtitle?: string;
  /** Shown under the text, such as a `HeroPill`. */
  children?: ReactNode;
};

/**
 * Coloured welcome card at the top of a role's home screen, with that role's illustration in the corner.
 * Text is white on the role colour (theme `heroColors`); the picture is decorative and hidden from screen readers.
 */
export function DashboardHero({ tone, illustration, title, eyebrow, eyebrowParams, subtitle, children }: Props) {
  const t = useT();
  const bg = useHeroColor(tone);
  return (
    <View style={[styles.card, { backgroundColor: bg }]}>
      <View style={[styles.bubble, styles.bubbleTop]} />
      <View style={[styles.bubble, styles.bubbleBottom]} />
      <View style={styles.text}>
        {eyebrow ? <Text style={styles.eyebrow}>{t(eyebrow, eyebrowParams)}</Text> : null}
        <Text accessibilityRole="header" maxFontSizeMultiplier={1.3} style={styles.title}>
          {t(title)}
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{t(subtitle)}</Text> : null}
        {children}
      </View>
      <Image source={illustrations[illustration]} style={styles.art} contentFit="contain" accessibilityLabel="" />
    </View>
  );
}

type PillProps = { tone: HeroTone; label: string; params?: Record<string, string | number>; status?: keyof typeof DOT };

/** White label on a hero card, in the card's colour, with an optional status dot. */
export function HeroPill({ tone, label, params, status }: PillProps) {
  const t = useT();
  const color = useHeroColor(tone);
  return (
    <View style={styles.pill}>
      {status ? <View style={[styles.dot, { backgroundColor: DOT[status] }]} /> : null}
      <Text style={[styles.pillText, { color }]}>{t(label, params)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', borderRadius: 24, overflow: 'hidden', paddingLeft: spacing.lg, paddingTop: spacing.lg, minHeight: 168 },
  bubble: { position: 'absolute', borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.07)' },
  bubbleTop: { width: 220, height: 220, top: -110, right: -40 },
  bubbleBottom: { width: 130, height: 130, bottom: -70, left: -40 },
  text: { flex: 1, justifyContent: 'center', gap: spacing.xs, paddingRight: spacing.sm, paddingBottom: spacing.lg },
  eyebrow: { ...typography.body, color: WHITE, fontWeight: '600' },
  title: { ...typography.heading, color: WHITE },
  subtitle: { ...typography.body, color: WHITE },
  art: { width: '42%', maxWidth: 200, aspectRatio: 7 / 6, alignSelf: 'flex-end' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs + 2,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: WHITE,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  pillText: { ...typography.caption, fontWeight: '700', flexShrink: 1 },
});
