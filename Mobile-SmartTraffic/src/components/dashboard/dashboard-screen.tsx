import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ScrollViewInstance,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { DashboardCard } from '@/components/dashboard/dashboard-card';
import {
  EdgePerformanceCard,
  FleetCompositionCard,
  ImpactCard,
  RecentAlertsCard,
  RoadDensityCard,
  TrafficLightsCard,
  VehicleFlowCard,
} from '@/components/dashboard/dashboard-report-cards';
import { DashboardPeriodSelector } from '@/components/dashboard/dashboard-period-selector';
import { DashboardStatePanel } from '@/components/dashboard/dashboard-state-panel';
import { MapTabBar } from '@/components/map/map-tab-bar';
import {
  AppColors,
  BorderWidth,
  Layout,
  MaxContentWidth,
  Radius,
  Sizes,
  Spacing,
  Type,
} from '@/constants/theme';
import { dashboardDataSource } from '@/services/dashboard';
import { exportDashboardReport } from '@/services/dashboard-export-platform';
import type {
  DashboardExportFormat,
} from '@/services/dashboard-export';
import type { DashboardPeriod, DashboardReport } from '@/services/contracts/dashboard';

type DashboardState =
  | { status: 'loading' }
  | { status: 'ready'; report: DashboardReport }
  | { status: 'empty' }
  | { status: 'error'; message: string };
type DashboardResolvedState = Exclude<DashboardState, { status: 'loading' }>;

type DashboardTab = 'map' | 'tickets' | 'dashboard' | 'profile';

const periodLabels: Record<DashboardPeriod, string> = {
  today: 'Hoje',
  '7days': '7 dias',
  '30days': '30 dias',
};

const dashboardMetrics = [
  'camerasOnline',
  'vehicles',
  'averageWait',
  'openTickets',
] as const;

