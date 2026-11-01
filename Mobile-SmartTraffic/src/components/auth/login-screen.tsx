import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  type TextInputInstance,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoginField, LoginFieldAction } from '@/components/auth/login-field';
import {
  AppColors,
  BorderWidth,
  Layout,
  MaxAuthWidth,
  Radius,
  Sizes,
  Spacing,
  Type,
} from '@/constants/theme';
import type { LoginCredentials, LoginFieldErrors, LoginFieldName } from '@/services/contracts/auth';

const REGISTRATION_NUMBER_PATTERN = /^\d{4}-\d{4}$/;
const API_UNAVAILABLE_MESSAGE = 'A autenticação ainda não está disponível. Aguarde a integração com a API.';

function formatRegistrationNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);

  return digits.length > 4 ? `${digits.slice(0, 4)}-${digits.slice(4)}` : digits;
}

function validateCredentials(credentials: LoginCredentials): LoginFieldErrors {
  const errors: LoginFieldErrors = {};

  if (!credentials.name.trim()) {
    errors.name = 'Informe seu nome.';
  }
  if (!credentials.password) {
    errors.password = 'Informe sua senha.';
  }
  if (!REGISTRATION_NUMBER_PATTERN.test(credentials.registrationNumber)) {
    errors.registrationNumber = 'Matrícula inválida';
  }

  return errors;
}

