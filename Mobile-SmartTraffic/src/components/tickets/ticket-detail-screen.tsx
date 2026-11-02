import { SymbolView } from 'expo-symbols';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { TicketActionButton, TicketPriorityBadge, TicketScreenHeader, TicketStatusBadge, ticketScreenStyles } from '@/components/tickets/ticket-ui';
import { TicketTabBar } from '@/components/tickets/ticket-tab-bar';
import {
  AppColors,
  BorderWidth,
  Layout,
  Radius,
  Sizes,
  Spacing,
  Type,
} from '@/constants/theme';
import { ticketDataSource } from '@/services/tickets';
import type { Ticket } from '@/services/contracts/tickets';

export function TicketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [retry, setRetry] = useState(0);
  const [loaded, setLoaded] = useState<{ key: string; ticket: Ticket | null; error?: string } | null>(null);
  const [confirmation, setConfirmation] = useState<'done' | 'cancelled' | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const requestKey = `${id}:${retry}`;
  const result = useMemo(
    () => loaded?.key === requestKey ? loaded : null,
    [loaded, requestKey],
  );

  useEffect(() => {
    let active = true;
    ticketDataSource
      .getTicket(id)
      .then((ticket) => {
        if (active) setLoaded({ key: requestKey, ticket });
      })
      .catch((error: unknown) => {
        if (!active) return;
        setLoaded({
          key: requestKey,
          ticket: null,
          error: error instanceof Error ? error.message : 'Não foi possível carregar o chamado.',
        });
      });
    return () => {
      active = false;
    };
  }, [id, requestKey]);

  const ticket = result?.ticket ?? null;
  const bottomInset = insets.bottom + Sizes.navigationBar;

  async function updateStatus() {
    if (!ticket || !confirmation) return;
    setIsSaving(true);
    try {
      await ticketDataSource.updateStatus(ticket.id, confirmation);
      setConfirmation(null);
      router.replace('/tickets');
    } catch (error: unknown) {
      setLoaded({
        key: requestKey,
        ticket,
        error: error instanceof Error ? error.message : 'Não foi possível atualizar o chamado.',
      });
      setConfirmation(null);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView edges={['top']} style={ticketScreenStyles.screen}>
      <ScrollView
        contentContainerStyle={[ticketScreenStyles.scrollContent, { paddingBottom: bottomInset + Spacing.four }]}
        showsVerticalScrollIndicator={false}>
        <View style={ticketScreenStyles.content}>
          <TicketScreenHeader
            title={ticket ? `Chamado #${ticket.id}` : 'Detalhe do chamado'}
            onBack={() => router.replace('/tickets')}
          />

          {!result ? (
            <View style={styles.loading}>
              <ActivityIndicator color={AppColors.primary} size="large" />
              <Text style={ticketScreenStyles.body}>Carregando chamado...</Text>
            </View>
          ) : result.error ? (
            <DetailError message={result.error} onRetry={() => setRetry((value) => value + 1)} />
          ) : !ticket ? (
            <DetailError
              message="Este chamado não foi encontrado ou não está mais disponível."
              onRetry={() => router.replace('/tickets')}
              retryLabel="Voltar aos chamados"
            />
          ) : (
            <Animated.View entering={FadeIn.duration(220)} style={styles.content}>
              <View style={styles.badges}>
                <TicketPriorityBadge priority={ticket.priority} />
                <TicketStatusBadge status={ticket.status} />
              </View>

              <View style={styles.cameraCard}>
                <View style={styles.cameraHeading}>
                  <Text style={styles.cameraId}>{ticket.cameraId}</Text>
                  <Text style={styles.cameraStatus}>{ticket.cameraStatus === 'offline' ? 'Offline' : ticket.cameraStatus === 'maintenance' ? 'Manutenção' : 'Online'}</Text>
                </View>
                <Text style={styles.cameraAddress}>
                  {ticket.cameraAddress} · {ticket.neighborhood}
                </Text>
                {ticket.cameraModel ? (
                  <Text style={styles.cameraMetadata}>{ticket.cameraModel}</Text>
                ) : null}
                <Text style={[styles.cameraMetadata, ticket.cameraStatus === 'offline' && styles.cameraOffline]}>
                  {ticket.cameraStatus === 'offline'
                    ? `Sem resposta desde ${ticket.openedAt}`
                    : `Câmera monitorada · dados demonstrativos`}
                </Text>
              </View>

              <View style={styles.description}>
                <Text style={styles.sectionTitle}>{ticket.issueType}</Text>
                <Text style={styles.descriptionText}>{ticket.description}</Text>
                <Text style={styles.openedMeta}>
                  Aberto por {ticket.openedBy} · {ticket.openedAt}
                </Text>
              </View>

              {ticket.attachment ? (
                <View style={styles.attachment}>
                  <Image
                    accessibilityLabel={`Anexo do chamado: ${ticket.attachment.name}`}
                    source={{ uri: ticket.attachment.uri }}
                    contentFit="cover"
                    style={styles.attachmentImage}
                  />
                  <Text style={ticketScreenStyles.body}>{ticket.attachment.name} · Anexo</Text>
                </View>
              ) : (
                <View style={styles.attachmentPlaceholder}>
                  <SymbolView
                    name={{ ios: 'photo', android: 'image', web: 'image' }}
                    size={Sizes.avatar}
                    tintColor={AppColors.textMuted}
                  />
                  <Text style={styles.attachmentText}>Nenhuma imagem anexada</Text>
                  <Text style={styles.attachmentCaption}>
                    Imagens recentes da câmera estarão disponíveis após a integração com a API.
                  </Text>
                </View>
              )}

              <View style={styles.currentStage}>
                <Text style={styles.sectionTitle}>Etapa atual</Text>
                <View style={styles.stageRow}>
                  <SymbolView
                    name={{ ios: 'smallcircle.filled.circle', android: 'radio_button_checked', web: 'radio_button_checked' }}
                    size={Sizes.icon + Spacing.two}
                    tintColor={AppColors.primary}
                  />
                  <View style={styles.stageText}>
                    <Text style={styles.stageTitle}>
                      {ticket.status === 'inProgress' ? 'Em análise' : ticket.status === 'done' ? 'Resolvido' : ticket.status === 'cancelled' ? 'Cancelado' : 'Aguardando atribuição'}
                      {ticket.assignee ? ` · ${ticket.history.find((entry) => entry.status === 'current')?.occurredAt ?? ''}` : ''}
                    </Text>
                    <Text style={styles.stageDetail}>
                      {ticket.assignee ? `Responsável: ${ticket.assignee}` : 'Equipe de manutenção'}
                    </Text>
                  </View>
                </View>
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  router.push({
                    pathname: '/tickets/[id]/history',
                    params: { id: ticket.id },
                  })
                }
                style={({ pressed }) => [styles.historyLink, pressed && styles.pressed]}>
                <Text style={styles.historyLinkText}>Ver histórico e comentários</Text>
                <SymbolView
                  name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                  size={Sizes.icon}
                  tintColor={AppColors.primary}
                />
              </Pressable>

              {ticket.status !== 'done' && ticket.status !== 'cancelled' ? (
                <View style={styles.actionRow}>
                  <View style={styles.actionColumn}>
                    <TicketActionButton
                      label="Cancelar chamado"
                      variant="outline"
                      onPress={() => setConfirmation('cancelled')}
                    />
                  </View>
                  <View style={styles.actionColumn}>
                    <TicketActionButton
                      label="Encerrar chamado"
                      onPress={() => setConfirmation('done')}
                    />
                  </View>
                </View>
              ) : null}
            </Animated.View>
          )}
        </View>
      </ScrollView>

      <TicketTabBar bottomInset={insets.bottom} />

      <Modal
        animationType="fade"
        onRequestClose={() => setConfirmation(null)}
        transparent
        visible={confirmation !== null}>
        <View style={styles.modal}>
          <Pressable
            accessibilityLabel="Fechar confirmação"
            accessibilityRole="button"
            onPress={() => setConfirmation(null)}
            style={styles.backdrop}
          />
          <Animated.View entering={FadeInDown.duration(180)} style={styles.confirmSheet}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>
              {confirmation === 'done' ? 'Encerrar chamado?' : 'Cancelar chamado?'}
            </Text>
            <Text style={ticketScreenStyles.body}>
              {confirmation === 'done'
                ? 'O chamado será marcado como resolvido.'
                : 'O chamado será cancelado e removido da lista ativa.'}
            </Text>
            <View style={styles.confirmActions}>
              <TicketActionButton
                label="Voltar"
                variant="outline"
                disabled={isSaving}
                onPress={() => setConfirmation(null)}
              />
              <TicketActionButton
                label={isSaving ? 'Salvando...' : 'Confirmar'}
                disabled={isSaving}
                onPress={() => void updateStatus()}
              />
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function DetailError({
  message,
  onRetry,
  retryLabel = 'Tentar novamente',
}: {
  message: string;
  onRetry: () => void;
  retryLabel?: string;
}) {
  return (
    <View style={styles.error}>
      <Text style={styles.errorText}>{message}</Text>
      <TicketActionButton label={retryLabel} onPress={onRetry} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.three,
  },
  loading: {
    minHeight: 420,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  cameraCard: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderWidth: BorderWidth.hairline,
    borderColor: AppColors.borderStrong,
    borderRadius: Radius.lg,
    backgroundColor: AppColors.backgroundElement,
  },
  cameraHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  cameraId: {
    ...Type.heading,
    color: AppColors.text,
  },
  cameraStatus: {
    ...Type.body,
    color: AppColors.textSecondary,
  },
  cameraAddress: {
    ...Type.bodyStrong,
    color: AppColors.text,
  },
  cameraMetadata: {
    ...Type.body,
    color: AppColors.textSecondary,
  },
  cameraOffline: {
    color: AppColors.error,
  },
  description: {
    gap: Spacing.two,
  },
  sectionTitle: {
    ...Type.heading,
    color: AppColors.text,
  },
  descriptionText: {
    ...Type.body,
    color: AppColors.textSecondary,
  },
  openedMeta: {
    ...Type.caption,
    color: AppColors.textMuted,
  },
  attachment: {
    gap: Spacing.two,
  },
  attachmentImage: {
    width: '100%',
    height: Sizes.cameraPreview,
    borderRadius: Radius.lg,
  },
  attachmentPlaceholder: {
    minHeight: Sizes.cameraPreview,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderWidth: BorderWidth.hairline,
    borderColor: AppColors.border,
    borderRadius: Radius.lg,
    backgroundColor: AppColors.backgroundElement,
  },
  attachmentText: {
    ...Type.bodyStrong,
    color: AppColors.textSecondary,
  },
  attachmentCaption: {
    ...Type.caption,
    color: AppColors.textMuted,
    textAlign: 'center',
  },
  currentStage: {
    gap: Spacing.three,
    padding: Spacing.three,
    borderWidth: BorderWidth.hairline,
    borderColor: AppColors.borderStrong,
    borderRadius: Radius.lg,
    backgroundColor: AppColors.backgroundElement,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  stageText: {
    flex: 1,
    gap: Spacing.one,
  },
  stageTitle: {
    ...Type.bodyStrong,
    color: AppColors.text,
  },
  stageDetail: {
    ...Type.body,
    color: AppColors.textSecondary,
  },
  historyLink: {
    minHeight: Sizes.minTouch,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  historyLinkText: {
    ...Type.bodyStrong,
    color: AppColors.primary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  actionColumn: {
    flex: 1,
  },
  error: {
    minHeight: 360,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  errorText: {
    ...Type.body,
    color: AppColors.error,
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
  confirmSheet: {
    gap: Spacing.three,
    padding: Layout.screenMargin,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    backgroundColor: AppColors.backgroundElement,
  },
  confirmActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  pressed: {
    opacity: 0.72,
  },
});
