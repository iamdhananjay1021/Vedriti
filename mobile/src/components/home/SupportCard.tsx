import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { PhoneCall, MessageCircle, ShieldCheck } from 'lucide-react-native';
import { THEME } from '../../constants/theme';

interface SupportCardProps {
  onContactPress: () => void;
}

export const SupportCard: React.FC<SupportCardProps> = ({ onContactPress }) => {
  const handleWhatsApp = () => {
    Linking.openURL(
      `whatsapp://send?phone=${THEME.brand.whatsapp}&text=Pranam%20Acharya%20Ji,%20I%20need%20guidance%20regarding%20Vedic%20Puja%20Muhurat.`
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.badgeRow}>
          <ShieldCheck size={13} color="#C65D24" />
          <Text style={styles.badgeText}>VEDIC CONCIERGE & SEVA</Text>
        </View>

        <Text style={styles.heading}>Need Guidance on Puja or Muhurat?</Text>
        <Text style={styles.description}>
          Our revered Senior Acharyas personally consult with you on Gotra sankalp, birth star muhurat, and ritual samagri preparations.
        </Text>

        <View style={styles.buttonsRow}>
          <TouchableOpacity
            onPress={onContactPress}
            activeOpacity={0.85}
            style={styles.callButton}
            accessibilityLabel="Call Acharya Helpline"
          >
            <PhoneCall size={13} color="#FFFFFF" strokeWidth={2.2} />
            <Text style={styles.callButtonText}>Call Acharya Ji</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleWhatsApp}
            activeOpacity={0.85}
            style={styles.waButton}
            accessibilityLabel="Chat on WhatsApp"
          >
            <MessageCircle size={13} color="#15803D" strokeWidth={2.2} />
            <Text style={styles.waButtonText}>WhatsApp Concierge</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EFE7DD',
    padding: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 4,
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#C65D24',
    letterSpacing: 0.5,
  },
  heading: {
    fontFamily: THEME.typography.serif,
    fontSize: 16,
    fontWeight: '800',
    color: '#2A170F',
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  description: {
    fontSize: 11.5,
    lineHeight: 16,
    color: '#786B60',
    marginBottom: 14,
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C65D24',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    flex: 1,
    gap: 6,
  },
  callButtonText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  waButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    flex: 1,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    gap: 6,
  },
  waButtonText: {
    color: '#15803D',
    fontSize: 11.5,
    fontWeight: '800',
  },
});
