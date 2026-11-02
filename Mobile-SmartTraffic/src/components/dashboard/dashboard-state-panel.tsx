import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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

export function DashboardStatePanel({
  kind,
  onRetry,
  onChoosePeriod,
}: {
  kind: 'empty' | 'error';
  onRetry: () => void;
  onChoosePeriod: () => void;
}) {
  const isEmpty = kind === 'empty';
  const title = isEmpty ? 'Sem dados neste período' : 'Relatório indisponível';
  const description = isEmpty
    ? 'Ainda não há detecções consolidadas para a seleção. Escolha outro período para consultar o histórico.'
    : 'Não foi possível consultar os dados da operação. Verifique a conexão e tente novamente.';

  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      entering={FadeIn.duration(220)}
      exiting={FadeOut.duration(180)}
      style={styles.container}>
      <View style={styles.iconBox}>
        <SymbolView
          name={{
            ios: isEmpty ? 'magnifyingglass' : 'wifi.slash',
            android: isEmpty ? 'search_off' : 'wifi_off',
            web: isEmpty ? 'search_off' : 'wifi_off',
          }}
          size={Sizes.avatar}
          tintColor={isEmpty ? AppColors.primary : AppColors.error}
        />
      </View>
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      <Text style={styles.description}>{description}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={isEmpty ? onChoosePeriod : onRetry}
        style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
        {!isEmpty ? (
          <SymbolView
            name={{ ios: 'arrow.clockwise', android: 'refresh', web: 'refresh' }}
            size={Sizes.icon + Spacing.two}
            tintColor={AppColors.onPrimary}
          />
        ) : null}
        <Text style={styles.actionLabel}>
          {isEmpty ? 'Selecionar período' : 'Tentar novamente'}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: MaxAuthWidth,
    flex: 1,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
    paddingHorizontal: Layout.screenMargin,
    paddingVertical: Spacing.six,
  },
  iconBox: {
    width: Sizes.avatar + Spacing.five,
    height: Sizes.avatar + Spacing.five,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: BorderWidth.focus,
    borderColor: AppColors.borderStrong,
    borderRadius: Radius.xl,
    backgroundColor: AppColors.backgroundElement,
  },
  title: {
    ...Type.cameraTitle,
    color: AppColors.text,
    textAlign: 'center',
  },
  description: {
    ...Type.loginSubtitle,
    color: AppColors.textSecondary,
    textAlign: 'center',
  },
  action: {
    width: '100%',
    minHeight: Sizes.control + Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    backgroundColor: AppColors.primary,
  },
  actionLabel: {
    ...Type.button,
    color: AppColors.onPrimary,
  },
  pressed: {
    opacity: 0.78,
  },
});
