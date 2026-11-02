import { SymbolView } from 'expo-symbols';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import {
  AppColors,
  BorderWidth,
  Layout,
  MaxContentWidth,
  Radius,
  Sizes,
  Spacing,
  StatusColors,
  Type,
} from '@/constants/theme';
import type { Ticket, TicketPriority, TicketStatus } from '@/services/contracts/tickets';

const actionIcons = {
  add: { ios: 'plus', android: 'add', web: 'add' },
  retry: { ios: 'arrow.clockwise', android: 'refresh', web: 'refresh' },
  send: { ios: 'paperplane', android: 'send', web: 'send' },
} as const;

export const ticketStatusLabels: Record<TicketStatus, string> = {
  open: 'Aberto',
  inProgress: 'Em andamento',
  done: 'Concluído',
  cancelled: 'Cancelado',
};

const ticketStatusColors = {
  open: StatusColors.ticket.open,
  inProgress: StatusColors.ticket.inProgress,
  done: StatusColors.ticket.done,
  cancelled: StatusColors.priority.low,
};

const priorityLabels: Record<TicketPriority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  critical: 'Crítica',
};

const priorityColors = {
  low: StatusColors.priority.low,
  medium: StatusColors.priority.medium,
  high: StatusColors.priority.high,
  critical: StatusColors.priority.critical,
};

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const color = ticketStatusColors[status];
  return (
    <View accessibilityLabel={`Status: ${ticketStatusLabels[status]}`} style={[styles.badge, { backgroundColor: color.bg }]}>
      <View style={[styles.badgeDot, { backgroundColor: color.fg }]} />
      <Text style={[styles.badgeText, { color: color.fg }]}>{ticketStatusLabels[status]}</Text>
    </View>
  );
}

export function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
  const color = priorityColors[priority];
  return (
    <View accessibilityLabel={`Prioridade: ${priorityLabels[priority]}`} style={[styles.badge, { backgroundColor: color.bg }]}>
      <View style={[styles.badgeDot, { backgroundColor: color.fg }]} />
      <Text style={[styles.badgeText, { color: color.fg }]}>{priorityLabels[priority]}</Text>
    </View>
  );
}

export function TicketCard({
  ticket,
  index,
  onPress,
}: {
  ticket: Ticket;
  index: number;
  onPress: () => void;
}) {
  return (
    <Animated.View entering={FadeInDown.duration(220).delay(Math.min(index, 4) * 45)}>
      <Pressable
        accessibilityLabel={`Chamado número ${ticket.id}, ${ticket.issueType}, ${ticketStatusLabels[ticket.status]}, prioridade ${priorityLabels[ticket.priority]}`}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.ticketCard, pressed && styles.pressed]}>
        <View style={styles.ticketTopRow}>
          <Text style={styles.ticketId}>#{ticket.id} · {ticket.cameraId}</Text>
          <TicketPriorityBadge priority={ticket.priority} />
        </View>
        <Text style={styles.ticketTitle}>{ticket.issueType}</Text>
        <Text style={styles.ticketAddress}>
          {ticket.cameraAddress}{ticket.neighborhood ? ` · ${ticket.neighborhood}` : ''}
        </Text>
        <View style={styles.ticketStatusRow}>
          <TicketStatusBadge status={ticket.status} />
          <Text style={styles.ticketDate}>{ticket.openedAt}</Text>
        </View>
        <View style={styles.ticketAssigneeRow}>
          <SymbolView
            name={{ ios: 'person', android: 'person', web: 'person' }}
            size={Sizes.icon}
            tintColor={AppColors.textSecondary}
          />
          <Text style={styles.ticketAssignee}>
            {ticket.assignee ?? 'Aguardando atribuição'}
          </Text>
          <SymbolView
            name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
            size={Sizes.icon}
            tintColor={AppColors.textSecondary}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function TicketStatePanel({
  kind,
  message,
  hasFilters,
  onRetry,
  onClearFilters,
  onCreate,
}: {
  kind: 'empty' | 'error';
  message?: string;
  hasFilters?: boolean;
  onRetry?: () => void;
  onClearFilters?: () => void;
  onCreate?: () => void;
}) {
  const isError = kind === 'error';
  return (
    <Animated.View entering={FadeInDown.duration(260)} style={styles.statePanel}>
      <View style={styles.stateIcon}>
        <SymbolView
          name={
            isError
              ? { ios: 'wifi.slash', android: 'wifi_off', web: 'wifi_off' }
              : { ios: 'magnifyingglass', android: 'search', web: 'search' }
          }
          size={Sizes.avatar}
          tintColor={isError ? AppColors.error : AppColors.primary}
        />
      </View>
      <Text accessibilityRole="header" style={styles.stateTitle}>
        {isError ? 'Não foi possível carregar' : 'Nenhum chamado encontrado'}
      </Text>
      <Text style={styles.stateMessage}>
        {message ??
          (isError
            ? 'A lista de chamados está temporariamente indisponível.'
            : hasFilters
              ? 'Não há chamados com os filtros selecionados. Remova um filtro para ver outros registros.'
              : 'Ainda não há chamados registrados. Abra um chamado para solicitar atendimento.')}
      </Text>
      {isError ? (
        <TicketActionButton
          label="Tentar novamente"
          icon="retry"
          onPress={onRetry}
        />
      ) : hasFilters ? (
        <TicketActionButton
          label="Limpar filtros"
          onPress={onClearFilters}
        />
      ) : (
        <TicketActionButton
          label="Novo chamado"
          icon="add"
          onPress={onCreate}
        />
      )}
    </Animated.View>
  );
}

