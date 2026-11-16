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
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.avatar}>
            <Text style={styles.om}>ॐ</Text>
          </View>
          <View style={styles.flex}>
            <Text style={styles.name}>{settings.panditName}</Text>
            {settings.panditTitle ? <Text style={styles.title}>{settings.panditTitle}</Text> : null}
            {settings.experienceYears ? (
              <View style={styles.badge}>
                <Award size={12} color="#C65D24" />
                <Text style={styles.badgeText}>{settings.experienceYears}+ वर्ष का वैदिक अनुभव</Text>
              </View>
            ) : null}
          </View>
        </View>
        {settings.panditBio ? <Text style={styles.bio}>{settings.panditBio}</Text> : null}
        <View style={styles.actions}>
          {settings.consultation.enabled ? (
            <TouchableOpacity style={styles.primary} onPress={onBookAppointment} activeOpacity={0.85}>
              <CalendarCheck size={15} color="#FFF" />
              <Text style={styles.primaryText}>परामर्श बुक करें • {rupees(settings.consultation.fee)}</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={styles.secondary}
            onPress={() => contact.chat('Pranam Pandit Ji, I would like to talk to you.')}
            activeOpacity={0.85}
            accessibilityLabel="Message on WhatsApp"
          >
            <MessageCircle size={17} color="#15803D" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, marginVertical: 6 },
  card: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EBE3D8',
    shadowColor: '#382016',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  flex: { flex: 1 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FDF2E9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#F3DCB0',
  },
  om: { fontSize: 28, color: '#C65D24', lineHeight: 36 },
  name: { fontSize: 17, fontWeight: '700', color: '#2A170F', fontFamily: THEME.typography.serif },
  title: { fontSize: 12, color: '#C65D24', marginTop: 2, fontWeight: '600' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 5,
    backgroundColor: '#FAF5ED',
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F0E5D4',
  },
  badgeText: { fontSize: 10.5, color: '#8C5A24', fontWeight: '600' },
  bio: { fontSize: 12, color: '#594D44', marginTop: 10, lineHeight: 17 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  primary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#C65D24',
    borderRadius: 12,
    paddingVertical: 11,
  },
  primaryText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  secondary: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E6F4EA',
    borderWidth: 1,
    borderColor: '#C6E8CF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
