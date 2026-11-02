import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';

import { TicketCard, TicketStatePanel } from '@/components/tickets/ticket-ui';
import { TicketTabBar } from '@/components/tickets/ticket-tab-bar';
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
import { ticketDataSource } from '@/services/tickets';
import type { Ticket, TicketFilters, TicketPriority, TicketSummary } from '@/services/contracts/tickets';

type StatusFilter = 'all' | 'open' | 'inProgress' | 'done';
type TicketListData = {
  key: string;
  tickets: Ticket[];
  summary: TicketSummary;
  error?: string;
};

const statusFilters: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'open', label: 'Abertos' },
  { key: 'inProgress', label: 'Em andamento' },
  { key: 'done', label: 'Concluídos' },
];

const priorityOptions: { key: TicketPriority | null; label: string }[] = [
  { key: null, label: 'Todas as prioridades' },
  { key: 'low', label: 'Baixa' },
  { key: 'medium', label: 'Média' },
  { key: 'high', label: 'Alta' },
  { key: 'critical', label: 'Crítica' },
];

const priorityNames: Record<TicketPriority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  critical: 'Crítica',
};

export function TicketScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | null>(null);
  const [isPriorityPickerVisible, setPriorityPickerVisible] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [loadedData, setLoadedData] = useState<TicketListData | null>(null);
  const filters = useMemo<TicketFilters>(
    () => ({
      ...(statusFilter === 'all' ? {} : { status: statusFilter }),
      ...(priorityFilter ? { priority: priorityFilter } : {}),
    }),
    [priorityFilter, statusFilter],
  );
  const filterKey = `${statusFilter}:${priorityFilter ?? 'all'}:${reloadToken}`;
  const data = loadedData?.key === filterKey ? loadedData : null;

  useFocusEffect(
    useCallback(() => {
      let active = true;
      Promise.all([
        ticketDataSource.getTickets(filters),
        ticketDataSource.getTicketSummary(),
      ])
        .then(([tickets, summary]) => {
          if (active) setLoadedData({ key: filterKey, tickets, summary });
        })
        .catch((error: unknown) => {
          if (!active) return;
          setLoadedData({
            key: filterKey,
            tickets: [],
            summary: { open: 0, inProgress: 0, done: 0 },
            error:
              error instanceof Error
                ? error.message
                : 'A lista de chamados está temporariamente indisponível.',
          });
        });
      return () => {
        active = false;
      };
    }, [filterKey, filters]),
  );

  const clearFilters = useCallback(() => {
    setStatusFilter('all');
    setPriorityFilter(null);
  }, []);

  const bottomInset = insets.bottom + Sizes.navigationBar;
  const hasFilters = statusFilter !== 'all' || priorityFilter !== null;

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomInset + Spacing.four }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.heading}>
            <Text style={styles.brand}>SmartTraffic</Text>
            <Text accessibilityRole="header" style={styles.title}>Chamados</Text>
          </View>

          <View accessibilityLabel="Resumo dos chamados demonstrativos" style={styles.summary}>
            <SummaryItem count={data?.summary.open ?? 5} label="abertos" />
            <SummaryItem count={data?.summary.inProgress ?? 3} label="em andamento" />
            <SummaryItem count={data?.summary.done ?? 12} label="concluídos" />
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/tickets/new')}
            style={({ pressed }) => [styles.newTicketButton, pressed && styles.pressed]}>
            <Text style={styles.newTicketText}>＋  Novo chamado</Text>
          </Pressable>

          <View style={styles.filters}>
            {statusFilters.map((filter) => (
              <FilterChip
                key={filter.key}
                label={filter.label}
                selected={statusFilter === filter.key}
                onPress={() => setStatusFilter(filter.key)}
              />
            ))}
            <FilterChip
              label={
                priorityFilter
                  ? `${priorityNames[priorityFilter]} ×`
                  : 'Prioridade⌄'
              }
              selected={priorityFilter !== null}
              onPress={() => setPriorityPickerVisible(true)}
            />
          </View>

          {!data ? (
            <Animated.View entering={FadeIn.duration(180)} style={styles.loading}>
              <ActivityIndicator color={AppColors.primary} size="large" />
              <Text style={styles.loadingText}>Carregando chamados...</Text>
              <SkeletonCard />
              <SkeletonCard />
            </Animated.View>
          ) : data.error ? (
            <TicketStatePanel
              kind="error"
              message={`${data.error} Última sincronização às 14:28.`}
              onRetry={() => setReloadToken((token) => token + 1)}
            />
          ) : data.tickets.length === 0 ? (
            <TicketStatePanel
              kind="empty"
              hasFilters={hasFilters}
              onClearFilters={clearFilters}
              onCreate={() => router.push('/tickets/new')}
            />
          ) : (
            <Animated.View entering={FadeIn.duration(220)} style={styles.ticketList}>
              {data.tickets.map((ticket, index) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  index={index}
                  onPress={() =>
                    router.push({ pathname: '/tickets/[id]', params: { id: ticket.id } })
                  }
                />
              ))}
            </Animated.View>
          )}

          <Text style={styles.demoNote}>Dados demonstrativos · API de chamados não conectada</Text>
        </View>
      </ScrollView>

      <TicketTabBar bottomInset={insets.bottom} />

      <Modal
        animationType="fade"
        onRequestClose={() => setPriorityPickerVisible(false)}
        transparent
        visible={isPriorityPickerVisible}>
        <View style={styles.modal}>
          <Pressable
            accessibilityLabel="Fechar filtro de prioridade"
            accessibilityRole="button"
            onPress={() => setPriorityPickerVisible(false)}
            style={styles.backdrop}
          />
          <Animated.View entering={FadeIn.duration(200)} style={styles.prioritySheet}>
            <View style={styles.sheetHandle} />
            <Text accessibilityRole="header" style={styles.sheetTitle}>Filtrar por prioridade</Text>
            {priorityOptions.map((option) => (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected: priorityFilter === option.key }}
                key={option.label}
                onPress={() => {
                  setPriorityFilter(option.key);
                  setPriorityPickerVisible(false);
                }}
                style={({ pressed }) => [styles.priorityOption, pressed && styles.pressed]}>
                <Text style={styles.priorityOptionText}>{option.label}</Text>
                {priorityFilter === option.key ? (
                  <Text style={styles.selectedCheck}>✓</Text>
                ) : null}
              </Pressable>
            ))}
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function SummaryItem({ count, label }: { count: number; label: string }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryCount}>{count}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.filterChip,
        selected && styles.filterChipSelected,
        pressed && styles.pressed,
      ]}>
      <Text style={[styles.filterText, selected && styles.filterTextSelected]}>{label}</Text>
    </Pressable>
  );
}

