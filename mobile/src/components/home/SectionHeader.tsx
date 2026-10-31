import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { THEME } from '../../constants/theme';
import { SPACE, TYPE } from '../../constants/ui';

interface Props {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const SectionHeader: React.FC<Props> = ({ title, subtitle, actionLabel, onAction }) => (
  <View style={styles.row}>
    <View style={styles.text}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
    {actionLabel && onAction ? (
      <TouchableOpacity onPress={onAction} hitSlop={8} accessibilityRole="button" accessibilityLabel={actionLabel}>
        <Text style={styles.action}>{actionLabel}</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: SPACE.lg, marginBottom: SPACE.md },
  text: { flex: 1, paddingRight: SPACE.md },
  title: TYPE.section,
  subtitle: { ...TYPE.caption, marginTop: 2 },
  action: { fontSize: 13, fontWeight: '800', color: THEME.colors.primarySaffron },
});