export function LoginScreen() {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    name: '',
    password: '',
    registrationNumber: '',
  });
  const [errors, setErrors] = useState<LoginFieldErrors>({});
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [showRecoveryMessage, setShowRecoveryMessage] = useState(false);
  const nameInput = useRef<TextInputInstance>(null);
  const passwordInput = useRef<TextInputInstance>(null);
  const registrationInput = useRef<TextInputInstance>(null);
  const submissionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (submissionTimer.current) {
        clearTimeout(submissionTimer.current);
      }
    },
    [],
  );

  function updateCredential(field: LoginFieldName, value: string) {
    const updatedCredentials = { ...credentials, [field]: value };
    setCredentials(updatedCredentials);

    if (errors[field]) {
      setErrors(validateCredentials(updatedCredentials));
    }

    if (submissionError) {
      setSubmissionError(null);
    }
  }

  function handleSubmit() {
    Keyboard.dismiss();
    setShowRecoveryMessage(false);

    const nextErrors = validateCredentials(credentials);
    setErrors(nextErrors);
    setSubmissionError(null);

    if (Object.keys(nextErrors).length > 0) {
      if (nextErrors.name) {
        nameInput.current?.focus();
      } else if (nextErrors.password) {
        passwordInput.current?.focus();
      } else {
        registrationInput.current?.focus();
      }
      return;
    }

    setIsSubmitting(true);
    submissionTimer.current = setTimeout(() => {
      setIsSubmitting(false);
      setSubmissionError(API_UNAVAILABLE_MESSAGE);
      submissionTimer.current = null;
    }, 650);
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoider}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <View style={styles.presentation}>
              <View style={styles.municipality}>
                <View style={styles.marker} />
                <Text style={styles.municipalityText}>REGISTRO • SP / VALE DO RIBEIRA</Text>
              </View>
              <Image
                accessibilityLabel="SmartTraffic"
                contentFit="contain"
                source={require('../../../assets/Assets/logo-smarttraffic.svg')}
                style={styles.logo}
                transition={180}
              />
              <Text accessibilityRole="header" style={styles.subtitle}>
                Monitoramento inteligente de tráfego
              </Text>
            </View>

            <View style={styles.form}>
              <LoginField
                autoCapitalize="words"
                autoComplete="name"
                error={errors.name}
                editable={!isSubmitting}
                label="Nome"
                placeholder="Seu nome completo"
                ref={nameInput}
                returnKeyType="next"
                textContentType="name"
                onChangeText={(value) => updateCredential('name', value)}
                onSubmitEditing={() => passwordInput.current?.focus()}
                value={credentials.name}
              />

              <LoginField
                autoCapitalize="none"
                autoComplete="password"
                error={errors.password}
                editable={!isSubmitting}
                label="Senha"
                placeholder="Digite sua senha"
                ref={passwordInput}
                returnKeyType="next"
                secureTextEntry={!isPasswordVisible}
                textContentType="password"
                trailing={
                  <LoginFieldAction
                    accessibilityLabel={isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}
                    onPress={() => setIsPasswordVisible((visible) => !visible)}>
                    <SymbolView
                      name={{
                        ios: isPasswordVisible ? 'eye' : 'eye.slash',
                        android: isPasswordVisible ? 'visibility' : 'visibility_off',
                        web: isPasswordVisible ? 'visibility' : 'visibility_off',
                      }}
                      size={Sizes.icon}
                      tintColor={AppColors.textSecondary}
                    />
                  </LoginFieldAction>
                }
                onChangeText={(value) => updateCredential('password', value)}
                onSubmitEditing={() => registrationInput.current?.focus()}
                value={credentials.password}
              />

              <LoginField
                autoCapitalize="none"
                autoComplete="off"
                error={errors.registrationNumber}
                editable={!isSubmitting}
                label="Número de matrícula"
                maxLength={9}
                placeholder="Ex.: 2024-0817"
                ref={registrationInput}
                returnKeyType="done"
                textContentType="none"
                onChangeText={(value) =>
                  updateCredential('registrationNumber', formatRegistrationNumber(value))
                }
                onSubmitEditing={handleSubmit}
                value={credentials.registrationNumber}
              />
              <Text style={styles.helperText}>Acesso restrito à equipe de operação.</Text>

              <Pressable
                accessibilityRole="button"
                disabled={isSubmitting}
                onPress={handleSubmit}
                style={({ pressed }) => [
                  styles.submitButton,
                  pressed && !isSubmitting && styles.submitButtonPressed,
                  isSubmitting && styles.submitButtonDisabled,
                ]}>
                {isSubmitting ? (
                  <>
                    <ActivityIndicator color={AppColors.onPrimary} size="small" />
                    <Text style={styles.submitLabel}>Carregando...</Text>
                  </>
                ) : (
                  <>
                    <SymbolView
                      name={{ ios: 'arrow.right', android: 'arrow_forward', web: 'arrow_forward' }}
                      size={Sizes.icon}
                      tintColor={AppColors.onPrimary}
                    />
                    <Text style={styles.submitLabel}>Entrar</Text>
                  </>
                )}
              </Pressable>
              {submissionError ? (
                <Animated.View
                  accessibilityLiveRegion="polite"
                  entering={FadeIn.duration(180)}
                  exiting={FadeOut.duration(180)}
                  layout={LinearTransition.duration(180)}>
                  <Text style={styles.submissionError}>{submissionError}</Text>
                </Animated.View>
              ) : null}
            </View>

            <View style={styles.recovery}>
              <Pressable
                accessibilityRole="button"
                hitSlop={Spacing.two}
                onPress={() => {
                  Keyboard.dismiss();
                  setShowRecoveryMessage((visible) => !visible);
                  setSubmissionError(null);
                }}
                style={({ pressed }) => pressed && styles.recoveryPressed}>
                <Text style={styles.recoveryLabel}>Esqueci minha senha</Text>
              </Pressable>
              {showRecoveryMessage ? (
                <Animated.View
                  accessibilityLiveRegion="polite"
                  entering={FadeIn.duration(180)}
                  exiting={FadeOut.duration(180)}
                  layout={LinearTransition.duration(180)}>
                  <Text style={styles.recoveryMessage}>
                    A recuperação de senha estará disponível após a integração com a API.
                  </Text>
                </Animated.View>
              ) : null}
            </View>

            <View style={styles.footer}>
              <View style={styles.footerBrand}>
                <SymbolView
                  name={{
                    ios: 'checkmark.shield',
                    android: 'verified_user',
                    web: 'verified_user',
                  }}
                  size={Sizes.icon}
                  tintColor={AppColors.textSecondary}
                />
                <Text style={styles.footerText}>SmarTraffic · Controle municipal</Text>
              </View>
              <Text style={styles.institutionText}>
                Faculdade de Tecnologia do Estado de São Paulo — Fatec Registro
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  keyboardAvoider: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: MaxAuthWidth,
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Layout.screenMargin,
  },
  presentation: {
    gap: Spacing.four,
    paddingTop: Spacing.two,
  },
  municipality: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  marker: {
    width: Sizes.icon,
    height: BorderWidth.focus,
    backgroundColor: AppColors.primary,
  },
  municipalityText: {
    ...Type.caption,
    color: AppColors.textSecondary,
  },
  logo: {
    width: '100%',
    maxWidth: Sizes.loginLogoWidth,
    height: Sizes.loginLogoHeight,
    alignSelf: 'center',
  },
  subtitle: {
    ...Type.loginSubtitle,
    color: AppColors.text,
  },
  form: {
    gap: Spacing.three,
  },
  helperText: {
    ...Type.body,
    color: AppColors.textSecondary,
    marginTop: -Spacing.two,
  },
  submitButton: {
    minHeight: Sizes.control,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
    borderWidth: BorderWidth.hairline,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
  },
  submitButtonPressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
  submitButtonDisabled: {
    opacity: 0.92,
  },
  submitLabel: {
    ...Type.button,
    color: AppColors.onPrimary,
  },
  submissionError: {
    ...Type.body,
    color: AppColors.error,
    textAlign: 'center',
  },
  recovery: {
    minHeight: Sizes.minTouch,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.two,
  },
  recoveryPressed: {
    opacity: 0.72,
  },
  recoveryLabel: {
    ...Type.button,
    color: AppColors.primary,
  },
  recoveryMessage: {
    ...Type.body,
    color: AppColors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    gap: Spacing.three,
    paddingBottom: Spacing.two,
  },
  footerBrand: {
    minHeight: Sizes.minTouch,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  footerText: {
    ...Type.body,
    color: AppColors.textSecondary,
  },
  institutionText: {
    ...Type.body,
    color: AppColors.textSecondary,
    textAlign: 'center',
  },
});
