import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppColors, BorderWidth, Radius, Spacing } from '@/constants/theme';

export function ProfileCard({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
    padding: Spacing.three,
    borderWidth: BorderWidth.hairline,
    borderColor: AppColors.borderStrong,
    borderRadius: Radius.lg,
    backgroundColor: AppColors.backgroundElement,
  },
});
