import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { AppColors, BorderWidth, Radius, Sizes, Spacing } from '@/constants/theme';

type SymbolNames = Extract<SymbolViewProps['name'], { ios?: unknown }>;

type MapControlsProps = {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onLocate: () => void;
  onFilters: () => void;
};

export function MapControls({ onZoomIn, onZoomOut, onLocate, onFilters }: MapControlsProps) {
  return (
    <Animated.View style={styles.controls}>
      <MapAction
        accessibilityLabel="Centralizar mapa em Registro"
        ios="scope"
        android="my_location"
        onPress={onLocate}
      />
      <View style={styles.zoomGroup}>
        <MapAction
          accessibilityLabel="Aumentar zoom"
          ios="plus"
          android="add"
          onPress={onZoomIn}
          roundedTop
        />
        <View style={styles.divider} />
        <MapAction
          accessibilityLabel="Diminuir zoom"
          ios="minus"
          android="remove"
          onPress={onZoomOut}
          roundedBottom
        />
      </View>
      <MapAction
        accessibilityLabel="Filtrar câmeras do mapa"
        ios="slider.horizontal.3"
        android="tune"
        onPress={onFilters}
      />
    </Animated.View>
  );
}

function MapAction({
  accessibilityLabel,
  ios,
  android,
  onPress,
  roundedTop = false,
  roundedBottom = false,
}: {
  accessibilityLabel: string;
  ios: NonNullable<SymbolNames['ios']>;
  android: NonNullable<SymbolNames['android']>;
  onPress: () => void;
  roundedTop?: boolean;
  roundedBottom?: boolean;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        roundedTop && styles.roundedTop,
        roundedBottom && styles.roundedBottom,
        pressed && styles.pressed,
      ]}>
      <SymbolView
        name={{ ios, android, web: android }}
        size={Sizes.icon + Spacing.one}
        tintColor={AppColors.text}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  controls: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  zoomGroup: {
    overflow: 'hidden',
    backgroundColor: AppColors.background,
    borderRadius: Radius.md,
    borderWidth: BorderWidth.hairline,
    borderColor: AppColors.borderStrong,
  },
  button: {
    width: Sizes.mapAction,
    height: Sizes.mapAction,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.backgroundElement,
    borderRadius: Radius.md,
    borderWidth: BorderWidth.hairline,
    borderColor: AppColors.border,
  },
  roundedTop: {
    borderWidth: 0,
    borderRadius: 0,
    backgroundColor: AppColors.background,
  },
  roundedBottom: {
    borderWidth: 0,
    borderRadius: 0,
    backgroundColor: AppColors.background,
  },
  divider: {
    height: BorderWidth.hairline,
    backgroundColor: AppColors.borderStrong,
  },
  pressed: {
    opacity: 0.72,
  },
});