function SkeletonCard() {
  return (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonLineShort} />
      <View style={styles.skeletonLine} />
      <View style={styles.skeletonLine} />
    </View>
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
  heading: {
    gap: Spacing.one,
  },
  brand: {
    ...Type.brandSmall,
    color: AppColors.primary,
  },
  title: {
    ...Type.cameraTitle,
    color: AppColors.text,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  summaryItem: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    gap: Spacing.two,
  },
  summaryCount: {
    ...Type.display,
    color: AppColors.text,
  },
  summaryLabel: {
    ...Type.body,
    color: AppColors.textSecondary,
  },
  newTicketButton: {
    minHeight: Sizes.control + Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    backgroundColor: AppColors.primary,
  },
  newTicketText: {
    ...Type.title,
    color: AppColors.onPrimary,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  filterChip: {
    minHeight: Sizes.control + Spacing.two,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderWidth: BorderWidth.focus,
    borderColor: AppColors.borderStrong,
    borderRadius: Radius.md,
    backgroundColor: AppColors.backgroundElement,
  },
  filterChipSelected: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.primary,
  },
  filterText: {
    ...Type.bodyStrong,
    color: AppColors.textSecondary,
  },
  filterTextSelected: {
    color: AppColors.onPrimary,
  },
  loading: {
    gap: Spacing.three,
    paddingTop: Spacing.two,
  },
  loadingText: {
    ...Type.body,
    color: AppColors.textSecondary,
  },
  skeletonCard: {
    minHeight: Sizes.cameraPreview,
    justifyContent: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.lg,
    backgroundColor: AppColors.backgroundElement,
  },
  skeletonLineShort: {
    width: '34%',
    height: Spacing.three,
    borderRadius: Radius.sm,
    backgroundColor: AppColors.backgroundSelected,
  },
  skeletonLine: {
    width: '100%',
    height: Spacing.three,
    borderRadius: Radius.sm,
    backgroundColor: AppColors.backgroundSelected,
  },
  ticketList: {
    gap: Spacing.three,
  },
  demoNote: {
    ...Type.caption,
    color: AppColors.textMuted,
  },
  modal: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: AppColors.overlay,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  prioritySheet: {
    gap: Spacing.two,
    paddingHorizontal: Layout.screenMargin,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    backgroundColor: AppColors.backgroundElement,
  },
  sheetHandle: {
    width: Sizes.avatar,
    height: Spacing.one,
    alignSelf: 'center',
    marginBottom: Spacing.two,
    borderRadius: Radius.full,
    backgroundColor: AppColors.borderStrong,
  },
  sheetTitle: {
    ...Type.heading,
    color: AppColors.text,
    marginBottom: Spacing.two,
  },
  priorityOption: {
    minHeight: Sizes.control,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.two,
    borderBottomWidth: BorderWidth.hairline,
    borderBottomColor: AppColors.border,
  },
  priorityOptionText: {
    ...Type.body,
    color: AppColors.text,
  },
  selectedCheck: {
    ...Type.heading,
    color: AppColors.primary,
  },
  pressed: {
    opacity: 0.72,
  },
});
