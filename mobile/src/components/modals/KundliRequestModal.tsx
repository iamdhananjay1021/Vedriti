import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
} from 'react-native';
import { X, CheckCircle2, Upload, FileText, Sparkles, ShieldCheck } from 'lucide-react-native';
import { THEME } from '../../constants/theme';

interface KundliRequestModalProps {
  visible: boolean;
  onClose: () => void;
  onRequestSubmitted: (reportId: string) => void;
}

export const KundliRequestModal: React.FC<KundliRequestModalProps> = ({
  visible,
  onClose,
  onRequestSubmitted,
}) => {
  const [fullName, setFullName] = useState('Anand Sharma');
  const [dob, setDob] = useState('14 May 1994');
  const [tob, setTob] = useState('06:45 AM');
  const [pob, setPob] = useState('New Delhi, India');
  const [query, setQuery] = useState('Career guidance & auspicious timing for property registration.');
  const [hasUploadedDoc, setHasUploadedDoc] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onRequestSubmitted('VR-KUNDLI-' + Math.floor(100 + Math.random() * 900));
        onClose();
      }, 1800);
    }, 1200);
  };

  const handleResetClose = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.sheetContainer}>
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.eyebrow}>Vedic Jyotish Consultation</Text>
              <Text style={styles.sheetTitle}>Request Kundli Guidance</Text>
            </View>
            <TouchableOpacity onPress={handleResetClose} style={styles.closeCircle}>
              <X size={18} color="#4A3B32" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {isSuccess ? (
              <View style={styles.confirmState}>
                <View style={styles.successIconCircle}>
                  <CheckCircle2 size={42} color="#16A34A" />
                </View>
                <Text style={styles.confirmTitle}>Consultation Request Received!</Text>
                <Text style={styles.confirmDesc}>
                  Our Pandit Ji is personally analyzing your planetary chart. You will receive a detailed report and telephonic consultation slot within 24 hours.
                </Text>
              </View>
            ) : (
              <View style={styles.formContent}>
                {/* Visual Banner */}
                <View style={styles.bannerRow}>
                  <Image source={THEME.assets.bannerKundli} style={styles.chartImage} resizeMode="contain" />
                  <View style={styles.bannerTextCol}>
                    <Text style={styles.bannerHeading}>Personalized Astrological Analysis</Text>
                    <Text style={styles.bannerDesc}>
                      Direct guidance from {THEME.brand.singlePanditTitle} using Vedic Parashari Principles.
                    </Text>
                  </View>
                </View>

                {/* Form Fields */}
                <Text style={styles.inputSectionLabel}>Devotee Birth Details</Text>

                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Full Name (यजमान का नाम)"
                  style={styles.textInput}
                />

                <View style={styles.rowTwo}>
                  <TextInput
                    value={dob}
                    onChangeText={setDob}
                    placeholder="Date of Birth (DD/MM/YYYY)"
                    style={[styles.textInput, styles.halfInput]}
                  />
                  <TextInput
                    value={tob}
                    onChangeText={setTob}
                    placeholder="Time of Birth (e.g. 06:45 AM)"
                    style={[styles.textInput, styles.halfInput]}
                  />
                </View>

                <TextInput
                  value={pob}
                  onChangeText={setPob}
                  placeholder="Place of Birth (City, State, Country)"
                  style={styles.textInput}
                />

                <Text style={styles.inputSectionLabel}>Specific Query or Concern</Text>
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Describe your questions (Career, Health, Marriage, Vastu...)"
                  multiline
                  numberOfLines={3}
                  style={[styles.textInput, { height: 75, textAlignVertical: 'top' }]}
                />

                {/* Optional Document Upload */}
                <Text style={styles.inputSectionLabel}>Or Upload Existing Kundli (Optional)</Text>
                <TouchableOpacity
                  onPress={() => setHasUploadedDoc(!hasUploadedDoc)}
                  activeOpacity={0.8}
                  style={[styles.uploadBox, hasUploadedDoc && styles.uploadBoxActive]}
                >
                  {hasUploadedDoc ? (
                    <View style={styles.uploadedRow}>
                      <FileText size={20} color="#16A34A" />
                      <Text style={styles.uploadedText}>Kundli_Document_Scan.pdf attached</Text>
                    </View>
                  ) : (
                    <View style={styles.uploadPlaceholder}>
                      <Upload size={18} color="#C65D24" />
                      <Text style={styles.uploadText}>Tap to attach Kundli PDF or Photo</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <View style={styles.privacyNote}>
                  <ShieldCheck size={14} color="#8A8177" />
                  <Text style={styles.privacyText}>
                    100% confidential. Your birth charts are never shared with any third parties.
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                  activeOpacity={0.85}
                  style={styles.mainCtaButton}
                >
                  <Sparkles size={16} color="#FFF" />
                  <Text style={[styles.mainCtaText, { marginLeft: 8 }]}>
                    {isSubmitting ? 'Submitting Details...' : 'Request Consultation  →'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3EAE0',
    backgroundColor: '#FCFAF7',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
  },
  eyebrow: {
    fontSize: 10.5,
    fontWeight: '700',
    color: THEME.colors.primarySaffron,
    textTransform: 'uppercase',
  },
  sheetTitle: {
    fontFamily: THEME.typography.serif,
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.heading,
    marginTop: 2,
  },
  closeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFEAE2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  formContent: {
    paddingBottom: 24,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF6EE',
    borderWidth: 1,
    borderColor: '#EEDDC9',
    borderRadius: 16,
    padding: 10,
    marginBottom: 16,
  },
  chartImage: {
    width: 60,
    height: 60,
  },
  bannerTextCol: {
    flex: 1,
    marginLeft: 10,
  },
  bannerHeading: {
    fontSize: 12.5,
    fontWeight: '700',
    color: THEME.colors.heading,
  },
  bannerDesc: {
    fontSize: 11,
    color: THEME.colors.mutedText,
    marginTop: 2,
  },
  inputSectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.heading,
    marginBottom: 6,
    marginTop: 6,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 12,
    color: THEME.colors.heading,
    marginBottom: 8,
  },
  rowTwo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48.5%',
  },
  uploadBox: {
    backgroundColor: '#FAF7F0',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#D4C4B5',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  uploadBoxActive: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  uploadPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 11.5,
    color: THEME.colors.primarySaffron,
    fontWeight: '600',
    marginLeft: 6,
  },
  uploadedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploadedText: {
    fontSize: 11.5,
    color: '#16A34A',
    fontWeight: '600',
    marginLeft: 6,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  privacyText: {
    fontSize: 10.5,
    color: THEME.colors.mutedText,
    marginLeft: 6,
    flex: 1,
  },
  mainCtaButton: {
    backgroundColor: THEME.colors.primarySaffron,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C65D24',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 6,
  },
  mainCtaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  confirmState: {
    alignItems: 'center',
    paddingVertical: 36,
  },
  successIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  confirmTitle: {
    fontFamily: THEME.typography.serif,
    fontSize: 20,
    fontWeight: '700',
    color: THEME.colors.heading,
    marginBottom: 8,
  },
  confirmDesc: {
    fontSize: 12.5,
    lineHeight: 18,
    color: THEME.colors.bodyText,
    textAlign: 'center',
    paddingHorizontal: 14,
  },
});
