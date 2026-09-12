// ============================================================================
// BlackSentinel Forge - Design System Constants
// ============================================================================

export const COLORS = {
  // Core palette
  black: '#0B0B0B',
  blackSecondary: '#141414',
  grayDark: '#232323',
  grayMedium: '#3C3C3C',
  grayLight: '#D9D9D9',
  white: '#FFFFFF',

  // Brand
  orange: '#FF6B00',
  orangeBright: '#FF8C1A',

  // Semantic
  red: '#EF4444',
  green: '#22C55E',
  blue: '#3B82F6',
  yellow: '#FACC15',

  // Extended
  purple: '#A855F7',
  cyan: '#06B6D4',
  pink: '#EC4899',
  indigo: '#6366F1',

  // Alpha variants
  blackAlpha: {
    50: 'rgba(11, 11, 11, 0.05)',
    100: 'rgba(11, 11, 11, 0.1)',
    200: 'rgba(11, 11, 11, 0.2)',
    300: 'rgba(11, 11, 11, 0.3)',
    500: 'rgba(11, 11, 11, 0.5)',
    700: 'rgba(11, 11, 11, 0.7)',
    900: 'rgba(11, 11, 11, 0.9)',
  },
  orangeAlpha: {
    10: 'rgba(255, 107, 0, 0.1)',
    20: 'rgba(255, 107, 0, 0.2)',
    30: 'rgba(255, 107, 0, 0.3)',
    50: 'rgba(255, 107, 0, 0.5)',
  },
} as const;

export const THEME = {
  dark: {
    bg: {
      primary: COLORS.black,
      secondary: COLORS.blackSecondary,
      tertiary: COLORS.grayDark,
      elevated: COLORS.grayDark,
    },
    text: {
      primary: COLORS.white,
      secondary: COLORS.grayLight,
      muted: COLORS.grayMedium,
    },
    border: {
      primary: COLORS.grayMedium,
      secondary: COLORS.grayDark,
      focus: COLORS.orange,
    },
  },
  light: {
    bg: {
      primary: COLORS.white,
      secondary: '#F5F5F5',
      tertiary: '#E5E5E5',
      elevated: COLORS.white,
    },
    text: {
      primary: COLORS.black,
      secondary: '#525252',
      muted: '#A3A3A3',
    },
    border: {
      primary: '#E5E5E5',
      secondary: '#D4D4D4',
      focus: COLORS.orange,
    },
  },
} as const;

export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
} as const;

export const RADIUS = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
} as const;

export const SHADOWS = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
  md: '0 4px 6px rgba(0, 0, 0, 0.4)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.5)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.6)',
  glow: '0 0 20px rgba(255, 107, 0, 0.3)',
  glowStrong: '0 0 40px rgba(255, 107, 0, 0.5)',
} as const;

export const ANIMATIONS = {
  duration: {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
    slower: '500ms',
  },
  easing: {
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
} as const;

export const TYPOGRAPHY = {
  fontFamily: {
    sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"JetBrains Mono", "Fira Code", monospace',
    display: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
} as const;

export const Z_INDEX = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  toast: 1700,
  tooltip: 1800,
} as const;
