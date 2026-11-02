import { useRouter } from 'expo-router';
import { MapTabBar } from '@/components/map/map-tab-bar';
import type { MapTabKey } from '@/components/map/map-tab-bar';

export function ProfileTabBar({ bottomInset }: { bottomInset: number }) {
  const router = useRouter();

  function selectTab(tab: MapTabKey) {
    if (tab === 'map') {
      router.replace('/');
    } else if (tab === 'dashboard') {
      router.replace('/dashboard');
    } else if (tab === 'tickets') {
      router.replace('/tickets');
    }
  }

  return <MapTabBar bottomInset={bottomInset} onSelectTab={selectTab} selectedTab="profile" />;
}
