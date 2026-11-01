import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';

import {
  AppColors,
  BorderWidth,
  Layout,
  MaxAuthWidth,
  Radius,
  Spacing,
  StatusColors,
  Type,
} from '@/constants/theme';
import type { CameraNetworkSummary } from '@/services/contracts/cameras';

const summaryLabels = [
  { key: 'online', label: 'Online', color: StatusColors.camera.online },
  { key: 'offline', label: 'offline', color: StatusColors.camera.offline },
  { key: 'maintenance', label: 'manutenção', color: StatusColors.camera.maintenance },
] as const;

export function CameraNetworkSummaryCard({ summary }: { summary: CameraNetworkSummary }) {
  return (
    <Animated.View
      entering={FadeIn.duration(220)}
      layout={LinearTransition.duration(180)}
      style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.totalCount}>
          <Text style={styles.onlineCount}>{summary.online}</Text>
          <Text style={styles.totalCountLabel}>/ {summary.total}</Text>
        </View>
        <StatusPill label="Online" color={StatusColors.camera.online} />
      </View>
      <View style={styles.statusRow}>
        {summaryLabels.slice(1).map(({ key, label, color }) => (
          <StatusPill
            key={key}
            label={`${summary[key]} ${label}`}
            color={color}
          />
        ))}
      </View>
      <Text style={styles.caption}>
        Dados ilustrativos · Atualizado às {summary.updatedAt}
      </Text>
    </Animated.View>
  );
}

function StatusPill({
  label,
  color,
}: {
  label: string;
  color: { bg: string; fg: string };
}) {
  return (
    <View style={[styles.pill, { backgroundColor: color.bg }]}>
      <View style={[styles.dot, { backgroundColor: color.fg }]} />
      <Text style={[styles.pillLabel, { color: color.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: MaxAuthWidth,
    alignSelf: 'center',
    gap: Spacing.two,
    backgroundColor: AppColors.background,
    borderColor: AppColors.borderStrong,
    borderWidth: BorderWidth.hairline,
    borderRadius: Radius.lg,
    padding: Layout.screenMargin,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  totalCount: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.two,
  },
  onlineCount: {
    ...Type.display,
    color: AppColors.text,
  },
  totalCountLabel: {
    ...Type.heading,
    color: AppColors.textSecondary,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  pill: {
    minHeight: Spacing.five,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.sm,
  },
  dot: {
    width: Spacing.two,
    height: Spacing.two,
    borderRadius: Radius.full,
  },
  pillLabel: {
    ...Type.bodyStrong,
  },
  caption: {
    ...Type.body,
    color: AppColors.textSecondary,
    marginTop: Spacing.one,
  },
});
