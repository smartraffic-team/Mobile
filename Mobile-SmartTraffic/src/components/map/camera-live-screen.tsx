import { SymbolView } from 'expo-symbols';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CameraStatusBadge } from '@/components/map/camera-status-badge';
import {
  AppColors,
  Layout,
  MaxAuthWidth,
  Radius,
  Sizes,
  Spacing,
  Type,
} from '@/constants/theme';
import { demoCameras } from '@/mocks/cameras';

const illustrativeDetections = [
  { icon: 'car.side', androidIcon: 'directions_car', label: 'Carros', count: 24 },
  { icon: 'motorcycle', androidIcon: 'two_wheeler', label: 'Motos', count: 7 },
  { icon: 'bus', androidIcon: 'directions_bus', label: 'Ônibus', count: 2 },
  { icon: 'truck.box', androidIcon: 'local_shipping', label: 'Caminhões', count: 3 },
] as const;

export function CameraLiveScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const camera = demoCameras.find((item) => item.id === id);

  if (!camera) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFound}>
          <Text style={styles.title}>Câmera não encontrada</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.backButton}>
            <Text style={styles.actionLabel}>Voltar ao mapa</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const isOffline = camera.status === 'offline';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Pressable
              accessibilityLabel="Voltar ao mapa"
              accessibilityRole="button"
              onPress={() => router.back()}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
              <SymbolView
                name={{ ios: 'arrow.left', android: 'arrow_back', web: 'arrow_back' }}
                size={Sizes.icon + Spacing.two}
                tintColor={AppColors.text}
              />
            </Pressable>
            <View style={styles.headerTitles}>
              <Text style={styles.title}>{camera.id}</Text>
              <Text numberOfLines={1} style={styles.subtitle}>
                {camera.address}
              </Text>
            </View>
            <CameraStatusBadge status={camera.status} />
          </View>

          <View
            accessibilityLabel="Prévia indisponível: demonstração sem transmissão"
            style={styles.video}>
            <View style={styles.videoIcon}>
              <SymbolView
                name={{
                  ios: isOffline ? 'video.slash' : 'video',
                  android: isOffline ? 'videocam_off' : 'videocam',
                  web: isOffline ? 'videocam_off' : 'videocam',
                }}
                size={Sizes.avatar}
                tintColor={AppColors.textSecondary}
              />
            </View>
            <Text style={styles.videoTitle}>
              {isOffline ? 'Câmera desconectada' : 'Prévia indisponível'}
            </Text>
            <Text style={styles.videoDescription}>
              {isOffline
                ? 'Esta câmera está marcada como offline nos dados ilustrativos.'
                : 'A transmissão de vídeo ficará disponível quando a API de câmeras for integrada.'}
            </Text>
            <View style={styles.demoBadge}>
              <SymbolView
                name={{ ios: 'info.circle', android: 'info', web: 'info' }}
                size={Sizes.icon - Spacing.two}
                tintColor={AppColors.textSecondary}
              />
              <Text style={styles.demoBadgeLabel}>Demonstração · sem transmissão real</Text>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Detecções ilustrativas</Text>
            <Text style={styles.sectionCaption}>Dados de exemplo · não representam tráfego real</Text>
          </View>

          <View style={styles.detectionGrid}>
            {illustrativeDetections.map((detection) => (
              <View key={detection.label} style={styles.detectionCard}>
                <SymbolView
                  name={{
                    ios: detection.icon,
                    android: detection.androidIcon,
                    web: detection.androidIcon,
                  }}
                  size={Sizes.icon + Spacing.two}
                  tintColor={AppColors.textSecondary}
                />
                <Text style={styles.detectionCount}>{detection.count}</Text>
                <Text style={styles.detectionLabel}>{detection.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.location}>
            <SymbolView
              name={{ ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' }}
              size={Sizes.icon}
              tintColor={AppColors.textSecondary}
            />
            <Text style={styles.locationLabel}>
              {camera.address} · {camera.neighborhood}, Registro, SP
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: Layout.screenMargin,
    paddingVertical: Spacing.three,
  },
  content: {
    width: '100%',
    maxWidth: MaxAuthWidth,
    flex: 1,
    gap: Spacing.four,
  },
  header: {
    minHeight: Sizes.avatar,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  backButton: {
    width: Sizes.avatar,
    height: Sizes.avatar,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.backgroundElement,
    borderRadius: Radius.md,
  },
  headerTitles: {
    flex: 1,
    gap: Spacing.one,
  },
  title: {
    ...Type.cameraTitle,
    color: AppColors.text,
  },
  subtitle: {
    ...Type.body,
    color: AppColors.textSecondary,
  },
  video: {
    minHeight: Sizes.cameraPreview + Sizes.avatar,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    backgroundColor: AppColors.backgroundElement,
    borderRadius: Radius.lg,
    padding: Spacing.four,
  },
  videoIcon: {
    width: Sizes.avatar + Spacing.five,
    height: Sizes.avatar + Spacing.five,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.xl,
    backgroundColor: AppColors.backgroundSelected,
  },
  videoTitle: {
    ...Type.heading,
    color: AppColors.text,
    textAlign: 'center',
  },
  videoDescription: {
    ...Type.body,
    color: AppColors.textSecondary,
    textAlign: 'center',
  },
  demoBadge: {
    minHeight: Sizes.minTouch,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.two,
    backgroundColor: AppColors.background,
  },
  demoBadgeLabel: {
    ...Type.caption,
    color: AppColors.textSecondary,
  },
  sectionHeader: {
    gap: Spacing.one,
  },
  sectionTitle: {
    ...Type.heading,
    color: AppColors.text,
  },
  sectionCaption: {
    ...Type.body,
    color: AppColors.textSecondary,
  },
  detectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  detectionCard: {
    flexBasis: '45%',
    flexGrow: 1,
    minHeight: Sizes.control + Sizes.minTouch,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    backgroundColor: AppColors.backgroundElement,
    borderRadius: Radius.lg,
    padding: Spacing.three,
  },
  detectionCount: {
    ...Type.display,
    color: AppColors.text,
  },
  detectionLabel: {
    ...Type.body,
    color: AppColors.textSecondary,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  locationLabel: {
    ...Type.body,
    flex: 1,
    color: AppColors.textSecondary,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.four,
    paddingHorizontal: Layout.screenMargin,
  },
  actionLabel: {
    ...Type.button,
    color: AppColors.primary,
  },
  pressed: {
    opacity: 0.75,
  },
});
