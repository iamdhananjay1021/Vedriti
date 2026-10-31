import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Award, CalendarCheck, MessageCircle } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { useAppData } from '../../context/AppDataContext';
import { useContact } from '../../hooks/useContact';
import { rupees } from '../../utils/format';

interface Props {
  onBookAppointment: () => void;
}

export const PanditProfileSection: React.FC<Props> = ({ onBookAppointment }) => {
  const { settings } = useAppData();
  const contact = useContact();
  if (!settings) return null;

  return (
    <View style={styles.container}>
      <LinearGradient colors={THEME.gradients.divineSanctum} style={styles.card}>
        <View style={styles.row}>
          <View style={styles.avatar}>
            <Text style={styles.om}>ॐ</Text>
          </View>
          <View style={styles.flex}>
            <Text style={styles.name}>{settings.panditName}</Text>
            {settings.panditTitle ? <Text style={styles.title}>{settings.panditTitle}</Text> : null}
            {settings.experienceYears ? (
              <View style={styles.badge}>
                <Award size={12} color={THEME.colors.gold} />
                <Text style={styles.badgeText}>{settings.experienceYears}+ years experience</Text>
              </View>
            ) : null}
          </View>
        </View>
        {settings.panditBio ? <Text style={styles.bio}>{settings.panditBio}</Text> : null}
        <View style={styles.actions}>
          {settings.consultation.enabled ? (
            <TouchableOpacity style={styles.primary} onPress={onBookAppointment} activeOpacity={0.85}>
              <CalendarCheck size={15} color="#FFF" />
              <Text style={styles.primaryText}>Book Appointment • {rupees(settings.consultation.fee)}</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={styles.secondary}
            onPress={() => contact.chat('Pranam Pandit Ji, I would like to talk to you.')}
            activeOpacity={0.85}
            accessibilityLabel="Message on WhatsApp"
          >
            <MessageCircle size={16} color={THEME.colors.goldLight} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, marginVertical: 14 },
  card: { borderRadius: 22, padding: 18 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  flex: { flex: 1 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: THEME.colors.primarySaffron,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: THEME.colors.gold,
  },
  om: { fontSize: 34, color: '#FFF8E7', lineHeight: 44 },
  name: { fontSize: 19, fontWeight: '800', color: '#FFF8E7', fontFamily: THEME.typography.serif },
  title: { fontSize: 12.5, color: THEME.colors.goldLight, marginTop: 2 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  badgeText: { fontSize: 11.5, color: THEME.colors.gold, fontWeight: '700' },
  bio: { fontSize: 13, color: '#E9DCCB', marginTop: 12, lineHeight: 19 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  primary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: THEME.colors.primarySaffron,
    borderRadius: 999,
    paddingVertical: 12,
  },
  primaryText: { color: '#FFF', fontWeight: '800', fontSize: 13.5 },
  secondary: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: THEME.colors.goldFoil,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
