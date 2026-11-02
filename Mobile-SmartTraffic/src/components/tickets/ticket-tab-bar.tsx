import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { MapTabBar } from '@/components/map/map-tab-bar';
import type { MapTabKey } from '@/components/map/map-tab-bar';
import { AppColors, Layout, Radius, Spacing, Type } from '@/constants/theme';

export function TicketTabBar({
  bottomInset,
}: {
  bottomInset: number;
}) {
  const router = useRouter();
  const [notice, setNotice] = useState(false);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(false), 3000);
    return () => clearTimeout(timer);
  }, [notice]);

  function selectTab(tab: MapTabKey) {
    if (tab === 'map') {
      router.replace('/');
    } else if (tab === 'dashboard') {
      router.replace('/dashboard');
    } else if (tab === 'tickets') {
      router.replace('/tickets');
    } else {
      setNotice(true);
    }
  }

  return (
    <>
      <MapTabBar
        bottomInset={bottomInset}
        onSelectTab={selectTab}
        selectedTab="tickets"
      />
      {notice ? (
        <Animated.View
          accessibilityLiveRegion="polite"
          entering={FadeIn.duration(160)}
          exiting={FadeOut.duration(160)}
          style={[styles.notice, { bottom: bottomInset + Spacing.three }]}>
          <Text style={styles.noticeText}>Perfil estará disponível em uma próxima atualização.</Text>
        </Animated.View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  notice: {
    position: 'absolute',
    right: Layout.screenMargin,
    left: Layout.screenMargin,
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Radius.md,
    backgroundColor: AppColors.backgroundElement,
  },
  noticeText: {
    ...Type.body,
    color: AppColors.text,
  },
});
