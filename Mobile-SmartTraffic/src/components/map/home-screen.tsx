import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { CameraFilters } from '@/components/map/camera-filters';
import { CameraDetailSheet } from '@/components/map/camera-detail-sheet';
import { CameraNetworkSummaryCard } from '@/components/map/camera-network-summary';
import { CameraSearch } from '@/components/map/camera-search';
import { LeafletMap } from '@/components/map/leaflet-map';
import type { LeafletMapHandle, LeafletMapCommand } from '@/components/map/leaflet-map.types';
import { MapControls } from '@/components/map/map-controls';
import { MapStatusOverlay } from '@/components/map/map-status-overlay';
import { MapTabBar } from '@/components/map/map-tab-bar';
import {
  AppColors,
  Layout,
  MapCenter,
  MaxAuthWidth,
  Radius,
  Sizes,
  Spacing,
  Type,
} from '@/constants/theme';
import { demoCameraNetwork, demoCameras } from '@/mocks/cameras';
import type { Camera, CameraStatus } from '@/services/contracts/cameras';
import type { MapInteraction } from '@/components/map/leaflet-document';

type MapLoadState = 'loading' | 'ready' | 'error';

const allCameraStatuses: CameraStatus[] = ['online', 'offline', 'maintenance'];

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const mapRef = useRef<LeafletMapHandle>(null);
  const [mapLoadState, setMapLoadState] = useState<MapLoadState>('loading');
  const [mapError, setMapError] = useState('');
  const [mapGeneration, setMapGeneration] = useState(0);
  const [query, setQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<CameraStatus[]>(allCameraStatuses);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>('CAM-0012');
  const [openCamera, setOpenCamera] = useState<Camera | null>(null);
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const visibleCameras = useMemo(
    () => demoCameras.filter((camera) => selectedStatuses.includes(camera.status)),
    [selectedStatuses],
  );
  const bottomNavInset = insets.bottom + Sizes.navigationBar;

  useEffect(() => {
    if (!toastMessage) return undefined;

    const timer = setTimeout(() => setToastMessage(null), 3200);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const handleMapError = useCallback((message: string) => {
    setMapError(message);
    setMapLoadState('error');
  }, []);

  const handleMapReady = useCallback(() => {
    setMapError('');
    setMapLoadState('ready');
  }, []);

  const sendMapCommand = useCallback((command: LeafletMapCommand) => {
    mapRef.current?.sendCommand(command);
  }, []);

  const selectCamera = useCallback(
    (camera: Camera) => {
      setSelectedCameraId(camera.id);
      setOpenCamera(camera);
      setQuery('');
      sendMapCommand({ type: 'focus-camera', cameraId: camera.id });
    },
    [sendMapCommand],
  );

  const handleMapInteraction = useCallback(
    (interaction: MapInteraction) => {
      if (interaction.type !== 'camera-selected') return;

      const camera = demoCameras.find((item) => item.id === interaction.cameraId);
      if (!camera) {
        setToastMessage('Esta câmera não está disponível na rede demonstrativa.');
        return;
      }

      setSelectedCameraId(camera.id);
      setOpenCamera(camera);
      setQuery('');
    },
    [],
  );

  const retryMap = useCallback(() => {
    setMapLoadState('loading');
    setMapError('');
    setMapGeneration((generation) => generation + 1);
  }, []);

  function toggleCameraStatus(status: CameraStatus) {
    setSelectedStatuses((current) =>
      current.includes(status) ? current.filter((value) => value !== status) : [...current, status],
    );
  }

  function handleTabSelection(tab: string) {
    if (tab !== 'map') {
      const tabNames: Record<string, string> = {
        tickets: 'Chamados',
        dashboard: 'Dashboard',
        profile: 'Perfil',
      };
      setToastMessage(`${tabNames[tab] ?? tab} estará disponível em uma próxima atualização.`);
    }
  }

  const topControls = insets.top + Sizes.control * 4 + Spacing.five;
  const bottomControls = bottomNavInset + Spacing.two;

  return (
    <SafeAreaView edges={[]} style={styles.screen}>
      <LeafletMap
        ref={mapRef}
        key={mapGeneration}
        cameras={visibleCameras}
        selectedCameraId={selectedCameraId}
        onInteraction={handleMapInteraction}
        onLoadError={handleMapError}
        onReady={handleMapReady}
      />

      <View style={[styles.header, { top: insets.top + Spacing.two }]}>
        <View style={styles.headerContent}>
          <View style={styles.headingRow}>
            <View style={styles.brandAndCity}>
              <Text style={styles.brand}>SmartTraffic</Text>
              <Text accessibilityRole="header" style={styles.city}>
                Registro · SP
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Notificações"
              accessibilityRole="button"
              onPress={() =>
                setToastMessage('As notificações estarão disponíveis após a integração com a API.')
              }
              style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}>
              <SymbolView
                name={{ ios: 'bell', android: 'notifications', web: 'notifications' }}
                size={Sizes.icon + Spacing.two}
                tintColor={AppColors.text}
              />
            </Pressable>
          </View>
          <CameraSearch
            query={query}
            results={visibleCameras}
            onChangeQuery={setQuery}
            onSelectCamera={selectCamera}
          />
        </View>
      </View>

      <View pointerEvents="box-none" style={[styles.controls, { top: topControls }]}>
        <MapControls
          onZoomIn={() => sendMapCommand({ type: 'zoom-in' })}
          onZoomOut={() => sendMapCommand({ type: 'zoom-out' })}
          onLocate={() => {
            sendMapCommand({ type: 'recenter' });
            setToastMessage(`Mapa centralizado em Registro · ${MapCenter.latitude.toFixed(2)}°`);
          }}
          onFilters={() => setIsFiltersVisible(true)}
        />
      </View>

      <View
        pointerEvents="box-none"
        style={[styles.summary, { bottom: bottomControls }]}>
        <View style={styles.summaryContent}>
        <CameraNetworkSummaryCard summary={demoCameraNetwork} />
        </View>
      </View>

      {mapLoadState !== 'ready' ? (
        <MapStatusOverlay
          state={mapLoadState}
          message={mapError}
          onRetry={retryMap}
          top={insets.top + Sizes.control * 4 + Spacing.four}
          bottom={bottomControls + Spacing.three}
        />
      ) : null}

      {toastMessage ? (
        <Animated.View
          accessibilityLiveRegion="polite"
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(180)}
          layout={LinearTransition.duration(180)}
          style={[styles.toast, { bottom: bottomControls + Sizes.cameraPreview + Spacing.four }]}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      ) : null}

      {openCamera ? (
        <CameraDetailSheet
          camera={openCamera}
          bottomInset={bottomNavInset}
          onClose={() => {
            setOpenCamera(null);
            sendMapCommand({ type: 'select-camera', cameraId: selectedCameraId });
          }}
          onViewLive={() =>
            router.push({ pathname: '/camera/[id]', params: { id: openCamera.id } })
          }
        />
      ) : null}

      <MapTabBar bottomInset={insets.bottom} onSelectTab={handleTabSelection} />

      <CameraFilters
        visible={isFiltersVisible}
        selectedStatuses={selectedStatuses}
        onToggle={toggleCameraStatus}
        onClose={() => setIsFiltersVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 5,
    alignItems: 'center',
    paddingHorizontal: Layout.screenMargin,
  },
  headerContent: {
    width: '100%',
    maxWidth: MaxAuthWidth,
    gap: Spacing.three,
  },
  headingRow: {
    minHeight: Sizes.avatar,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  brandAndCity: {
    flex: 1,
    gap: Spacing.two,
  },
  brand: {
    ...Type.brandSmall,
    color: AppColors.primary,
  },
  city: {
    ...Type.cameraTitle,
    color: AppColors.text,
  },
  headerButton: {
    width: Sizes.avatar,
    height: Sizes.avatar,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.backgroundElement,
    borderRadius: Radius.md,
  },
  controls: {
    position: 'absolute',
    right: Layout.screenMargin,
    zIndex: 3,
  },
  summary: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 3,
    alignItems: 'center',
    paddingHorizontal: Layout.screenMargin,
  },
  summaryContent: {
    width: '100%',
    maxWidth: MaxAuthWidth,
    gap: Spacing.two,
  },
  toast: {
    position: 'absolute',
    left: Layout.screenMargin,
    right: Layout.screenMargin,
    zIndex: 7,
    alignItems: 'center',
  },
  toastText: {
    ...Type.bodyStrong,
    maxWidth: MaxAuthWidth,
    color: AppColors.text,
    backgroundColor: AppColors.background,
    borderColor: AppColors.borderStrong,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.three,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
});
