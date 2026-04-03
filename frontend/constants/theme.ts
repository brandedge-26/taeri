/**
 * TAERI Blue Theme
 */

export const colors = {
  primary:      '#2563EB',
  primaryLight: '#3B82F6',
  primaryDark:  '#1D4ED8',
  primary50:    '#EFF6FF',
  primary100:   '#DBEAFE',
  primary200:   '#BFDBFE',
  primary300:   '#93C5FD',
  primary400:   '#60A5FA',
  primary500:   '#3B82F6',
  primary600:   '#2563EB',
  primary700:   '#1D4ED8',
  primary800:   '#1E40AF',
  primary900:   '#1E3A8A',

  accent:      '#0EA5E9',
  accentLight: '#38BDF8',
  accentDark:  '#0284C7',

  background:          '#F0F4FF',
  backgroundSecondary: '#E8EFFE',
  backgroundBlue:      '#2563EB',

  text:          '#0F172A',
  textSecondary: '#475569',
  textMuted:     '#94A3B8',
  textInverse:   '#FFFFFF',
  textBlue:      '#2563EB',

  border:      '#E2E8F0',
  borderLight: '#F1F5F9',
  borderBlue:  '#BFDBFE',

  success:      '#10B981',
  successLight: '#D1FAE5',
  successDark:  '#065F46',
  warning:      '#F59E0B',
  warningLight: '#FEF3C7',
  warningDark:  '#92400E',
  error:        '#EF4444',
  errorLight:   '#FEE2E2',
  errorDark:    '#991B1B',

  shadow:     '#2563EB',
  shadowDark: '#000000',

  overlay:     'rgba(37, 99, 235, 0.08)',
  overlayDark: 'rgba(0, 0, 0, 0.4)',
};

export const spacing = {
  xs:    4,
  sm:    8,
  md:    16,
  lg:    24,
  xl:    32,
  '2xl': 48,
  '3xl': 64,
};

export const radius = {
  xs:    4,
  sm:    8,
  md:    12,
  lg:    16,
  xl:    20,
  '2xl': 28,
  full:  9999,
};

export const shadows = {
  sm: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
  dark: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};

export const typography = {
  h1:        { fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
  h2:        { fontSize: 26, fontWeight: '700' as const, lineHeight: 34 },
  h3:        { fontSize: 22, fontWeight: '600' as const, lineHeight: 30 },
  h4:        { fontSize: 18, fontWeight: '600' as const, lineHeight: 26 },
  body:      { fontSize: 15, fontWeight: '400' as const, lineHeight: 24 },
  bodySmall: { fontSize: 13, fontWeight: '400' as const, lineHeight: 20 },
  label:     { fontSize: 14, fontWeight: '500' as const, lineHeight: 20 },
  caption:   { fontSize: 12, fontWeight: '400' as const, lineHeight: 18 },
};

export default { colors, spacing, radius, shadows, typography };
