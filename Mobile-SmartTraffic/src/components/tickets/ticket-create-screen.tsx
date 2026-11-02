import { SymbolView } from 'expo-symbols';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { TicketActionButton, TicketScreenHeader, ticketScreenStyles } from '@/components/tickets/ticket-ui';
import { TicketTabBar } from '@/components/tickets/ticket-tab-bar';
import {
  AppColors,
  BorderWidth,
  Layout,
  Radius,
  Sizes,
  Spacing,
  StatusColors,
  Type,
} from '@/constants/theme';
import { demoCameras } from '@/mocks/cameras';
import { ticketIssueTypes } from '@/mocks/tickets';
import { ticketDataSource } from '@/services/tickets';
import type { TicketAttachment, TicketPriority } from '@/services/contracts/tickets';

type SelectorKind = 'camera' | 'issue' | null;
const descriptionLimit = 1000;
const attachmentLimitBytes = 10 * 1024 * 1024;
const initialDescription =
  'Imagem com manchas e perda de nitidez no canto direito. Solicito verificação e limpeza da lente.';

const priorities: { value: TicketPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Baixa', color: StatusColors.priority.low.fg },
  { value: 'medium', label: 'Média', color: StatusColors.priority.medium.fg },
  { value: 'high', label: 'Alta', color: StatusColors.priority.high.fg },
  { value: 'critical', label: 'Crítica', color: StatusColors.priority.critical.fg },
];

