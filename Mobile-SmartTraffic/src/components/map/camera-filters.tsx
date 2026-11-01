import { SymbolView } from 'expo-symbols';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';

import {
  AppColors,
  BorderWidth,
  Layout,
  MaxAuthWidth,
  Radius,
  Sizes,
  Spacing,
  StatusColors,
  Type,
} from '@/constants/theme';
import type { CameraStatus } from '@/services/contracts/cameras';

const filters: { status: CameraStatus; label: string }[] = [
  { status: 'online', label: 'Online' },
  { status: 'offline', label: 'Offline' },
  { status: 'maintenance', label: 'Em manutenção' },
];

export function CameraFilters({
  visible,
  selectedStatuses,
  onToggle,
  onClose,
}: {
  visible: boolean;
  selectedStatuses: CameraStatus[];
  onToggle: (status: CameraStatus) => void;
  onClose: () => void;
}) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}>
      <View style={styles.modal}>
        <Pressable
          accessibilityLabel="Fechar os filtros"
          accessibilityRole="button"
          onPress={onClose}
          style={styles.backdrop}
        />
        <Animated.View entering={SlideInDown.duration(220)} style={styles.sheet}>
          <View style={styles.content}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <Text accessibilityRole="header" style={styles.title}>
                Filtrar câmeras
              </Text>
              <Pressable
                accessibilityLabel="Fechar os filtros"
                accessibilityRole="button"
                onPress={onClose}
                style={styles.closeButton}>
                <SymbolView
                  name={{ ios: 'xmark', android: 'close', web: 'close' }}
                  size={Sizes.icon}
                  tintColor={AppColors.textSecondary}
                />
              </Pressable>
            </View>
            <Text style={styles.caption}>Escolha os status exibidos no mapa.</Text>
            {filters.map(({ status, label }) => {
              const isSelected = selectedStatuses.includes(status);
              const colors = StatusColors.camera[status];

              return (
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSelected }}
                  key={status}
                  onPress={() => onToggle(status)}
                  style={({ pressed }) => [styles.filterRow, pressed && styles.pressed]}>
                  <View style={[styles.statusDot, { backgroundColor: colors.fg }]} />
                  <Text style={styles.filterLabel}>{label}</Text>
                  <SymbolView
                    name={{
                      ios: isSelected ? 'checkmark.circle.fill' : 'circle',
                      android: isSelected ? 'check_circle' : 'radio_button_unchecked',
                      web: isSelected ? 'check_circle' : 'radio_button_unchecked',
                    }}
                    size={Sizes.icon}
                    tintColor={isSelected ? AppColors.primary : AppColors.textSecondary}
                  />
                </Pressable>
              );
            })}
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={({ pressed }) => [styles.applyButton, pressed && styles.pressed]}>
              <Text style={styles.applyLabel}>Aplicar filtros</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: AppColors.overlay,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    alignItems: 'center',
    backgroundColor: AppColors.background,
    borderTopColor: AppColors.border,
    borderTopWidth: BorderWidth.hairline,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Layout.screenMargin,
    paddingVertical: Spacing.three,
  },
  content: {
    width: '100%',
    maxWidth: MaxAuthWidth,
    gap: Spacing.three,
  },
  handle: {
    width: Sizes.avatar,
    height: BorderWidth.focus + Spacing.one,
    alignSelf: 'center',
    borderRadius: Radius.full,
    backgroundColor: AppColors.borderStrong,
  },
  header: {
    minHeight: Sizes.minTouch,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...Type.cameraTitle,
    color: AppColors.text,
  },
  closeButton: {
    width: Sizes.minTouch,
    height: Sizes.minTouch,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caption: {
    ...Type.body,
    color: AppColors.textSecondary,
  },
  filterRow: {
    minHeight: Sizes.control,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  statusDot: {
    width: Spacing.two,
    height: Spacing.two,
    borderRadius: Radius.full,
  },
  filterLabel: {
    ...Type.bodyStrong,
    flex: 1,
    color: AppColors.text,
  },
  applyButton: {
    minHeight: Sizes.control,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
    backgroundColor: AppColors.primary,
    borderRadius: Radius.md,
  },
  applyLabel: {
    ...Type.button,
    color: AppColors.onPrimary,
  },
  pressed: {
    opacity: 0.75,
  },
});
