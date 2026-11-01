import { StyleSheet, Text, View } from 'react-native';

import { AppColors, Radius, Spacing, StatusColors, Type } from '@/constants/theme';
import type { CameraStatus } from '@/services/contracts/cameras';

const cameraStatusLabels: Record<CameraStatus, string> = {
  online: 'Online',
  offline: 'Offline',
  maintenance: 'Em manutenção',
};

export function CameraStatusBadge({ status }: { status: CameraStatus }) {
  const colors = StatusColors.camera[status];

  return (
    <View
      accessibilityLabel={`Status da câmera: ${cameraStatusLabels[status]}`}
      style={[styles.badge, { backgroundColor: colors.bg }]}>
      <View style={[styles.dot, { backgroundColor: colors.fg }]} />
      <Text style={[styles.label, { color: colors.fg }]}>{cameraStatusLabels[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
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
  label: {
    ...Type.bodyStrong,
    color: AppColors.text,
  },
});