export function TicketCreateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [cameraId, setCameraId] = useState('CAM-0012');
  const [issueType, setIssueType] = useState<string>(ticketIssueTypes[1]);
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [description, setDescription] = useState(initialDescription);
  const [attachment, setAttachment] = useState<TicketAttachment | null>(null);
  const [selector, setSelector] = useState<SelectorKind>(null);
  const [pendingIssue, setPendingIssue] = useState<string>(ticketIssueTypes[1]);
  const [pendingCamera, setPendingCamera] = useState(cameraId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPickingImage, setIsPickingImage] = useState(false);
  const camera = demoCameras.find((item) => item.id === cameraId) ?? demoCameras[0];
  const bottomInset = insets.bottom + Sizes.navigationBar;
  const canSubmit = Boolean(camera && issueType && description.trim()) && !isSubmitting;

  function openSelector(kind: Exclude<SelectorKind, null>) {
    if (kind === 'camera') setPendingCamera(cameraId);
    if (kind === 'issue') setPendingIssue(issueType);
    setSelector(kind);
  }

  function confirmSelection() {
    if (selector === 'camera') setCameraId(pendingCamera);
    if (selector === 'issue') setIssueType(pendingIssue);
    setSelector(null);
  }

  async function pickAttachment() {
    if (isPickingImage) return;
    setFeedback(null);
    setIsPickingImage(true);
    try {
      if (Platform.OS !== 'web') {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          setFeedback('Permita o acesso às fotos para anexar uma imagem ao chamado.');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: false,
        quality: 0.8,
      });
      if (result.canceled) return;

      const asset = result.assets[0];
      if (!asset) {
        setFeedback('Não foi possível ler a imagem selecionada. Tente novamente.');
        return;
      }
      const isJpegOrPng = asset.mimeType
        ? asset.mimeType === 'image/jpeg' ||
          asset.mimeType === 'image/jpg' ||
          asset.mimeType === 'image/png'
        : /\.(jpe?g|png)$/i.test(asset.fileName ?? '');
      if (!isJpegOrPng) {
        setFeedback('Selecione uma imagem JPG ou PNG.');
        return;
      }
      if (asset.fileSize && asset.fileSize > attachmentLimitBytes) {
        setFeedback('A imagem ultrapassa o limite de 10 MB.');
        return;
      }

      setAttachment({
        uri: asset.uri,
        name: asset.fileName ?? 'imagem-anexada',
        mimeType: asset.mimeType ?? null,
        size: asset.fileSize ?? null,
      });
    } catch (error: unknown) {
      setFeedback(
        error instanceof Error
          ? error.message
          : 'Não foi possível abrir a biblioteca de imagens.',
      );
    } finally {
      setIsPickingImage(false);
    }
  }

  async function submitTicket() {
    if (!camera || !canSubmit) return;
    setIsSubmitting(true);
    setFeedback(null);
    try {
      await ticketDataSource.createTicket({
        cameraId: camera.id,
        cameraAddress: camera.address,
        neighborhood: camera.neighborhood,
        cameraStatus: camera.status,
        issueType,
        priority,
        description: description.trim(),
        ...(attachment ? { attachment } : {}),
      });
      router.replace('/tickets');
    } catch (error: unknown) {
      setFeedback(
        error instanceof Error
          ? error.message
          : 'Não foi possível registrar o chamado. Tente novamente.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView edges={['top']} style={ticketScreenStyles.screen}>
      <ScrollView
        contentContainerStyle={[ticketScreenStyles.scrollContent, { paddingBottom: bottomInset + Spacing.four }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={ticketScreenStyles.content}>
          <TicketScreenHeader title="Novo chamado" onBack={() => router.back()} />

          <View style={styles.draftRow}>
            <Text style={styles.draftLabel}>Rascunho · Mariana Costa</Text>
            <View style={styles.draftBadge}>
              <View style={styles.draftDot} />
              <Text style={styles.draftText}>Não enviado</Text>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Câmera · ID ou mapa</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => openSelector('camera')}
              style={({ pressed }) => [styles.selectButton, pressed && styles.pressed]}>
              <Text style={styles.selectText}>
                {camera.id} · {cameraStatusLabel(camera.status)}
              </Text>
              <SymbolView
                name={{ ios: 'chevron.down', android: 'expand_more', web: 'expand_more' }}
                size={Sizes.icon + Spacing.two}
                tintColor={AppColors.primary}
              />
            </Pressable>
            <Text style={styles.fieldHint}>{camera.address} · {camera.neighborhood}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Tipo de problema</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => openSelector('issue')}
              style={({ pressed }) => [styles.selectButton, pressed && styles.pressed]}>
              <Text numberOfLines={2} style={styles.selectText}>{issueType}</Text>
              <SymbolView
                name={{ ios: 'chevron.down', android: 'expand_more', web: 'expand_more' }}
                size={Sizes.icon + Spacing.two}
                tintColor={AppColors.primary}
              />
            </Pressable>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Prioridade</Text>
            <View style={styles.priorityOptions}>
              {priorities.map((item) => {
                const selected = priority === item.value;
                return (
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    key={item.value}
                    onPress={() => setPriority(item.value)}
                    style={({ pressed }) => [
                      styles.priorityOption,
                      selected && styles.prioritySelected,
                      pressed && styles.pressed,
                    ]}>
                    <Text
                      style={[
                        styles.priorityText,
                        selected && styles.priorityTextSelected,
                        !selected && { color: item.color },
                      ]}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.field}>
            <View style={styles.descriptionHeading}>
              <Text style={styles.fieldLabel}>Descrição</Text>
              <Text style={styles.characterCount}>{description.length}/{descriptionLimit}</Text>
            </View>
            <TextInput
              accessibilityLabel="Descrição do problema"
              maxLength={descriptionLimit}
              multiline
              onChangeText={setDescription}
              placeholder="Descreva o problema observado"
              placeholderTextColor={AppColors.textMuted}
              style={styles.descriptionInput}
              textAlignVertical="top"
              value={description}
            />
          </View>

          {attachment ? (
            <View style={styles.attachmentCard}>
              <Image
                accessibilityLabel={`Prévia do anexo: ${attachment.name}`}
                contentFit="cover"
                source={{ uri: attachment.uri }}
                style={styles.attachmentPreview}
              />
              <View style={styles.attachmentInfo}>
                <Text numberOfLines={1} style={styles.attachmentName}>{attachment.name}</Text>
                <Text style={styles.fieldHint}>
                  {attachment.size ? `${(attachment.size / 1024 / 1024).toFixed(1)} MB` : 'Imagem anexada'}
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Remover imagem anexada"
                accessibilityRole="button"
                onPress={() => setAttachment(null)}
                style={styles.removeAttachment}>
                <SymbolView
                  name={{ ios: 'xmark', android: 'close', web: 'close' }}
                  size={Sizes.icon}
                  tintColor={AppColors.textSecondary}
                />
              </Pressable>
            </View>
          ) : (
            <Pressable
              accessibilityRole="button"
              disabled={isPickingImage}
              onPress={() => void pickAttachment()}
              style={({ pressed }) => [styles.attachmentButton, pressed && styles.pressed]}>
              {isPickingImage ? (
                <ActivityIndicator color={AppColors.primary} />
              ) : (
                <SymbolView
                  name={{ ios: 'photo.badge.plus', android: 'add_photo_alternate', web: 'add_photo_alternate' }}
                  size={Sizes.icon + Spacing.two}
                  tintColor={AppColors.primary}
                />
              )}
              <View style={styles.attachmentLabel}>
                <Text style={styles.selectText}>Anexar foto ou print</Text>
                <Text style={styles.fieldHint}>JPG ou PNG · até 10 MB</Text>
              </View>
              <SymbolView
                name={{ ios: 'plus', android: 'add', web: 'add' }}
                size={Sizes.icon + Spacing.two}
                tintColor={AppColors.primary}
              />
            </Pressable>
          )}

          {feedback ? <Text accessibilityLiveRegion="polite" style={styles.feedback}>{feedback}</Text> : null}

          <TicketActionButton
            label={isSubmitting ? 'Enviando chamado...' : 'Enviar chamado'}
            icon="send"
            disabled={!canSubmit}
            onPress={() => void submitTicket()}
          />
          <Text style={styles.footerNote}>
            O chamado será registrado para a equipe de manutenção. Dados demonstrativos.
          </Text>
        </View>
      </ScrollView>

      <TicketTabBar bottomInset={insets.bottom} />

      <SelectorModal
        visible={selector !== null}
        title={selector === 'camera' ? 'Selecionar câmera' : 'Tipo de problema'}
        subtitle={
          selector === 'camera'
            ? 'Escolha a câmera relacionada ao chamado.'
            : `Escolha a ocorrência observada em ${camera.id}.`
        }
        options={
          selector === 'camera'
            ? demoCameras.map((item) => ({
                value: item.id,
                label: `${item.id} · ${cameraStatusLabel(item.status)}`,
                detail: `${item.address} · ${item.neighborhood}`,
              }))
            : ticketIssueTypes.map((item) => ({ value: item, label: item }))
        }
        selectedValue={selector === 'camera' ? pendingCamera : pendingIssue}
        onChange={(value) => {
          if (selector === 'camera') setPendingCamera(value);
          if (selector === 'issue') setPendingIssue(value);
        }}
        onClose={() => setSelector(null)}
        onConfirm={confirmSelection}
      />

    </SafeAreaView>
  );
}

function SelectorModal({
  visible,
  title,
  subtitle,
  options,
  selectedValue,
  onChange,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  title: string;
  subtitle: string;
  options: { value: string; label: string; detail?: string }[];
  selectedValue: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
      visible={visible}>
      <SafeAreaView edges={['top', 'bottom']} style={styles.selectorScreen}>
        <View style={styles.selectorContent}>
          <TicketScreenHeader title={title} onBack={onClose} />
          <Text style={styles.selectorSubtitle}>{subtitle}</Text>
          <ScrollView
            contentContainerStyle={styles.optionList}
            showsVerticalScrollIndicator={false}>
            {options.map((option, index) => {
              const selected = option.value === selectedValue;
              const cameraStatus = option.value.startsWith('CAM-')
                ? demoCameras.find((item) => item.id === option.value)?.status
                : undefined;
              return (
                <Animated.View
                  entering={FadeInDown.duration(180).delay(Math.min(index, 6) * 25)}
                  key={option.value}>
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    onPress={() => onChange(option.value)}
                    style={({ pressed }) => [styles.optionRow, pressed && styles.pressed]}>
                    <View style={styles.optionText}>
                      <Text style={styles.optionLabel}>{option.label}</Text>
                      {option.detail ? <Text style={styles.optionDetail}>{option.detail}</Text> : null}
                    </View>
                    <View
                      style={[
                        styles.radio,
                        selected && styles.radioSelected,
                        cameraStatus === 'offline' && styles.radioOffline,
                      ]}>
                      {selected ? <View style={styles.radioDot} /> : null}
                    </View>
                  </Pressable>
                </Animated.View>
              );
            })}
          </ScrollView>
          <TicketActionButton label="Confirmar seleção" onPress={onConfirm} />
          <Text style={styles.selectorFootnote}>A seleção não envia o rascunho.</Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function cameraStatusLabel(status: (typeof demoCameras)[number]['status']) {
  if (status === 'offline') return 'Offline';
  if (status === 'maintenance') return 'Manutenção';
  return 'Online';
}

const styles = StyleSheet.create({
  draftRow: {
    minHeight: Sizes.minTouch,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  draftLabel: {
    ...Type.body,
    color: AppColors.textSecondary,
  },
  draftBadge: {
    minHeight: Sizes.minTouch - Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.sm,
    backgroundColor: AppColors.backgroundSelected,
  },
  draftDot: {
    width: Spacing.two,
    height: Spacing.two,
    borderRadius: Radius.full,
    backgroundColor: AppColors.textSecondary,
  },
  draftText: {
    ...Type.bodyStrong,
    color: AppColors.textSecondary,
  },
  field: {
    gap: Spacing.two,
  },
  fieldLabel: {
    ...Type.bodyStrong,
    color: AppColors.text,
  },
  selectButton: {
    minHeight: Sizes.control + Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderWidth: BorderWidth.hairline,
    borderColor: AppColors.borderStrong,
    borderRadius: Radius.md,
    backgroundColor: AppColors.backgroundElement,
  },
  selectText: {
    ...Type.input,
    flex: 1,
    color: AppColors.text,
  },
  fieldHint: {
    ...Type.body,
    color: AppColors.textSecondary,
  },
  priorityOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  priorityOption: {
    minHeight: Sizes.control + Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderWidth: BorderWidth.focus,
    borderColor: AppColors.borderStrong,
    borderRadius: Radius.md,
    backgroundColor: AppColors.backgroundElement,
  },
  prioritySelected: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.primary,
  },
  priorityText: {
    ...Type.bodyStrong,
  },
  priorityTextSelected: {
    color: AppColors.onPrimary,
  },
  descriptionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  characterCount: {
    ...Type.caption,
    color: AppColors.textMuted,
  },
  descriptionInput: {
    ...Type.input,
    minHeight: Sizes.cameraPreview + Spacing.three,
    padding: Spacing.three,
    borderWidth: BorderWidth.hairline,
    borderColor: AppColors.borderStrong,
    borderRadius: Radius.md,
    backgroundColor: AppColors.backgroundElement,
    color: AppColors.text,
  },
  attachmentButton: {
    minHeight: Sizes.navigationBar,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderWidth: BorderWidth.focus,
    borderStyle: 'dashed',
    borderColor: AppColors.borderStrong,
    borderRadius: Radius.md,
    backgroundColor: AppColors.backgroundElement,
  },
  attachmentLabel: {
    flex: 1,
    gap: Spacing.one,
  },
  attachmentCard: {
    minHeight: Sizes.navigationBar,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.two,
    borderWidth: BorderWidth.hairline,
    borderColor: AppColors.borderStrong,
    borderRadius: Radius.md,
    backgroundColor: AppColors.backgroundElement,
  },
  attachmentPreview: {
    width: Sizes.navigationBar,
    height: Sizes.navigationBar,
    borderRadius: Radius.sm,
  },
  attachmentInfo: {
    flex: 1,
    gap: Spacing.one,
  },
  attachmentName: {
    ...Type.bodyStrong,
    color: AppColors.text,
  },
  removeAttachment: {
    width: Sizes.minTouch,
    height: Sizes.minTouch,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedback: {
    ...Type.body,
    color: AppColors.error,
  },
  footerNote: {
    ...Type.body,
    color: AppColors.textSecondary,
  },
  selectorScreen: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  selectorContent: {
    flex: 1,
    gap: Spacing.three,
    paddingHorizontal: Layout.screenMargin,
    paddingTop: Spacing.three,
  },
  selectorSubtitle: {
    ...Type.body,
    color: AppColors.textSecondary,
  },
  optionList: {
    flexGrow: 1,
    padding: Spacing.three,
    borderRadius: Radius.lg,
    backgroundColor: AppColors.backgroundElement,
  },
  optionRow: {
    minHeight: Sizes.navigationBar - Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderBottomWidth: BorderWidth.hairline,
    borderBottomColor: AppColors.borderStrong,
  },
  optionText: {
    flex: 1,
    gap: Spacing.one,
    paddingVertical: Spacing.two,
  },
  optionLabel: {
    ...Type.bodyStrong,
    color: AppColors.text,
  },
  optionDetail: {
    ...Type.body,
    color: AppColors.textSecondary,
  },
  radio: {
    width: Sizes.icon + Spacing.four,
    height: Sizes.icon + Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: BorderWidth.focus,
    borderColor: AppColors.textMuted,
    borderRadius: Radius.full,
  },
  radioSelected: {
    borderColor: AppColors.primary,
  },
  radioOffline: {
    borderColor: StatusColors.camera.offline.fg,
  },
  radioDot: {
    width: Spacing.three,
    height: Spacing.three,
    borderRadius: Radius.full,
    backgroundColor: AppColors.primary,
  },
  selectorFootnote: {
    ...Type.body,
    color: AppColors.textSecondary,
  },
  pressed: {
    opacity: 0.72,
  },
});