export function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const [period, setPeriod] = useState<DashboardPeriod>('today');
  const [retryCount, setRetryCount] = useState(0);
  const requestKey = `${period}:${retryCount}`;
  const [loadedState, setLoadedState] = useState<{
    requestKey: string;
    state: DashboardResolvedState;
  } | null>(null);
  const state = useMemo<DashboardState>(
    () =>
      loadedState?.requestKey === requestKey
        ? loadedState.state
        : { status: 'loading' },
    [loadedState, requestKey],
  );
  const [isExportMenuVisible, setIsExportMenuVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [operationsOffset, setOperationsOffset] = useState(0);
  const bottomInset = insets.bottom + Sizes.navigationBar;

  useEffect(() => {
    let active = true;

    dashboardDataSource
      .getReport(period)
      .then((report) => {
        if (!active) return;
        setLoadedState({
          requestKey,
          state: report ? { status: 'ready', report } : { status: 'empty' },
        });
      })
      .catch((error: unknown) => {
        if (!active) return;
        setLoadedState({
          requestKey,
          state: {
            status: 'error',
            message:
              error instanceof Error
                ? error.message
                : 'Não foi possível consultar os dados da operação.',
          },
        });
      });

    return () => {
      active = false;
    };
  }, [period, requestKey]);

  useEffect(() => {
    if (!toastMessage) return undefined;
    const timer = setTimeout(() => setToastMessage(null), 3200);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const changePeriod = useCallback((nextPeriod: DashboardPeriod) => {
    setPeriod(nextPeriod);
  }, []);

  const handleTabSelection = useCallback(
    (tab: DashboardTab) => {
      if (tab === 'map') {
        router.push('/');
        return;
      }

      if (tab === 'tickets') {
        router.push('/tickets');
        return;
      }

      if (tab !== 'dashboard') {
        router.push('/profile');
      }
    },
    [router],
  );

  const handleExport = useCallback(
    async (format: DashboardExportFormat) => {
      setIsExportMenuVisible(false);
      if (state.status !== 'ready') {
        setToastMessage('Não há dados disponíveis para exportar neste período.');
        return;
      }

      try {
        await exportDashboardReport(state.report, format);
        if (format === 'csv') setToastMessage('Relatório CSV preparado para compartilhamento.');
      } catch (error: unknown) {
        setToastMessage(
          error instanceof Error
            ? error.message
            : 'Não foi possível exportar o relatório. Tente novamente.',
        );
      }
    },
    [state],
  );

  const scrollToOperations = useCallback(() => {
    scrollRef.current?.scrollTo({ y: operationsOffset, animated: true });
  }, [operationsOffset]);

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomInset + Spacing.four },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerTitles}>
              <Text style={styles.brand}>SmartTraffic</Text>
              <Text accessibilityRole="header" style={styles.pageTitle}>
                Dashboard
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Exportar relatório em PDF ou CSV"
              accessibilityRole="button"
              onPress={() => setIsExportMenuVisible(true)}
              style={({ pressed }) => [styles.exportIcon, pressed && styles.pressed]}>
              <SymbolView
                name={{
                  ios: 'square.and.arrow.down',
                  android: 'download',
                  web: 'download',
                }}
                size={Sizes.avatar - Spacing.two}
                tintColor={AppColors.text}
              />
            </Pressable>
          </View>

          <View style={styles.periodRow}>
            <DashboardPeriodSelector value={period} onChange={changePeriod} />
            <Pressable
              accessibilityRole="button"
              onPress={() => setIsExportMenuVisible(true)}
              style={({ pressed }) => [styles.exportLink, pressed && styles.pressed]}>
              <Text style={styles.exportLabel}>PDF / CSV</Text>
            </Pressable>
          </View>

          <Text style={styles.updatedAt}>
            {state.status === 'ready'
              ? `${state.report.updatedAt} · Dados de exemplo`
              : `Período: ${periodLabels[period]} · Dados demonstrativos`}
          </Text>

          {state.status === 'loading' ? (
            <Animated.View
              accessibilityLiveRegion="polite"
              entering={FadeIn.duration(180)}
              style={styles.loading}>
              <ActivityIndicator color={AppColors.primary} size="large" />
              <Text style={styles.loadingLabel}>Carregando indicadores</Text>
            </Animated.View>
          ) : state.status === 'error' || state.status === 'empty' ? (
            <View style={styles.statePanel}>
              {state.status === 'error' && state.message ? (
                <Text accessibilityLiveRegion="polite" style={styles.errorDetail}>
                  {state.message}
                </Text>
              ) : null}
              <DashboardStatePanel
                kind={state.status}
                onRetry={() => setRetryCount((count) => count + 1)}
                onChoosePeriod={() => changePeriod('today')}
              />
            </View>
          ) : (
            <Animated.View
              key={`${period}-${retryCount}`}
              entering={FadeIn.duration(260)}
              style={styles.report}>
              <View style={styles.metricsGrid}>
                {dashboardMetrics.map((key, index) => {
                  const metric = state.report.metrics[key];
                  return (
                    <Animated.View
                      key={key}
                      entering={FadeInDown.duration(230).delay(index * 45)}
                      style={styles.metricCard}>
                      <Text style={styles.metricLabel}>{metric.label}</Text>
                      <Text style={styles.metricValue}>{metric.value}</Text>
                      <Text style={styles.metricDetail}>{metric.detail}</Text>
                    </Animated.View>
                  );
                })}
              </View>

              <VehicleFlowCard report={state.report} />

              <Pressable
                accessibilityRole="button"
                onPress={scrollToOperations}
                style={({ pressed }) => [styles.scrollHint, pressed && styles.pressed]}>
                <Text style={styles.scrollHintLabel}>Vias, frota e operação abaixo</Text>
                <SymbolView
                  name={{ ios: 'arrow.down', android: 'arrow_downward', web: 'arrow_downward' }}
                  size={Sizes.icon + Spacing.one}
                  tintColor={AppColors.primary}
                />
              </Pressable>

              <View onLayout={(event) => setOperationsOffset(event.nativeEvent.layout.y)}>
                <RoadDensityCard roads={state.report.roads} />
              </View>
              <FleetCompositionCard report={state.report} />
              <EdgePerformanceCard report={state.report} />
              <TrafficLightsCard report={state.report} />
              <ImpactCard report={state.report} />
              <RecentAlertsCard alerts={state.report.alerts} />

              <DashboardCard title="Resumo do período">
                <Text style={styles.demonstrationNote}>
                  Estes indicadores e gráficos usam dados ilustrativos. A integração da API
                  substituirá esta fonte demonstrativa sem alterar a apresentação dos dados.
                </Text>
              </DashboardCard>
            </Animated.View>
          )}
        </View>
      </ScrollView>

      <MapTabBar
        bottomInset={insets.bottom}
        onSelectTab={handleTabSelection}
        selectedTab="dashboard"
      />

      {toastMessage ? (
        <Animated.View
          accessibilityLiveRegion="polite"
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(180)}
          style={[styles.toast, { bottom: bottomInset + Spacing.three }]}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      ) : null}

      <Modal
        animationType="fade"
        onRequestClose={() => setIsExportMenuVisible(false)}
        transparent
        visible={isExportMenuVisible}>
        <View style={styles.modal}>
          <Pressable
            accessibilityLabel="Fechar opções de exportação"
            accessibilityRole="button"
            onPress={() => setIsExportMenuVisible(false)}
            style={styles.backdrop}
          />
          <Animated.View entering={FadeInDown.duration(220)} style={styles.exportSheet}>
            <View style={styles.sheetHandle} />
            <Text accessibilityRole="header" style={styles.sheetTitle}>
              Exportar relatório
            </Text>
            <Text style={styles.sheetDescription}>
              {state.status === 'ready'
                ? 'Os dados deste período são demonstrativos.'
                : 'Não há dados consolidados para exportar neste período.'}
            </Text>
            <ExportOption
              icon="doc.text"
              androidIcon="description"
              label="Compartilhar arquivo CSV"
              onPress={() => void handleExport('csv')}
            />
            <ExportOption
              icon="doc.richtext"
              androidIcon="picture_as_pdf"
              label="Imprimir ou salvar em PDF"
              onPress={() => void handleExport('pdf')}
            />
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function ExportOption({
  icon,
  androidIcon,
  label,
  onPress,
}: {
  icon: 'doc.text' | 'doc.richtext';
  androidIcon: 'description' | 'picture_as_pdf';
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.exportOption, pressed && styles.pressed]}>
      <SymbolView
        name={{ ios: icon, android: androidIcon, web: androidIcon }}
        size={Sizes.icon + Spacing.two}
        tintColor={AppColors.primary}
      />
      <Text style={styles.exportOptionLabel}>{label}</Text>
      <SymbolView
        name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
        size={Sizes.icon}
        tintColor={AppColors.textSecondary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: Layout.screenMargin,
    paddingTop: Spacing.three,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
  },
  header: {
    minHeight: Sizes.avatar + Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  headerTitles: {
    flex: 1,
    gap: Spacing.one,
  },
  brand: {
    ...Type.brandSmall,
    color: AppColors.primary,
  },
  pageTitle: {
    ...Type.cameraTitle,
    color: AppColors.text,
  },
  exportIcon: {
    width: Sizes.avatar + Spacing.two,
    height: Sizes.avatar + Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.lg,
    backgroundColor: AppColors.backgroundElement,
  },
  periodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  exportLink: {
    minHeight: Sizes.minTouch,
    justifyContent: 'center',
    paddingHorizontal: Spacing.two,
  },
  exportLabel: {
    ...Type.bodyStrong,
    color: AppColors.primary,
  },
  updatedAt: {
    ...Type.body,
    color: AppColors.textSecondary,
  },
  report: {
    gap: Spacing.three,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  metricCard: {
    flexBasis: '45%',
    flexGrow: 1,
    minHeight: Sizes.cameraPreview,
    justifyContent: 'space-between',
    gap: Spacing.two,
    borderWidth: BorderWidth.hairline,
    borderColor: AppColors.borderStrong,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    backgroundColor: AppColors.backgroundElement,
  },
  metricLabel: {
    ...Type.body,
    color: AppColors.textSecondary,
  },
  metricValue: {
    ...Type.display,
    color: AppColors.text,
  },
  metricDetail: {
    ...Type.body,
    color: AppColors.primary,
  },
  scrollHint: {
    minHeight: Sizes.minTouch,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  scrollHintLabel: {
    ...Type.body,
    flex: 1,
    color: AppColors.textSecondary,
  },
  statePanel: {
    flex: 1,
    minHeight: 420,
  },
  errorDetail: {
    ...Type.caption,
    color: AppColors.error,
    textAlign: 'center',
  },
  loading: {
    flex: 1,
    minHeight: 360,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  loadingLabel: {
    ...Type.body,
    color: AppColors.textSecondary,
  },
  demonstrationNote: {
    ...Type.body,
    color: AppColors.textSecondary,
  },
  toast: {
    position: 'absolute',
    left: Layout.screenMargin,
    right: Layout.screenMargin,
    zIndex: 12,
    alignItems: 'center',
  },
  toastText: {
    ...Type.bodyStrong,
    maxWidth: MaxContentWidth,
    color: AppColors.text,
    backgroundColor: AppColors.backgroundElement,
    borderColor: AppColors.borderStrong,
    borderWidth: BorderWidth.hairline,
    borderRadius: Radius.md,
    padding: Spacing.three,
    textAlign: 'center',
  },
  modal: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: AppColors.overlay,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  exportSheet: {
    zIndex: 2,
    alignItems: 'center',
    gap: Spacing.three,
    borderTopWidth: BorderWidth.hairline,
    borderTopColor: AppColors.borderStrong,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Layout.screenMargin,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.five,
    backgroundColor: AppColors.background,
  },
  sheetHandle: {
    width: Sizes.avatar,
    height: BorderWidth.focus + Spacing.one,
    borderRadius: Radius.full,
    backgroundColor: AppColors.borderStrong,
  },
  sheetTitle: {
    ...Type.cameraTitle,
    alignSelf: 'flex-start',
    color: AppColors.text,
  },
  sheetDescription: {
    ...Type.body,
    alignSelf: 'flex-start',
    color: AppColors.textSecondary,
  },
  exportOption: {
    width: '100%',
    minHeight: Sizes.control + Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderWidth: BorderWidth.hairline,
    borderColor: AppColors.border,
    borderRadius: Radius.md,
    backgroundColor: AppColors.backgroundElement,
  },
  exportOptionLabel: {
    ...Type.bodyStrong,
    flex: 1,
    color: AppColors.text,
  },
  pressed: {
    opacity: 0.75,
  },
});
