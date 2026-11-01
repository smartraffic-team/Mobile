import { SymbolView } from 'expo-symbols';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

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

type MapStatusOverlayProps = {
  state: 'loading' | 'error';
  message: string;
  onRetry: () => void;
  top: number;
  bottom: number;
};

export function MapStatusOverlay({
  state,
  message,
  onRetry,
  top,
  bottom,
}: MapStatusOverlayProps) {
  const isLoading = state === 'loading';

  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      entering={FadeIn.duration(220)}
      exiting={FadeOut.duration(180)}
      pointerEvents="auto"
      style={[styles.overlay, { top, bottom }]}>
      <View style={styles.content}>
        <View style={styles.iconBox}>
          {isLoading ? (
            <ActivityIndicator color={AppColors.primary} size="large" />
          ) : (
            <SymbolView
              name={{ ios: 'wifi.slash', android: 'wifi_off', web: 'wifi_off' }}
              size={Sizes.avatar}
              tintColor={AppColors.error}
            />
          )}
        </View>
        <Text accessibilityRole="header" style={styles.title}>
          {isLoading ? 'Carregando mapa' : 'Sem conexão com o mapa'}
        </Text>
        <Text style={styles.description}>
          {isLoading
            ? 'Preparando o mapa e as posições demonstrativas das câmeras.'
            : message}
        </Text>
        {!isLoading ? (
          <Pressable
            accessibilityRole="button"
            onPress={onRetry}
            style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}>
            <SymbolView
              name={{ ios: 'arrow.clockwise', android: 'refresh', web: 'refresh' }}
              size={Sizes.icon}
              tintColor={AppColors.onPrimary}
            />
            <Text style={styles.retryLabel}>Tentar novamente</Text>
          </Pressable>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.overlay,
    paddingHorizontal: Layout.screenMargin,
  },
  content: {
    width: '100%',
    maxWidth: MaxAuthWidth,
    alignItems: 'center',
    gap: Spacing.four,
  },
  iconBox: {
    width: Sizes.avatar + Spacing.five,
    height: Sizes.avatar + Spacing.five,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.xl,
    borderColor: AppColors.borderStrong,
    borderWidth: BorderWidth.focus,
  },
  title: {
    ...Type.cameraTitle,
    color: AppColors.text,
    textAlign: 'center',
  },
  description: {
    ...Type.body,
    color: AppColors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    minHeight: Sizes.control,
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    backgroundColor: AppColors.primary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
  },
  retryLabel: {
    ...Type.button,
    color: AppColors.onPrimary,
  },
  pressed: {
    opacity: 0.8,
  },
});
