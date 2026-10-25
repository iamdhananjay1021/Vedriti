import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { X, PhoneCall, MessageSquare, ShieldCheck } from 'lucide-react-native';
import { THEME } from '../../constants/theme';

interface SupportModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ visible, onClose }) => {
  const handleCall = () => {
    Linking.openURL(`tel:${THEME.brand.phone}`).catch(() => {
      Alert.alert('Calling Pandit Ji', `Dial: ${THEME.brand.phone}`);
    });
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Pranam Acharya Ji, I would like guidance on booking an auspicious Vedic puja with VedRiti.`
    );
    Linking.openURL(`whatsapp://send?phone=${THEME.brand.whatsapp}&text=${text}`).catch(() => {
      Alert.alert(
        'WhatsApp Support',
        `Send message to Pandit Ji at ${THEME.brand.phone}`
      );
    });
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Connect with Pandit Ji</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#4A3B32" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Speak directly with {THEME.brand.singlePanditTitle} for muhurat consulting, personalized rituals, or samagri questions.
          </Text>

          {/* Action 1: Call */}
          <TouchableOpacity
            onPress={handleCall}
            activeOpacity={0.85}
            style={styles.actionBtnCall}
          >
            <PhoneCall size={18} color="#FFFFFF" />
            <View style={styles.btnTextCol}>
              <Text style={styles.btnTitleWhite}>Direct Call</Text>
              <Text style={styles.btnDescWhite}>{THEME.brand.phone}</Text>
            </View>
          </TouchableOpacity>

          {/* Action 2: WhatsApp */}
          <TouchableOpacity
            onPress={handleWhatsApp}
            activeOpacity={0.85}
            style={styles.actionBtnWhatsApp}
          >
            <MessageSquare size={18} color="#16A34A" />
            <View style={styles.btnTextCol}>
              <Text style={styles.btnTitleGreen}>WhatsApp Chat</Text>
              <Text style={styles.btnDescGreen}>Fast response on WhatsApp</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.footerNote}>
            <ShieldCheck size={14} color="#8A8177" />
            <Text style={styles.footerText}>
              Available 7:00 AM – 9:00 PM IST daily
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    shadowColor: '#382016',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontFamily: THEME.typography.serif,
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.heading,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFEAE2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 17,
    color: THEME.colors.bodyText,
    marginBottom: 18,
  },
  actionBtnCall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.primarySaffron,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  btnTextCol: {
    marginLeft: 12,
  },
  btnTitleWhite: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  btnDescWhite: {
    fontSize: 11,
    color: '#FDEEE2',
  },
  actionBtnWhatsApp: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  btnTitleGreen: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16A34A',
  },
  btnDescGreen: {
    fontSize: 11,
    color: '#15803D',
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 11,
    color: THEME.colors.mutedText,
    marginLeft: 6,
  },
});
