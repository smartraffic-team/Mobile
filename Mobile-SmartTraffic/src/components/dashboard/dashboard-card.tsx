import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';

import {
  AppColors,
  BorderWidth,
  Radius,
  Spacing,
  Type,
} from '@/constants/theme';

export function DashboardCard({
  title,
  detail,
  children,
}: {
  title: string;
  detail?: string;
  children: React.ReactNode;
}) {
  return (
    <Animated.View
      entering={FadeIn.duration(240)}
      layout={LinearTransition.duration(200)}
      style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {detail ? <Text style={styles.detail}>{detail}</Text> : null}
      </View>
      {children}
    </Animated.View>
  );
}

export const dashboardCardStyles = StyleSheet.create({
  sectionTitle: {
    ...Type.heading,
    color: AppColors.text,
  },
  body: {
    ...Type.body,
    color: AppColors.textSecondary,
  },
  caption: {
    ...Type.caption,
    color: AppColors.textSecondary,
  },
});

const styles = StyleSheet.create({
  card: {
    width: '100%',
    gap: Spacing.three,
    padding: Spacing.three,
    backgroundColor: AppColors.backgroundElement,
    borderWidth: BorderWidth.hairline,
    borderColor: AppColors.borderStrong,
    borderRadius: Radius.lg,
  },
  header: {
    minHeight: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  title: {
    ...Type.heading,
    flex: 1,
    color: AppColors.text,
  },
  detail: {
    ...Type.body,
    color: AppColors.textSecondary,
  },
});
