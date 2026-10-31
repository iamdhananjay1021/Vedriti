import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MessageCircle, PhoneCall } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { RADIUS, SPACE, TYPE } from '../../constants/ui';
import { useContact } from '../../hooks/useContact';

export const SupportCard: React.FC = () => {
  const contact = useContact();

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <View style={styles.text}>
          <Text style={styles.title}>Need help choosing a puja?</Text>
          <Text style={styles.subtitle}>Ask Pandit Ji about muhurat, sankalp or samagri.</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.call} onPress={contact.call} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel="Call Pandit Ji">
            <PhoneCall size={18} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.chat}
            onPress={() => contact.chat('Pranam Pandit Ji, I need guidance regarding puja muhurat.')}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Message on WhatsApp"
          >
            <MessageCircle size={18} color="#15803D" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: SPACE.lg },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE.md,
    backgroundColor: '#FFF',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: THEME.colors.borderLight,
    padding: SPACE.lg,
  },
  text: { flex: 1 },
  title: TYPE.cardTitle,
  subtitle: { ...TYPE.caption, marginTop: 2 },
  actions: { flexDirection: 'row', gap: SPACE.sm },
  call: { width: 44, height: 44, borderRadius: 22, backgroundColor: THEME.colors.primarySaffron, alignItems: 'center', justifyContent: 'center' },
  chat: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E6F4EA', alignItems: 'center', justifyContent: 'center' },
});
