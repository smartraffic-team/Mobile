import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import {
  AppColors,
  BorderWidth,
  Sizes,
  Spacing,
  Type,
} from '@/constants/theme';

const profileSymbols = {
  badge: { ios: 'checkmark.seal', android: 'verified', web: 'verified' },
  email: { ios: 'envelope', android: 'mail', web: 'mail' },
  phone: { ios: 'phone', android: 'call', web: 'call' },
  privacy: { ios: 'checkmark.shield', android: 'verified_user', web: 'verified_user' },
  schedule: { ios: 'clock', android: 'schedule', web: 'schedule' },
  lock: { ios: 'lock', android: 'lock', web: 'lock' },
  theme: { ios: 'moon', android: 'dark_mode', web: 'dark_mode' },
  language: { ios: 'character.book.closed', android: 'translate', web: 'translate' },
  devices: { ios: 'laptopcomputer.and.iphone', android: 'devices', web: 'devices' },
  shield: { ios: 'lock.shield', android: 'security', web: 'security' },
  activity: { ios: 'chart.bar', android: 'monitoring', web: 'monitoring' },
  logout: { ios: 'rectangle.portrait.and.arrow.right', android: 'logout', web: 'logout' },
} as const;

export type ProfileSymbolKey = keyof typeof profileSymbols;

export function ProfileInformationRow({
  label,
  value,
  icon,
  index,
}: {
  label: string;
  value: string;
  icon: ProfileSymbolKey;
  index: number;
}) {
  return (
    <Animated.View
      entering={FadeInDown.duration(200).delay(index * 30)}
      style={styles.informationRow}>
      <View style={styles.informationText}>
        <Text style={styles.informationLabel}>{label}</Text>
        <Text selectable style={styles.informationValue}>{value}</Text>
      </View>
      <SymbolView
        name={profileSymbols[icon]}
        size={Sizes.icon + Spacing.two}
        tintColor={AppColors.textSecondary}
      />
    </Animated.View>
  );
}

export function ProfileSettingRow({
  label,
  detail,
  icon,
  onPress,
}: {
  label: string;
  detail?: string;
  icon: ProfileSymbolKey;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.settingRow, pressed && styles.pressed]}>
      <View style={styles.settingText}>
        <Text style={styles.settingLabel}>{label}</Text>
        {detail ? <Text style={styles.settingDetail}>{detail}</Text> : null}
      </View>
      <SymbolView
        name={profileSymbols[icon]}
        size={Sizes.icon + Spacing.two}
        tintColor={AppColors.textSecondary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  informationRow: {
    minHeight: Sizes.navigationBar - Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    borderBottomWidth: BorderWidth.hairline,
    borderBottomColor: AppColors.borderStrong,
  },
  informationText: {
    flex: 1,
    gap: Spacing.one,
  },
  informationLabel: {
    ...Type.bodyStrong,
    color: AppColors.text,
  },
  informationValue: {
    ...Type.body,
    color: AppColors.textSecondary,
  },
  settingRow: {
    minHeight: Sizes.navigationBar - Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    borderBottomWidth: BorderWidth.hairline,
    borderBottomColor: AppColors.borderStrong,
  },
  settingText: {
    flex: 1,
    gap: Spacing.one,
  },
  settingLabel: {
    ...Type.bodyStrong,
    color: AppColors.text,
  },
  settingDetail: {
    ...Type.body,
    color: AppColors.textSecondary,
  },
  pressed: {
    opacity: 0.72,
  },
});

export function ProfileIcon({ name, color }: { name: ProfileSymbolKey; color?: string }) {
  return (
    <SymbolView
      name={profileSymbols[name]}
      size={Sizes.icon + Spacing.two}
      tintColor={color ?? AppColors.textSecondary}
    />
  );
}
