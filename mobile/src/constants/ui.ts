import { Platform } from 'react-native';
import { THEME } from './theme';

export const SPACE = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 } as const;

export const RADIUS = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 } as const;

export const TYPE = {
  title: { fontSize: 24, fontWeight: '800' as const, color: THEME.colors.heading, letterSpacing: -0.3 },
  section: { fontSize: 18, fontWeight: '800' as const, color: THEME.colors.heading, letterSpacing: -0.2 },
  cardTitle: { fontSize: 15, fontWeight: '700' as const, color: THEME.colors.heading, lineHeight: 20 },
  body: { fontSize: 14, fontWeight: '400' as const, color: THEME.colors.bodyText, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '500' as const, color: THEME.colors.mutedText, lineHeight: 16 },
  label: { fontSize: 11, fontWeight: '800' as const, letterSpacing: 0.6, textTransform: 'uppercase' as const },
  price: { fontSize: 17, fontWeight: '800' as const, color: THEME.colors.heading },
};

export const SHADOW = Platform.select({
  ios: { shadowColor: '#382016', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14 },
  default: { elevation: 3, shadowColor: '#382016' },
});
