import { SymbolView } from 'expo-symbols';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  type ScrollViewInstance,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';

import { ProfileCard } from '@/components/profile/profile-card';
import { ProfileIcon, ProfileInformationRow, ProfileSettingRow } from '@/components/profile/profile-row';
import { ProfileTabBar } from '@/components/profile/profile-tab-bar';
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
import { profileDataSource } from '@/services/profile';
import type { ProfileSnapshot, UpdateProfilePreferences } from '@/services/contracts/profile';

type ProfileLoadResult = {
  key: number;
  snapshot?: ProfileSnapshot;
  error?: string;
};

export function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [loaded, setLoaded] = useState<ProfileLoadResult | null>(null);
  const [savingPreference, setSavingPreference] = useState<keyof UpdateProfilePreferences | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSignOutVisible, setSignOutVisible] = useState(false);
  const [activityOffset, setActivityOffset] = useState(0);
  const result = useMemo(
    () => loaded?.key === reloadToken ? loaded : null,
    [loaded, reloadToken],
  );
  const bottomInset = insets.bottom + Sizes.navigationBar;

  useFocusEffect(
    useCallback(() => {
      let active = true;
      profileDataSource
        .getProfile()
        .then((snapshot) => {
          if (active) setLoaded({ key: reloadToken, snapshot });
        })
        .catch((error: unknown) => {
          if (!active) return;
          setLoaded({
            key: reloadToken,
            error: error instanceof Error ? error.message : 'Não foi possível carregar o perfil.',
          });
        });
      return () => {
        active = false;
      };
    }, [reloadToken]),
  );

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 3000);
    return () => clearTimeout(timer);
  }, [feedback]);

  async function updatePreference(preference: UpdateProfilePreferences) {
    if (!result?.snapshot || savingPreference) return;
    const key = Object.keys(preference)[0] as keyof UpdateProfilePreferences | undefined;
    if (!key) return;

    const previousSnapshot = result.snapshot;
    const optimisticSnapshot: ProfileSnapshot = {
      ...previousSnapshot,
      preferences: { ...previousSnapshot.preferences, ...preference },
    };
    setLoaded({ key: reloadToken, snapshot: optimisticSnapshot });
    setSavingPreference(key);
    setFeedback(null);

    try {
      const snapshot = await profileDataSource.updatePreferences(preference);
      setLoaded({ key: reloadToken, snapshot });
    } catch (error: unknown) {
      setLoaded({ key: reloadToken, snapshot: previousSnapshot });
      setFeedback(
        error instanceof Error ? error.message : 'Não foi possível salvar a preferência.',
      );
    } finally {
      setSavingPreference(null);
    }
  }

  function showUnavailableFeature(feature: string) {
    setFeedback(`${feature} estará disponível após a integração com a API de identidade.`);
  }

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomInset + Spacing.four }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.heading}>
            <Text style={styles.brand}>SmartTraffic</Text>
            <Text accessibilityRole="header" style={styles.pageTitle}>Perfil</Text>
          </View>

          {!result ? (
            <Animated.View entering={FadeIn.duration(180)} style={styles.loading}>
              <ActivityIndicator color={AppColors.primary} size="large" />
              <Text style={styles.body}>Carregando perfil...</Text>
              <View style={styles.skeletonCard} />
              <View style={styles.skeletonCard} />
            </Animated.View>
          ) : result.error ? (
            <ProfileError
              message={result.error}
              onRetry={() => setReloadToken((token) => token + 1)}
            />
          ) : result.snapshot ? (
            <Animated.View entering={FadeIn.duration(220)} style={styles.sections}>
              <UserSummary snapshot={result.snapshot} />

              <ProfileCard>
                <Text accessibilityRole="header" style={styles.sectionTitle}>Dados de cadastro</Text>
                <View style={styles.informationList}>
                  <ProfileInformationRow
                    label="Matrícula"
                    value={result.snapshot.user.employeeId}
                    icon="badge"
                    index={0}
                  />
                  <ProfileInformationRow
                    label="E-mail institucional"
                    value={result.snapshot.user.email}
                    icon="email"
                    index={1}
                  />
                  <ProfileInformationRow
                    label="Telefone"
                    value={result.snapshot.user.phone}
                    icon="phone"
                    index={2}
                  />
                  <ProfileInformationRow
                    label="CPF"
                    value={result.snapshot.user.maskedTaxId}
                    icon="privacy"
                    index={3}
                  />
                  <ProfileInformationRow
                    label="Turno e setor"
                    value={`${result.snapshot.user.shift} · ${result.snapshot.user.sector}`}
                    icon="schedule"
                    index={4}
                  />
                </View>
              </ProfileCard>

              <View style={styles.municipalAccess}>
                <ProfileIcon name="lock" />
                <Text style={styles.body}>
                  Acesso municipal · {result.snapshot.user.municipality}, {result.snapshot.user.region}
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={() => scrollRef.current?.scrollTo({ y: activityOffset, animated: true })}
                style={({ pressed }) => [styles.activityLink, pressed && styles.pressed]}>
                <Text style={styles.activityLinkText}>Atividade, preferências e segurança abaixo ↓</Text>
              </Pressable>

              <View onLayout={(event) => setActivityOffset(event.nativeEvent.layout.y)}>
                <ProfileCard>
                  <View style={styles.cardHeading}>
                    <Text accessibilityRole="header" style={styles.sectionTitle}>Sua atividade</Text>
                    <Text style={styles.body}>{result.snapshot.activity.periodLabel}</Text>
                  </View>
                  <View style={styles.activityMetrics}>
                    <ActivityMetric
                      value={result.snapshot.activity.openTickets}
                      label="chamados abertos por você"
                    />
                    <ActivityMetric
                      value={result.snapshot.activity.camerasMonitoredToday}
                      label="câmeras monitoradas hoje"
                    />
                  </View>
                  <Text style={styles.body}>
                    Último acesso: {result.snapshot.user.lastAccessAt}
                  </Text>
                </ProfileCard>
              </View>

              <View style={styles.group}>
                <Text accessibilityRole="header" style={styles.groupTitle}>Preferências</Text>
                <View style={styles.settings}>
                  <PreferenceToggle
                    label="Alertas de câmeras offline"
                    value={result.snapshot.preferences.offlineCameraAlerts}
                    isSaving={savingPreference === 'offlineCameraAlerts'}
                    onChange={(value) => void updatePreference({ offlineCameraAlerts: value })}
                  />
                  <PreferenceToggle
                    label="Atualizações de chamados"
                    value={result.snapshot.preferences.ticketUpdates}
                    isSaving={savingPreference === 'ticketUpdates'}
                    onChange={(value) => void updatePreference({ ticketUpdates: value })}
                  />
                  <ProfileSettingRow
                    label="Tema"
                    detail="Escuro selecionado"
                    icon="theme"
                    onPress={() => showUnavailableFeature('A alteração de tema')}
                  />
                  <ProfileSettingRow
                    label="Idioma"
                    detail="Português (Brasil)"
                    icon="language"
                    onPress={() => showUnavailableFeature('A alteração de idioma')}
                  />
                </View>
              </View>

              <View style={styles.group}>
                <Text accessibilityRole="header" style={styles.groupTitle}>Segurança</Text>
                <View style={styles.settings}>
                  <ProfileSettingRow
                    label="Alterar senha"
                    icon="shield"
                    onPress={() => showUnavailableFeature('A alteração de senha')}
                  />
                  <ProfileSettingRow
                    label="Encerrar outras sessões"
                    icon="devices"
                    onPress={() => showUnavailableFeature('O gerenciamento de sessões')}
                  />
                </View>
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={() => setSignOutVisible(true)}
                style={({ pressed }) => [styles.signOutButton, pressed && styles.pressed]}>
                <ProfileIcon name="logout" color={AppColors.error} />
                <Text style={styles.signOutText}>Sair do SmartTraffic</Text>
              </Pressable>

              <Text style={styles.demoNote}>
                Perfil e preferências demonstrativos · Sessão não conectada a uma API.
              </Text>
            </Animated.View>
          ) : null}
        </View>
      </ScrollView>

      <ProfileTabBar bottomInset={insets.bottom} />

      {feedback ? (
        <Animated.View
          accessibilityLiveRegion="polite"
          entering={FadeIn.duration(160)}
          exiting={FadeOut.duration(160)}
          style={[styles.toast, { bottom: bottomInset + Spacing.three }]}>
          <Text style={styles.toastText}>{feedback}</Text>
        </Animated.View>
      ) : null}

      <Modal
        animationType="fade"
        onRequestClose={() => setSignOutVisible(false)}
        transparent
        visible={isSignOutVisible}>
        <View style={styles.modal}>
          <Pressable
            accessibilityLabel="Cancelar saída"
            accessibilityRole="button"
            onPress={() => setSignOutVisible(false)}
            style={styles.backdrop}
          />
          <Animated.View entering={FadeInDown.duration(220)} style={styles.confirmDialog}>
            <ProfileIcon name="logout" color={AppColors.primary} />
            <Text accessibilityRole="header" style={styles.confirmTitle}>
              Sair do SmartTraffic?
            </Text>
            <Text style={styles.confirmMessage}>
              Sua sessão de operação será encerrada neste dispositivo. Para voltar, entre com suas credenciais.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setSignOutVisible(false);
                router.replace('/login');
              }}
              style={({ pressed }) => [styles.confirmSignOut, pressed && styles.pressed]}>
              <ProfileIcon name="logout" color={AppColors.onPrimary} />
              <Text style={styles.confirmSignOutText}>Sair</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => setSignOutVisible(false)}
              style={({ pressed }) => [styles.confirmCancel, pressed && styles.pressed]}>
              <Text style={styles.confirmCancelText}>Continuar no aplicativo</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function UserSummary({ snapshot }: { snapshot: ProfileSnapshot }) {
  const initials = snapshot.user.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <View style={styles.userSummary}>
      <View accessibilityLabel={`Iniciais de ${snapshot.user.name}`} style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <View style={styles.userText}>
        <Text style={styles.userName}>{snapshot.user.name}</Text>
        <Text style={styles.userRole}>{snapshot.user.role}</Text>
        <View style={styles.roleBadge}>
          <View style={styles.roleDot} />
          <Text style={styles.roleText}>{snapshot.user.roleLabel}</Text>
        </View>
      </View>
    </View>
  );
}

