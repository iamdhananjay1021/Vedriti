import { Platform } from 'react-native';
import { THEME } from './theme';

export const SPACE = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 } as const;

export const RADIUS = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 } as const;

export const TYPE = {
  title: { fontSize: 22, fontWeight: '700' as const, color: THEME.colors.heading, letterSpacing: -0.2 },
  section: { fontSize: 17, fontWeight: '700' as const, color: THEME.colors.heading, letterSpacing: -0.1 },
  cardTitle: { fontSize: 14.5, fontWeight: '600' as const, color: THEME.colors.heading, lineHeight: 20 },
  body: { fontSize: 13.5, fontWeight: '400' as const, color: THEME.colors.bodyText, lineHeight: 19 },
  caption: { fontSize: 11.5, fontWeight: '500' as const, color: THEME.colors.mutedText, lineHeight: 16 },
  label: { fontSize: 10.5, fontWeight: '600' as const, letterSpacing: 0.4, textTransform: 'uppercase' as const },
  price: { fontSize: 16, fontWeight: '700' as const, color: THEME.colors.heading },
};

export const SHADOW = Platform.select({
  ios: { shadowColor: '#382016', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  default: { elevation: 1, shadowColor: '#382016', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4 },
});
