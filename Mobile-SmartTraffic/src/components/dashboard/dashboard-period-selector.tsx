import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';

import {
  AppColors,
  BorderWidth,
  Radius,
  Sizes,
  Spacing,
  Type,
} from '@/constants/theme';
import type { DashboardPeriod } from '@/services/contracts/dashboard';

const periods: { key: DashboardPeriod; label: string }[] = [
  { key: 'today', label: 'Hoje' },
  { key: '7days', label: '7 dias' },
  { key: '30days', label: '30 dias' },
];

export function DashboardPeriodSelector({
  value,
  onChange,
}: {
  value: DashboardPeriod;
  onChange: (period: DashboardPeriod) => void;
}) {
  return (
    <View accessibilityRole="radiogroup" style={styles.row}>
      {periods.map((period) => {
        const selected = value === period.key;

        return (
          <Pressable
            key={period.key}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            onPress={() => onChange(period.key)}
            style={({ pressed }) => [
              styles.button,
              selected && styles.selected,
              pressed && styles.pressed,
            ]}>
            {selected ? (
              <Animated.View
                entering={FadeIn.duration(160)}
                layout={LinearTransition.duration(160)}
                style={styles.selectedContent}>
                <Text style={styles.selectedLabel}>{period.label}</Text>
              </Animated.View>
            ) : (
              <Text style={styles.label}>{period.label}</Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  button: {
    minWidth: Sizes.minTouch + Spacing.five,
    minHeight: Sizes.control,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: BorderWidth.hairline,
    borderColor: AppColors.borderStrong,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    backgroundColor: AppColors.backgroundElement,
  },
  selected: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.primary,
  },
  selectedContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...Type.bodyStrong,
    color: AppColors.textSecondary,
  },
  selectedLabel: {
    ...Type.bodyStrong,
    color: AppColors.onPrimary,
  },
  pressed: {
    opacity: 0.75,
  },
});
