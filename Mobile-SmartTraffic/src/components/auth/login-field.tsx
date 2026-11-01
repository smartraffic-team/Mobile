import { forwardRef, useEffect, useState, type ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputInstance,
  type TextInputProps,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { AppColors, BorderWidth, Radius, Sizes, Spacing, Type } from '@/constants/theme';

type LoginFieldProps = Omit<TextInputProps, 'children'> & {
  error?: string;
  label: string;
  trailing?: ReactNode;
};

export const LoginField = forwardRef<TextInputInstance, LoginFieldProps>(function LoginField(
  { error, label, trailing, ...inputProps },
  ref,
) {
  const [isFocused, setIsFocused] = useState(false);
  const borderColor = useSharedValue<string>(AppColors.borderStrong);
  const borderWidth = useSharedValue<number>(BorderWidth.hairline);

  useEffect(() => {
    borderColor.value = withTiming(
      error ? AppColors.error : isFocused ? AppColors.primary : AppColors.borderStrong,
      { duration: 180 },
    );
    borderWidth.value = withTiming(
      error || isFocused ? BorderWidth.focus : BorderWidth.hairline,
      { duration: 180 },
    );
  }, [borderColor, borderWidth, error, isFocused]);

  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: borderColor.value,
    borderWidth: borderWidth.value,
  }));

  return (
    <Animated.View layout={LinearTransition.duration(180)} style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Animated.View style={[styles.inputContainer, animatedBorderStyle]}>
        <TextInput
          accessibilityLabel={label}
          accessibilityHint={error}
          placeholderTextColor={AppColors.textMuted}
          ref={ref}
          selectionColor={AppColors.primary}
          style={styles.input}
          onBlur={() => setIsFocused(false)}
          onFocus={() => setIsFocused(true)}
          {...inputProps}
        />
        {trailing}
      </Animated.View>
      {error ? (
        <Animated.View
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(180)}
          layout={LinearTransition.duration(180)}>
          <Text accessibilityLiveRegion="polite" style={styles.error}>
            {error}
          </Text>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
});

export function LoginFieldAction({
  accessibilityLabel,
  children,
  onPress,
}: {
  accessibilityLabel: string;
  children: ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={Spacing.two}
      onPress={onPress}
      style={styles.trailingAction}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing.two,
  },
  label: {
    ...Type.loginLabel,
    color: AppColors.text,
  },
  inputContainer: {
    minHeight: Sizes.control,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    backgroundColor: AppColors.backgroundElement,
    borderRadius: Radius.md,
  },
  input: {
    ...Type.input,
    flex: 1,
    minWidth: 0,
    color: AppColors.text,
    paddingVertical: Spacing.two,
  },
  trailingAction: {
    width: Sizes.minTouch,
    height: Sizes.minTouch,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -Spacing.two,
  },
  error: {
    ...Type.body,
    color: AppColors.error,
  },
});
