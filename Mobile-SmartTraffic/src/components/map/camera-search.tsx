import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { CameraStatusBadge } from '@/components/map/camera-status-badge';
import {
  AppColors,
  BorderWidth,
  MaxAuthWidth,
  Radius,
  Sizes,
  Spacing,
  Type,
} from '@/constants/theme';
import type { Camera } from '@/services/contracts/cameras';

type CameraSearchProps = {
  query: string;
  results: Camera[];
  onChangeQuery: (value: string) => void;
  onSelectCamera: (camera: Camera) => void;
};

function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim();
}

export function CameraSearch({
  query,
  results,
  onChangeQuery,
  onSelectCamera,
}: CameraSearchProps) {
  const [isFocused, setIsFocused] = useState(false);
  const borderColor = useSharedValue<string>(AppColors.borderStrong);
  const borderWidth = useSharedValue<number>(BorderWidth.hairline);
  const searchTerm = normalizeSearch(query);
  const hasResults = searchTerm.length > 0;
  const displayedResults = results.filter((camera) =>
    normalizeSearch(`${camera.id} ${camera.address} ${camera.neighborhood}`).includes(searchTerm),
  );

  useEffect(() => {
    borderColor.value = withTiming(
      isFocused ? AppColors.primary : AppColors.borderStrong,
      { duration: 180 },
    );
    borderWidth.value = withTiming(
      isFocused ? BorderWidth.focus : BorderWidth.hairline,
      { duration: 180 },
    );
  }, [borderColor, borderWidth, isFocused]);

  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: borderColor.value,
    borderWidth: borderWidth.value,
  }));

  return (
    <View style={styles.wrapper}>
      <Animated.View layout={LinearTransition.duration(180)} style={[styles.searchBox, animatedBorderStyle]}>
        <SymbolView
          name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
          size={Sizes.icon}
          tintColor={isFocused ? AppColors.primary : AppColors.textSecondary}
        />
        <TextInput
          accessibilityLabel="Buscar câmera por identificação ou endereço"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          placeholder="Buscar câmera por ID ou endereço"
          placeholderTextColor={AppColors.textSecondary}
          selectionColor={AppColors.primary}
          style={styles.input}
          value={query}
          onBlur={() => setIsFocused(false)}
          onChangeText={onChangeQuery}
          onFocus={() => setIsFocused(true)}
        />
        {query.length > 0 ? (
          <Pressable
            accessibilityLabel="Limpar busca"
            accessibilityRole="button"
            hitSlop={Spacing.two}
            onPress={() => onChangeQuery('')}
            style={styles.clearButton}>
            <SymbolView
              name={{ ios: 'xmark', android: 'close', web: 'close' }}
              size={Sizes.icon}
              tintColor={AppColors.textSecondary}
            />
          </Pressable>
        ) : null}
      </Animated.View>

      {hasResults ? (
        <Animated.View
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(140)}
          layout={LinearTransition.duration(180)}
          style={styles.resultsPanel}>
          {displayedResults.length > 0 ? (
            <>
              {displayedResults.map((camera) => (
                <Pressable
                  accessibilityLabel={`${camera.id}, ${camera.address}, selecionar câmera`}
                  accessibilityRole="button"
                  key={camera.id}
                  onPress={() => onSelectCamera(camera)}
                  style={({ pressed }) => [styles.resultRow, pressed && styles.pressed]}>
                  <View style={styles.resultText}>
                    <Text style={styles.resultId}>{camera.id}</Text>
                    <Text style={styles.resultAddress}>
                      {camera.address} · {camera.neighborhood}
                    </Text>
                  </View>
                  <CameraStatusBadge status={camera.status} />
                </Pressable>
              ))}
              <Text style={styles.resultCaption}>Locais e posições demonstrativos.</Text>
            </>
          ) : (
            <View style={styles.emptySearch}>
              <SymbolView
                name={{ ios: 'magnifyingglass', android: 'search_off', web: 'search_off' }}
                size={Sizes.avatar}
                tintColor={AppColors.primary}
              />
              <Text accessibilityRole="header" style={styles.emptyTitle}>
                Nenhum resultado
              </Text>
              <Text style={styles.emptyDescription}>
                Não encontramos câmeras para “{query.trim()}”. Confira o ID ou tente outro endereço.
              </Text>
              <Text style={styles.emptyCaption}>Rede demonstrativa · câmeras de CAM-0001 a CAM-0048</Text>
            </View>
          )}
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: Spacing.two,
  },
  searchBox: {
    width: '100%',
    minHeight: Sizes.control + Spacing.two,
    maxWidth: MaxAuthWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    backgroundColor: AppColors.backgroundElement,
    borderRadius: Radius.md,
  },
  input: {
    ...Type.body,
    flex: 1,
    minWidth: 0,
    minHeight: Sizes.minTouch,
    color: AppColors.text,
  },
  clearButton: {
    width: Sizes.minTouch,
    height: Sizes.minTouch,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -Spacing.two,
  },
  resultsPanel: {
    width: '100%',
    maxWidth: MaxAuthWidth,
    backgroundColor: AppColors.background,
    borderWidth: BorderWidth.hairline,
    borderColor: AppColors.borderStrong,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.three,
  },
  resultRow: {
    minHeight: Sizes.control + Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    borderBottomWidth: BorderWidth.hairline,
    borderBottomColor: AppColors.border,
  },
  resultText: {
    flex: 1,
    gap: Spacing.one,
  },
  resultId: {
    ...Type.bodyStrong,
    color: AppColors.text,
  },
  resultAddress: {
    ...Type.body,
    color: AppColors.textSecondary,
  },
  resultCaption: {
    ...Type.caption,
    color: AppColors.textSecondary,
    paddingVertical: Spacing.two,
  },
  emptySearch: {
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.four,
  },
  emptyTitle: {
    ...Type.cameraTitle,
    color: AppColors.text,
    textAlign: 'center',
  },
  emptyDescription: {
    ...Type.body,
    color: AppColors.textSecondary,
    textAlign: 'center',
  },
  emptyCaption: {
    ...Type.caption,
    color: AppColors.textSecondary,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
});