export function TicketActionButton({
  label,
  onPress,
  icon,
  variant = 'primary',
  disabled = false,
}: {
  label: string;
  onPress?: () => void;
  icon?: keyof typeof actionIcons;
  variant?: 'primary' | 'outline';
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        variant === 'outline' && styles.actionButtonOutline,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}>
      {icon ? (
        <SymbolView
          name={actionIcons[icon]}
          size={Sizes.icon + Spacing.two}
          tintColor={variant === 'primary' ? AppColors.onPrimary : AppColors.primary}
        />
      ) : null}
      <Text style={[styles.actionButtonText, variant === 'outline' && styles.actionButtonOutlineText]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function TicketScreenHeader({
  title,
  onBack,
  action,
}: {
  title: string;
  onBack?: () => void;
  action?: ReactNode;
}) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <Pressable
          accessibilityLabel="Voltar"
          accessibilityRole="button"
          onPress={onBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
          <SymbolView
            name={{ ios: 'arrow.left', android: 'arrow_back', web: 'arrow_back' }}
            size={Sizes.icon + Spacing.two}
            tintColor={AppColors.text}
          />
        </Pressable>
      ) : null}
      <View style={styles.headerText}>
        <Text style={styles.brand}>SmartTraffic</Text>
        <Text accessibilityRole="header" style={styles.headerTitle}>{title}</Text>
      </View>
      {action}
    </View>
  );
}

export const ticketScreenStyles = StyleSheet.create({
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
  sectionTitle: {
    ...Type.heading,
    color: AppColors.text,
  },
  body: {
    ...Type.body,
    color: AppColors.textSecondary,
  },
  pressed: {
    opacity: 0.72,
  },
});

const styles = StyleSheet.create({
  header: {
    minHeight: Sizes.avatar + Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  backButton: {
    width: Sizes.avatar + Spacing.two,
    height: Sizes.avatar + Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.lg,
    backgroundColor: AppColors.backgroundElement,
  },
  headerText: {
    flex: 1,
    gap: Spacing.one,
  },
  brand: {
    ...Type.brandSmall,
    color: AppColors.primary,
  },
  headerTitle: {
    ...Type.cameraTitle,
    color: AppColors.text,
  },
  badge: {
    minHeight: Sizes.minTouch - Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Radius.sm,
  },
  badgeDot: {
    width: Spacing.two,
    height: Spacing.two,
    borderRadius: Radius.full,
  },
  badgeText: {
    ...Type.bodyStrong,
  },
  ticketCard: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderWidth: BorderWidth.hairline,
    borderColor: AppColors.borderStrong,
    borderRadius: Radius.lg,
    backgroundColor: AppColors.backgroundElement,
  },
  ticketTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  ticketId: {
    ...Type.heading,
    flex: 1,
    color: AppColors.text,
  },
  ticketTitle: {
    ...Type.heading,
    color: AppColors.text,
  },
  ticketAddress: {
    ...Type.body,
    color: AppColors.textSecondary,
  },
  ticketStatusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  ticketDate: {
    ...Type.body,
    color: AppColors.textSecondary,
  },
  ticketAssigneeRow: {
    minHeight: Sizes.minTouch,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  ticketAssignee: {
    ...Type.body,
    flex: 1,
    color: AppColors.textSecondary,
  },
  statePanel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
    paddingVertical: Spacing.six,
  },
  stateIcon: {
    width: Sizes.navigationBar,
    height: Sizes.navigationBar,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: BorderWidth.hairline,
    borderColor: AppColors.borderStrong,
    borderRadius: Radius.xl,
    backgroundColor: AppColors.backgroundElement,
  },
  stateTitle: {
    ...Type.title,
    color: AppColors.text,
    textAlign: 'center',
  },
  stateMessage: {
    ...Type.body,
    maxWidth: 560,
    color: AppColors.textSecondary,
    textAlign: 'center',
  },
  actionButton: {
    minHeight: Sizes.control + Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.md,
    backgroundColor: AppColors.primary,
  },
  actionButtonOutline: {
    borderWidth: BorderWidth.focus,
    borderColor: AppColors.primary,
  },
  actionButtonText: {
    ...Type.button,
    color: AppColors.onPrimary,
  },
  actionButtonOutlineText: {
    color: AppColors.primary,
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.72,
  },
});

export const ticketPriorityLabels = priorityLabels;
