import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';

import { CameraStatusBadge } from '@/components/map/camera-status-badge';
import {
  AppColors,
  BorderWidth,
  Layout,
  MaxAuthWidth,
  Radius,
  Sizes,
  Spacing,
  Type,
} from '@/constants/theme';
import type { Camera } from '@/services/contracts/cameras';

export function CameraDetailSheet({
  camera,
  bottomInset,
  onClose,
  onViewLive,
}: {
  camera: Camera;
  bottomInset: number;
  onClose: () => void;
  onViewLive: () => void;
}) {
  return (
    <>
      <Pressable
        accessibilityLabel="Fechar os detalhes da câmera"
        accessibilityRole="button"
        onPress={onClose}
        style={styles.backdrop}
      />
      <Animated.View
        entering={SlideInDown.duration(260)}
        style={[styles.sheet, { bottom: bottomInset }]}>
        <View style={styles.content}>
          <Pressable
            accessibilityLabel="Fechar os detalhes"
            accessibilityRole="button"
            hitSlop={Spacing.three}
            onPress={onClose}
            style={styles.handleArea}>
            <View style={styles.handle} />
          </Pressable>

          <View style={styles.titleRow}>
            <View style={styles.cameraTitle}>
              <Text style={styles.cameraId}>{camera.id}</Text>
              <Text style={styles.subtitle}>{camera.address}</Text>
            </View>
            <CameraStatusBadge status={camera.status} />
          </View>

          <View style={styles.preview}>
            <SymbolView
              name={{
                ios: camera.status === 'offline' ? 'video.slash' : 'video',
                android: camera.status === 'offline' ? 'videocam_off' : 'videocam',
                web: camera.status === 'offline' ? 'videocam_off' : 'videocam',
              }}
              size={Sizes.avatar}
              tintColor={AppColors.textSecondary}
            />
            <Text style={styles.previewTitle}>
              {camera.status === 'offline' ? 'Câmera desconectada' : 'Prévia indisponível'}
            </Text>
            <Text style={styles.previewCaption}>A transmissão estará disponível após a integração.</Text>
          </View>

          <View style={styles.addressRow}>
            <SymbolView
              name={{ ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' }}
              size={Sizes.icon}
              tintColor={AppColors.textSecondary}
            />
            <View style={styles.addressText}>
              <Text style={styles.addressTitle}>{camera.address} · {camera.neighborhood}</Text>
              <Text style={styles.demonstrationNote}>Localização ilustrativa, não oficial.</Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={onViewLive}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
            <SymbolView
              name={{ ios: 'play', android: 'play_arrow', web: 'play_arrow' }}
              size={Sizes.icon}
              tintColor={AppColors.onPrimary}
            />
            <Text style={styles.primaryButtonLabel}>Ver ao vivo</Text>
          </Pressable>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    zIndex: 8,
    backgroundColor: AppColors.overlay,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9,
    alignItems: 'center',
    backgroundColor: AppColors.background,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderColor: AppColors.border,
    borderWidth: BorderWidth.hairline,
    paddingHorizontal: Layout.screenMargin,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  content: {
    width: '100%',
    maxWidth: MaxAuthWidth,
    gap: Spacing.three,
  },
  handleArea: {
    minHeight: Sizes.minTouch,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: Sizes.avatar,
    height: BorderWidth.focus + Spacing.one,
    borderRadius: Radius.full,
    backgroundColor: AppColors.borderStrong,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  cameraTitle: {
    flex: 1,
    gap: Spacing.one,
  },
  cameraId: {
    ...Type.cameraTitle,
    color: AppColors.text,
  },
  subtitle: {
    ...Type.body,
    color: AppColors.textSecondary,
  },
  preview: {
    minHeight: Sizes.cameraPreview,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    backgroundColor: AppColors.backgroundElement,
    borderRadius: Radius.lg,
    padding: Spacing.three,
  },
  previewTitle: {
    ...Type.heading,
    color: AppColors.text,
    textAlign: 'center',
  },
  previewCaption: {
    ...Type.body,
    color: AppColors.textSecondary,
    textAlign: 'center',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  addressText: {
    flex: 1,
    gap: Spacing.one,
  },
  addressTitle: {
    ...Type.bodyStrong,
    color: AppColors.text,
  },
  demonstrationNote: {
    ...Type.body,
    color: AppColors.textSecondary,
  },
  primaryButton: {
    minHeight: Sizes.control,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    backgroundColor: AppColors.primary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
  },
  primaryButtonLabel: {
    ...Type.button,
    color: AppColors.onPrimary,
  },
  pressed: {
    opacity: 0.8,
  },
});
