import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Megaphone } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { RADIUS, SPACE } from '../../constants/ui';

export const AnnouncementStrip: React.FC<{ text: string }> = ({ text }) => (
  <View style={styles.wrap}>
    <View style={styles.strip}>
      <Megaphone size={16} color={THEME.colors.deepTerracotta} />
      <Text style={styles.text}>{text}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: SPACE.lg },
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE.sm,
    backgroundColor: THEME.colors.softSaffronBg,
    borderWidth: 1,
    borderColor: '#F3D9BC',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACE.md,
    paddingVertical: 10,
  },
  text: { flex: 1, fontSize: 13, fontWeight: '600', color: THEME.colors.deepTerracotta, lineHeight: 18 },
});
