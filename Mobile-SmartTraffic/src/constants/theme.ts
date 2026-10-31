/**
 * Design system do SmartTraffic Mobile (fonte única de verdade).
 *
 * Origem: protótipo de alta fidelidade no Figma (app 100% escuro).
 * Valores CONFIRMADOS no Figma: paleta de marca (#181C2B / #EBEAEB / #FBC117),
 * Michroma (marca) + Outfit (interface), grade de 4 colunas (margem 20, gutter 16),
 * espaçamento 4/8, toque >= 44, raio 6 e borda 1 nos controles.
 * Valores marcados como "estimado" foram lidos de imagens e devem ser conferidos
 * com as variáveis do Figma (get_variable_defs) antes de serem tratados como finais.
 *
 * Regra: nenhuma tela ou componente usa cor, fonte, tamanho ou raio literal.
 * Tudo vem daqui.
 */

import { Platform } from 'react-native';

/* ------------------------------------------------------------------ */
/* Utilitário                                                          */
/* ------------------------------------------------------------------ */

/** Converte "#RRGGBB" em rgba() com a opacidade informada. */
const withAlpha = (hex: string, opacity: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${opacity})`;
};

/* ------------------------------------------------------------------ */
/* Cores                                                               */
/* ------------------------------------------------------------------ */

const dark = {
  // Texto
  text: '#EBEAEB', // marca (30%)
  textSecondary: '#A3A8B8', // estimado
  textMuted: '#7C8296', // placeholder e metadados — estimado
  textDisabled: '#5E6477', // estimado

  // Superfícies (nomes mantidos do template)
  background: '#181C2B', // marca (60%) — fundo das telas
  backgroundElement: '#222738', // cards, inputs, bottom sheet — estimado
  backgroundSelected: '#2A3043', // pressionado, desabilitado, chip inativo — estimado

  // Bordas
  border: '#2E3447', // estimado
  borderStrong: '#434B63', // estimado

  // Ação principal
  primary: '#FBC117', // marca (10%)
  primaryPressed: '#DBA914', // estimado
  onPrimary: '#181C2B', // texto sobre o amarelo

  // Feedback
  error: '#F27C7C', // estimado
  success: '#5FD08A', // estimado
  warning: '#F59E42', // estimado
  info: '#8DB6F5', // estimado
} as const;

/**
 * O app é somente escuro. `light` espelha `dark` apenas para manter compatível
 * o código do template do Expo (useTheme / ThemedText / ThemedView).
 */
export const Colors = {
  dark,
  light: dark,
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** Atalho para uso nas telas e componentes: AppColors.primary, AppColors.text... */
export const AppColors = Colors.dark;

/* ------------------------------------------------------------------ */
/* Status e prioridade (badges, pins do mapa, textos de estado)        */
/* Status nunca é indicado só por cor: sempre ponto/ícone + texto.     */
/* ------------------------------------------------------------------ */

const badge = (fg: string) => ({ fg, bg: withAlpha(fg, 0.14) }) as const;

export const StatusColors = {
  /** Câmera: Online / Offline / Manutenção */
  camera: {
    online: badge('#5FD08A'),
    offline: badge('#F27C7C'),
    maintenance: badge('#F59E42'),
  },
  /** Chamado: Aberto / Em andamento / Concluído */
  ticket: {
    open: badge('#FBC117'),
    inProgress: badge('#8DB6F5'),
    done: badge('#5FD08A'),
  },
  /** Prioridade: Baixa / Média / Alta / Crítica */
  priority: {
    low: badge('#9AA0B2'),
    medium: badge('#FBC117'),
    high: badge('#F59E42'),
    critical: badge('#F27C7C'),
  },
} as const;

/* ------------------------------------------------------------------ */
/* Gráficos (linha, barras de densidade, rosca)                        */
/* ------------------------------------------------------------------ */

export const ChartColors = {
  line: '#FBC117',
  grid: '#2E3447',
  barHigh: '#FBC117', // densidade alta
  barModerate: '#8E94A8', // densidade moderada — estimado
  barTrack: '#2A3043',
  fleet: {
    cars: '#EBEAEB',
    motorcycles: '#8E94A8',
    buses: '#C9A93F',
    trucks: '#FBC117',
  },
} as const;

/* ------------------------------------------------------------------ */
/* Tipografia                                                          */
/* Michroma: SOMENTE marca (wordmark). Outfit: toda a interface.       */
/* Nomes de família seguem os pacotes @expo-google-fonts/outfit e      */
/* @expo-google-fonts/michroma (carregar com useFonts no _layout).     */
/* ------------------------------------------------------------------ */

export const Fonts = {
  brand: 'Michroma_400Regular',
  regular: 'Outfit_400Regular',
  medium: 'Outfit_500Medium',
  semibold: 'Outfit_600SemiBold',
  bold: 'Outfit_700Bold',

  // Compatibilidade com componentes do template (remover quando não forem usados)
  sans: 'Outfit_400Regular',
  serif: 'Outfit_400Regular',
  rounded: 'Outfit_600SemiBold',
  mono: Platform.select({ ios: 'ui-monospace', default: 'monospace' }),
} as const;

/** Escala tipográfica (tamanhos estimados a partir das imagens). */
export const Type = {
  brand: { fontFamily: Fonts.brand, fontSize: 24, lineHeight: 32 },
  display: { fontFamily: Fonts.semibold, fontSize: 28, lineHeight: 34 }, // KPIs: 42/48, 18.420
  title: { fontFamily: Fonts.semibold, fontSize: 22, lineHeight: 28 }, // título de tela
  heading: { fontFamily: Fonts.semibold, fontSize: 16, lineHeight: 22 }, // título de card/seção
  body: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20 },
  bodyStrong: { fontFamily: Fonts.medium, fontSize: 14, lineHeight: 20 },
  button: { fontFamily: Fonts.semibold, fontSize: 16, lineHeight: 20 },
  label: { fontFamily: Fonts.medium, fontSize: 12, lineHeight: 16 }, // rótulo de campo, badge
  caption: { fontFamily: Fonts.regular, fontSize: 12, lineHeight: 16 }, // metadados
  micro: { fontFamily: Fonts.regular, fontSize: 10, lineHeight: 14 }, // legendas de gráfico
} as const;

/* ------------------------------------------------------------------ */
/* Espaçamento, grade, raios e tamanhos                                */
/* ------------------------------------------------------------------ */

/** Escala 4/8. Nomes mantidos do template. */
export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

/** Grade mobile do Figma: 4 colunas, margens 20, gutter 16. */
export const Layout = {
  columns: 4,
  screenMargin: 20,
  gutter: 16,
} as const;

export const Radius = {
  sm: 4, // badges — estimado
  md: 6, // botões, inputs, chips (confirmado: raio 6)
  lg: 8, // cards — estimado
  xl: 16, // bottom sheet — estimado
  full: 999, // avatar, pins
} as const;

export const BorderWidth = {
  hairline: 1, // confirmado: borda 1 px
  focus: 2, // anel de foco do input e pin selecionado — estimado
} as const;

export const Sizes = {
  minTouch: 44, // confirmado: toque >= 44 px (chips e alvos pequenos)
  control: 48, // altura de botão e input — estimado
  avatar: 48, // estimado
  icon: 20, // estimado
} as const;

/* ------------------------------------------------------------------ */
/* Navegação e conteúdo (do template)                                  */
/* ------------------------------------------------------------------ */

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;