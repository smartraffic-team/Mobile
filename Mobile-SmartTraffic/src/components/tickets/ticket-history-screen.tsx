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
  TextInput,
  View,
} from 'react-native';
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
import type { Ticket, TicketStatus } from '@/services/contracts/tickets';

const commentLimit = 500;

export function TicketHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [retry, setRetry] = useState(0);
  const [loaded, setLoaded] = useState<{ key: string; ticket: Ticket | null; error?: string } | null>(null);
  const [comment, setComment] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [confirmation, setConfirmation] = useState<Exclude<TicketStatus, 'open' | 'inProgress'> | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const requestKey = `${id}:${retry}`;
  const ticket = useMemo(
    () => loaded?.key === requestKey ? loaded.ticket : null,
    [loaded, requestKey],
  );
  const isLoaded = loaded?.key === requestKey;

  useEffect(() => {
    let active = true;
    ticketDataSource
      .getTicket(id)
      .then((result) => {
        if (active) setLoaded({ key: requestKey, ticket: result });
      })
      .catch((error: unknown) => {
        if (!active) return;
        setLoaded({
          key: requestKey,
          ticket: null,
          error: error instanceof Error ? error.message : 'Não foi possível carregar o histórico.',
        });
      });
    return () => {
      active = false;
    };
  }, [id, requestKey]);

  async function sendComment() {
    if (!ticket || !comment.trim() || isSending) return;
    setIsSending(true);
    try {
      const updated = await ticketDataSource.addComment(ticket.id, comment.trim());
      setLoaded({ key: requestKey, ticket: updated });
      setComment('');
    } catch (error: unknown) {
      setLoaded({
        key: requestKey,
        ticket,
        error: error instanceof Error ? error.message : 'Não foi possível enviar o comentário.',
      });
    } finally {
      setIsSending(false);
    }
  }

  async function updateStatus() {
    if (!ticket || !confirmation || isUpdating) return;
    setIsUpdating(true);
    try {
      const updated = await ticketDataSource.updateStatus(ticket.id, confirmation);
      setLoaded({ key: requestKey, ticket: updated });
      setConfirmation(null);
    } catch (error: unknown) {
      setLoaded({
        key: requestKey,
        ticket,
        error: error instanceof Error ? error.message : 'Não foi possível atualizar o chamado.',
      });
      setConfirmation(null);
    } finally {
      setIsUpdating(false);
    }
  }

  const bottomInset = insets.bottom + Sizes.navigationBar;

  return (
    <SafeAreaView edges={['top']} style={ticketScreenStyles.screen}>
      <ScrollView
        contentContainerStyle={[ticketScreenStyles.scrollContent, { paddingBottom: bottomInset + Spacing.four }]}
        showsVerticalScrollIndicator={false}>
        <View style={ticketScreenStyles.content}>
          <TicketScreenHeader
            title={ticket ? `Chamado #${ticket.id}` : 'Histórico do chamado'}
            onBack={() => router.back()}
          />

          {!isLoaded ? (
            <View style={styles.loading}>
              <ActivityIndicator color={AppColors.primary} size="large" />
              <Text style={ticketScreenStyles.body}>Carregando histórico...</Text>
            </View>
          ) : !ticket ? (
            <Animated.View entering={FadeIn.duration(200)} style={styles.loading}>
              <Text style={styles.errorText}>
                {loaded?.error ?? 'Este chamado não foi encontrado.'}
              </Text>
              <TicketActionButton
                label={loaded?.error ? 'Tentar novamente' : 'Voltar ao chamado'}
                onPress={() =>
                  loaded?.error
                    ? setRetry((value) => value + 1)
                    : router.replace({ pathname: '/tickets/[id]', params: { id } })
                }
              />
            </Animated.View>
          ) : (
            <Animated.View entering={FadeIn.duration(220)} style={styles.content}>
              <View style={styles.badges}>
                <TicketPriorityBadge priority={ticket.priority} />
                <TicketStatusBadge status={ticket.status} />
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Histórico do atendimento</Text>
                <View style={styles.timeline}>
                  {ticket.history.map((entry, index) => (
                    <Animated.View
                      key={entry.id}
                      entering={FadeInDown.duration(220).delay(index * 45)}
                      style={styles.timelineItem}>
                      <View
                        style={[
                          styles.timelineIcon,
                          (entry.status === 'complete' || entry.status === 'current') &&
                            styles.timelineIconActive,
                        ]}>
                          <SymbolView
                            name={
                              entry.status === 'complete'
                                ? { ios: 'checkmark', android: 'check', web: 'check' }
                                : entry.status === 'current'
                                  ? { ios: 'smallcircle.filled.circle', android: 'radio_button_checked', web: 'radio_button_checked' }
                                  : entry.status === 'skipped'
                                    ? { ios: 'minus.circle', android: 'remove_circle_outline', web: 'remove_circle_outline' }
                                    : { ios: 'circle', android: 'radio_button_unchecked', web: 'radio_button_unchecked' }
                            }
                            size={Sizes.icon}
                            tintColor={entry.status === 'complete' || entry.status === 'current' ? AppColors.onPrimary : AppColors.textMuted}
                        />
                      </View>
                      <View style={styles.timelineText}>
                        <Text
                          style={[
                            styles.timelineTitle,
                            (entry.status === 'pending' || entry.status === 'skipped') &&
                              styles.timelinePending,
                          ]}>
                          {entry.title}
                        </Text>
                        <Text style={styles.timelineDetail}>
                          {entry.actor ? `${entry.detail} · ${entry.actor}` : entry.detail}
                        </Text>
                      </View>
                    </Animated.View>
                  ))}
                </View>
              </View>

              <View style={styles.panel}>
                <View style={styles.commentsHeading}>
                  <Text style={styles.panelTitle}>Comentários</Text>
                  <Text style={styles.commentCount}>
                    {ticket.comments.length} {ticket.comments.length === 1 ? 'registro' : 'registros'}
                  </Text>
                </View>
                {ticket.comments.length ? (
                  <View style={styles.comments}>
                    {ticket.comments.map((item) => (
                      <View key={item.id} style={styles.commentItem}>
                        <View style={styles.commentMeta}>
                          <Text style={styles.commentAuthor}>{item.author}</Text>
                          <Text style={styles.commentTime}>{item.time}</Text>
                        </View>
                        <Text style={styles.commentText}>{item.message}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={ticketScreenStyles.body}>Ainda não há comentários neste chamado.</Text>
                )}
              </View>

              <View style={styles.commentForm}>
                <Text style={styles.commentLabel}>Adicionar comentário</Text>
                <View style={styles.commentInputRow}>
                  <TextInput
                    accessibilityLabel="Escreva uma atualização"
                    maxLength={commentLimit}
                    multiline
                    onChangeText={setComment}
                    placeholder="Escreva uma atualização"
                    placeholderTextColor={AppColors.textMuted}
                    style={styles.commentInput}
                    value={comment}
                  />
                  <Pressable
                    accessibilityLabel="Enviar comentário"
                    accessibilityRole="button"
                    accessibilityState={{ disabled: !comment.trim() || isSending }}
                    disabled={!comment.trim() || isSending}
                    onPress={() => void sendComment()}
                    style={({ pressed }) => [styles.sendButton, pressed && styles.pressed]}>
                    {isSending ? (
                      <ActivityIndicator color={AppColors.primary} />
                    ) : (
                      <SymbolView
                        name={{ ios: 'paperplane', android: 'send', web: 'send' }}
                        size={Sizes.icon + Spacing.two}
                        tintColor={comment.trim() ? AppColors.primary : AppColors.textMuted}
                      />
                    )}
                  </Pressable>
                </View>
                <Text style={styles.characterCount}>{comment.length}/{commentLimit}</Text>
                {loaded?.error ? <Text style={styles.errorText}>{loaded.error}</Text> : null}
              </View>

              {ticket.status !== 'done' && ticket.status !== 'cancelled' ? (
                <View style={styles.actions}>
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
              <Text style={styles.demoNote}>Comentários e histórico demonstrativos</Text>
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
            <Text style={styles.panelTitle}>
              {confirmation === 'done' ? 'Encerrar chamado?' : 'Cancelar chamado?'}
            </Text>
            <Text style={ticketScreenStyles.body}>
              {confirmation === 'done'
                ? 'O chamado será marcado como resolvido.'
                : 'O chamado será cancelado e removido da lista ativa.'}
            </Text>
            <View style={styles.actions}>
              <TicketActionButton
                label="Voltar"
                variant="outline"
                disabled={isUpdating}
                onPress={() => setConfirmation(null)}
              />
              <TicketActionButton
                label={isUpdating ? 'Salvando...' : 'Confirmar'}
                disabled={isUpdating}
                onPress={() => void updateStatus()}
              />
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
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
  panel: {
    gap: Spacing.three,
    padding: Spacing.three,
    borderWidth: BorderWidth.hairline,
    borderColor: AppColors.borderStrong,
    borderRadius: Radius.lg,
    backgroundColor: AppColors.backgroundElement,
  },
  panelTitle: {
    ...Type.heading,
    color: AppColors.text,
  },
  timeline: {
    gap: Spacing.four,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  timelineIcon: {
    width: Sizes.avatar,
    height: Sizes.avatar,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
    backgroundColor: AppColors.backgroundSelected,
  },
  timelineIconActive: {
    backgroundColor: AppColors.primary,
  },
  timelineText: {
    flex: 1,
    gap: Spacing.one,
    paddingTop: Spacing.one,
  },
  timelineTitle: {
    ...Type.bodyStrong,
    color: AppColors.text,
  },
  timelinePending: {
    color: AppColors.textMuted,
  },
  timelineDetail: {
    ...Type.body,
    color: AppColors.textSecondary,
  },
  commentsHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  commentCount: {
    ...Type.body,
    color: AppColors.textSecondary,
  },
  comments: {
    gap: Spacing.three,
  },
  commentItem: {
    gap: Spacing.two,
  },
  commentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  commentAuthor: {
    ...Type.bodyStrong,
    color: AppColors.text,
  },
  commentTime: {
    ...Type.body,
    color: AppColors.textSecondary,
  },
  commentText: {
    ...Type.body,
    color: AppColors.textSecondary,
  },
  commentForm: {
    gap: Spacing.two,
  },
  commentLabel: {
    ...Type.bodyStrong,
    color: AppColors.text,
  },
  commentInputRow: {
    minHeight: Sizes.control + Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderWidth: BorderWidth.hairline,
    borderColor: AppColors.borderStrong,
    borderRadius: Radius.md,
    backgroundColor: AppColors.backgroundElement,
  },
  commentInput: {
    ...Type.input,
    flex: 1,
    minHeight: Sizes.control,
    maxHeight: Sizes.cameraPreview,
    paddingVertical: Spacing.two,
    color: AppColors.text,
  },
  sendButton: {
    width: Sizes.minTouch,
    height: Sizes.minTouch,
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterCount: {
    ...Type.caption,
    color: AppColors.textMuted,
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  actionColumn: {
    flex: 1,
  },
  demoNote: {
    ...Type.caption,
    color: AppColors.textMuted,
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
  pressed: {
    opacity: 0.72,
  },
});
