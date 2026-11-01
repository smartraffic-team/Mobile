import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  AppColors,
  BorderWidth,
  Radius,
  Sizes,
  Spacing,
  Type,
} from '@/constants/theme';

const tabs = [
  { key: 'map', label: 'Mapa', ios: 'map', android: 'map' },
  { key: 'tickets', label: 'Chamados', ios: 'list.clipboard', android: 'assignment' },
  { key: 'dashboard', label: 'Dashboard', ios: 'chart.bar.xaxis', android: 'monitoring' },
  { key: 'profile', label: 'Perfil', ios: 'person.crop.circle', android: 'account_circle' },
] as const;

export function MapTabBar({
  bottomInset,
  onSelectTab,
}: {
  bottomInset: number;
  onSelectTab: (tab: string) => void;
}) {
  return (
    <View style={[styles.bar, { paddingBottom: bottomInset }]}>
      {tabs.map((tab) => {
        const isSelected = tab.key === 'map';
        const color = isSelected ? AppColors.primary : AppColors.textSecondary;

        return (
          <Pressable
            accessibilityLabel={tab.label}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            key={tab.key}
            onPress={() => onSelectTab(tab.key)}
            style={({ pressed }) => [styles.tab, pressed && styles.pressed]}>
            {isSelected ? <View style={styles.indicator} /> : null}
            <SymbolView
              name={{ ios: tab.ios, android: tab.android, web: tab.android }}
              size={Sizes.icon + Spacing.one}
              tintColor={color}
            />
            <Text style={[styles.label, { color }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    minHeight: Sizes.navigationBar,
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-around',
    backgroundColor: AppColors.background,
    borderTopColor: AppColors.borderStrong,
    borderTopWidth: BorderWidth.hairline,
  },
  tab: {
    flex: 1,
    minHeight: Sizes.minTouch,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.one,
  },
  indicator: {
    position: 'absolute',
    top: 0,
    width: Sizes.avatar,
    height: BorderWidth.focus,
    borderRadius: Radius.full,
    backgroundColor: AppColors.primary,
  },
  label: {
    ...Type.body,
  },
  pressed: {
    opacity: 0.7,
  },
});