function ActivityMetric({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.activityMetric}>
      <Text style={styles.activityValue}>{value}</Text>
      <Text style={styles.body}>{label}</Text>
    </View>
  );
}

function PreferenceToggle({
  label,
  value,
  isSaving,
  onChange,
}: {
  label: string;
  value: boolean;
  isSaving: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.preferenceRow}>
      <Text style={styles.preferenceLabel}>{label}</Text>
      {isSaving ? (
        <ActivityIndicator color={AppColors.primary} />
      ) : (
        <Switch
          accessibilityLabel={label}
          accessibilityRole="switch"
          accessibilityState={{ checked: value }}
          onValueChange={onChange}
          trackColor={{
            false: AppColors.backgroundSelected,
            true: AppColors.primary,
          }}
          thumbColor={value ? AppColors.background : AppColors.textSecondary}
          value={value}
        />
      )}
    </View>
  );
}

function ProfileError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Animated.View entering={FadeIn.duration(180)} style={styles.error}>
      <ProfileIcon name="shield" color={AppColors.error} />
      <Text accessibilityRole="header" style={styles.sectionTitle}>Não foi possível carregar o perfil</Text>
      <Text style={styles.body}>{message}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={onRetry}
        style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}>
        <SymbolView
          name={{ ios: 'arrow.clockwise', android: 'refresh', web: 'refresh' }}
          size={Sizes.icon + Spacing.two}
          tintColor={AppColors.onPrimary}
        />
        <Text style={styles.retryText}>Tentar novamente</Text>
      </Pressable>
    </Animated.View>
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
    gap: Spacing.four,
  },
  heading: {
    gap: Spacing.one,
    marginBottom: Spacing.five,
  },
  brand: {
    ...Type.brandSmall,
    color: AppColors.primary,
  },
  pageTitle: {
    ...Type.cameraTitle,
    color: AppColors.text,
  },
  sections: {
    gap: Spacing.three,
  },
  userSummary: {
    minHeight: Sizes.navigationBar + Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    marginBottom: Spacing.two,
  },
  avatar: {
    width: Sizes.navigationBar + Spacing.three,
    height: Sizes.navigationBar + Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
    backgroundColor: AppColors.text,
  },
  avatarText: {
    ...Type.cameraTitle,
    color: AppColors.background,
  },
  userText: {
    flex: 1,
    gap: Spacing.one,
  },
  userName: {
    ...Type.cameraTitle,
    color: AppColors.text,
  },
  userRole: {
    ...Type.loginSubtitle,
    color: AppColors.textSecondary,
  },
  roleBadge: {
    minHeight: Sizes.minTouch - Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.sm,
    backgroundColor: AppColors.backgroundSelected,
  },
  roleDot: {
    width: Spacing.two,
    height: Spacing.two,
    borderRadius: Radius.full,
    backgroundColor: AppColors.textSecondary,
  },
  roleText: {
    ...Type.bodyStrong,
    color: AppColors.textSecondary,
  },
  sectionTitle: {
    ...Type.heading,
    color: AppColors.text,
  },
  informationList: {
    gap: Spacing.two,
  },
  municipalAccess: {
    minHeight: Sizes.minTouch,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.one,
  },
  body: {
    ...Type.body,
    color: AppColors.textSecondary,
  },
  activityLink: {
    minHeight: Sizes.minTouch,
    justifyContent: 'center',
    paddingHorizontal: Spacing.one,
  },
  activityLinkText: {
    ...Type.bodyStrong,
    color: AppColors.primary,
  },
  cardHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  activityMetrics: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  activityMetric: {
    flex: 1,
    gap: Spacing.two,
  },
  activityValue: {
    ...Type.display,
    color: AppColors.text,
  },
  group: {
    gap: Spacing.two,
  },
  groupTitle: {
    ...Type.heading,
    color: AppColors.text,
  },
  settings: {
    paddingHorizontal: Spacing.one,
  },
  preferenceRow: {
    minHeight: Sizes.navigationBar - Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    borderBottomWidth: BorderWidth.hairline,
    borderBottomColor: AppColors.borderStrong,
  },
  preferenceLabel: {
    ...Type.bodyStrong,
    flex: 1,
    color: AppColors.text,
  },
  signOutButton: {
    minHeight: Sizes.control + Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    borderWidth: BorderWidth.hairline,
    borderColor: AppColors.borderStrong,
    borderRadius: Radius.md,
  },
  signOutText: {
    ...Type.bodyStrong,
    color: AppColors.error,
  },
  demoNote: {
    ...Type.caption,
    color: AppColors.textMuted,
  },
  loading: {
    minHeight: 420,
    gap: Spacing.three,
    paddingTop: Spacing.three,
  },
  skeletonCard: {
    minHeight: Sizes.cameraPreview,
    borderRadius: Radius.lg,
    backgroundColor: AppColors.backgroundElement,
  },
  error: {
    minHeight: 420,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  retryButton: {
    minHeight: Sizes.control + Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.md,
    backgroundColor: AppColors.primary,
  },
  retryText: {
    ...Type.button,
    color: AppColors.onPrimary,
  },
  toast: {
    position: 'absolute',
    right: Layout.screenMargin,
    left: Layout.screenMargin,
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Radius.md,
    backgroundColor: AppColors.backgroundElement,
  },
  toastText: {
    ...Type.body,
    color: AppColors.text,
  },
  modal: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Layout.screenMargin,
    backgroundColor: AppColors.overlay,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  confirmDialog: {
    gap: Spacing.three,
    padding: Spacing.four,
    borderWidth: BorderWidth.hairline,
    borderColor: AppColors.borderStrong,
    borderRadius: Radius.xl,
    backgroundColor: AppColors.backgroundElement,
  },
  confirmTitle: {
    ...Type.title,
    color: AppColors.text,
  },
  confirmMessage: {
    ...Type.body,
    color: AppColors.textSecondary,
  },
  confirmSignOut: {
    minHeight: Sizes.control + Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderRadius: Radius.md,
    backgroundColor: AppColors.primary,
  },
  confirmSignOutText: {
    ...Type.button,
    color: AppColors.onPrimary,
  },
  confirmCancel: {
    minHeight: Sizes.control + Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: BorderWidth.focus,
    borderColor: AppColors.primary,
    borderRadius: Radius.md,
  },
  confirmCancelText: {
    ...Type.button,
    color: AppColors.primary,
  },
  pressed: {
    opacity: 0.72,
  },
});
