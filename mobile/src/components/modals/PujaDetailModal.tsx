import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
} from 'react-native';
import { X, CheckCircle2, Clock, Calendar, Check, ShieldCheck, CalendarClock } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { Puja, PujaPackage } from '../../data/mockData';

interface PujaDetailModalProps {
  puja: Puja | null;
  selectedPackage?: PujaPackage | null;
  initialStep?: 'details' | 'datetime';
  visible: boolean;
  onClose: () => void;
  onBookingSuccess: (bookingId: string) => void;
}

export const PujaDetailModal: React.FC<PujaDetailModalProps> = ({
  puja,
  selectedPackage,
  initialStep = 'datetime',
  visible,
  onClose,
  onBookingSuccess,
}) => {
  const [step, setStep] = useState<'details' | 'datetime' | 'confirm'>(initialStep);
  const [selectedDate, setSelectedDate] = useState('18 Oct 2026');
  const [selectedSlot, setSelectedSlot] = useState('09:00 AM - 11:30 AM (Shubh Muhurat)');
  const [devoteeName, setDevoteeName] = useState('Anand Sharma');
  const [gotra, setGotra] = useState('Kashyap');
  const [address, setAddress] = useState('Sector 62, Noida');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setStep(initialStep);
    }
  }, [visible, initialStep]);

  if (!puja) return null;

  const currentPrice = selectedPackage?.price ?? puja.startingPrice;
  const currentPackageName = selectedPackage?.name ?? 'Pandit Ji Only';

  const dates = ['18 Oct 2026', '19 Oct 2026', '20 Oct 2026', '21 Oct 2026'];
  const slots = [
    '07:30 AM - 09:30 AM (Brahma Muhurat)',
    '09:00 AM - 11:30 AM (Shubh Muhurat)',
    '04:30 PM - 06:30 PM (Sandhya)',
  ];

  const handleBook = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('confirm');
      setTimeout(() => {
        setStep(initialStep);
        onBookingSuccess('VR-' + Math.floor(1000 + Math.random() * 9000));
        onClose();
      }, 1800);
    }, 1200);
  };

  const handleResetClose = () => {
    setStep(initialStep);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.eyebrow}>
                {step === 'details'
                  ? 'Puja Details & Vidhi'
                  : step === 'datetime'
                  ? 'Date, Muhurat & Sankalp'
                  : 'Booking Confirmed'}
              </Text>
              <Text style={styles.sheetTitle} numberOfLines={1}>{puja.name}</Text>
            </View>
            <TouchableOpacity onPress={handleResetClose} style={styles.closeCircle}>
              <X size={18} color="#4A3B32" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {step === 'confirm' ? (
              <View style={styles.confirmState}>
                <View style={styles.successIconCircle}>
                  <CheckCircle2 size={42} color="#16A34A" />
                </View>
                <Text style={styles.confirmTitle}>Sankalp Request Received!</Text>
                <Text style={styles.confirmDesc}>
                  Our Pandit Ji has received your booking request for {selectedDate} ({selectedSlot}). Pandit Ji will verify the availability and send preparation guidelines.
                </Text>
              </View>
            ) : step === 'datetime' ? (
              <View style={styles.formContainer}>
                {/* Package Summary Badge */}
                <View style={styles.packageSummaryBadge}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.packageSummaryLabel}>Selected Service Package</Text>
                    <Text style={styles.packageSummaryName}>{currentPackageName}</Text>
                  </View>
                  <Text style={styles.packageSummaryPrice}>₹{currentPrice.toLocaleString('en-IN')}</Text>
                </View>

                {/* Select Date */}
                <Text style={styles.inputSectionLabel}>Select Preferred Date</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
                  {dates.map((d) => (
                    <TouchableOpacity
                      key={d}
                      onPress={() => setSelectedDate(d)}
                      style={[
                        styles.dateChip,
                        selectedDate === d && styles.activeDateChip,
                      ]}
                    >
                      <Calendar size={13} color={selectedDate === d ? '#FFF' : '#C65D24'} />
                      <Text
                        style={[
                          styles.dateChipText,
                          selectedDate === d && styles.activeDateChipText,
                        ]}
                      >
                        {d}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Select Muhurat / Time Slot */}
                <Text style={styles.inputSectionLabel}>Select Muhurat / Time Slot</Text>
                {slots.map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setSelectedSlot(s)}
                    style={[
                      styles.slotOption,
                      selectedSlot === s && styles.activeSlotOption,
                    ]}
                  >
                    <Clock size={14} color={selectedSlot === s ? '#C65D24' : '#8A8177'} />
                    <Text
                      style={[
                        styles.slotText,
                        selectedSlot === s && styles.activeSlotText,
                      ]}
                    >
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}

                {/* Devotee Details */}
                <Text style={[styles.inputSectionLabel, { marginTop: 12 }]}>
                  Sankalp Details (यजमान संकल्प)
                </Text>
                <TextInput
                  value={devoteeName}
                  onChangeText={setDevoteeName}
                  placeholder="Devotee Full Name"
                  style={styles.textInput}
                />
                <TextInput
                  value={gotra}
                  onChangeText={setGotra}
                  placeholder="Gotra (Keep Kashyap if unknown)"
                  style={styles.textInput}
                />
                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Puja Location Address"
                  style={styles.textInput}
                />

                {/* Availability Notice */}
                <View style={styles.panditNotice}>
                  <CalendarClock size={16} color="#A7471B" />
                  <Text style={styles.panditNoticeText}>
                    Bookings are confirmed after availability is checked by Pandit Ji.
                  </Text>
                </View>

                {/* Confirm Button */}
                <TouchableOpacity
                  onPress={handleBook}
                  disabled={isSubmitting}
                  activeOpacity={0.85}
                  style={styles.mainCtaButton}
                >
                  <Text style={styles.mainCtaText}>
                    {isSubmitting ? 'Requesting...' : `Confirm Booking • ₹${currentPrice.toLocaleString('en-IN')}`}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.detailsContainer}>
                {/* Visual Image */}
                <Image source={puja.image} style={styles.heroDetailImage} resizeMode="cover" />

                {/* Info Pills */}
                <View style={styles.metaRow}>
                  <View style={styles.metaPill}>
                    <Clock size={12} color="#C65D24" />
                    <Text style={styles.metaText}>{puja.duration}</Text>
                  </View>
                  <View style={styles.metaPill}>
                    <CheckCircle2 size={12} color="#16A34A" />
                    <Text style={styles.metaText}>{puja.category}</Text>
                  </View>
                </View>

                {/* Description */}
                <Text style={styles.sectionSubtitle}>Overview</Text>
                <Text style={styles.bodyDescription}>{puja.description}</Text>

                <Text style={styles.sectionSubtitle}>Spiritual Significance</Text>
                <Text style={styles.bodyDescription}>{puja.significance}</Text>

                {/* Bottom Action Bar */}
                <View style={styles.priceRow}>
                  <View>
                    <Text style={styles.priceLabel}>Starting Dakshina</Text>
                    <Text style={styles.priceValue}>₹{currentPrice.toLocaleString('en-IN')}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setStep('datetime')}
                    activeOpacity={0.85}
                    style={styles.mainCtaButton}
                  >
                    <Text style={styles.mainCtaText}>Select Date & Book  →</Text>
                  </TouchableOpacity>
                </View>
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
    letterSpacing: 0.5,
  },
  sheetTitle: {
    fontFamily: THEME.typography.serif,
    fontSize: 17,
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
  detailsContainer: {
    paddingBottom: 20,
  },
  heroDetailImage: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF2E9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    marginRight: 8,
  },
  metaText: {
    fontSize: 11,
    color: THEME.colors.heading,
    fontWeight: '600',
    marginLeft: 5,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.heading,
    marginTop: 8,
    marginBottom: 4,
  },
  bodyDescription: {
    fontSize: 12.5,
    lineHeight: 18,
    color: THEME.colors.bodyText,
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F3EAE0',
  },
  priceLabel: {
    fontSize: 11,
    color: THEME.colors.mutedText,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.deepTerracotta,
  },
  mainCtaButton: {
    backgroundColor: THEME.colors.primarySaffron,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 22,
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
  formContainer: {
    paddingBottom: 24,
  },
  packageSummaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FDF7F1',
    borderWidth: 1,
    borderColor: '#F6DEC9',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  packageSummaryLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: THEME.colors.mutedText,
    textTransform: 'uppercase',
  },
  packageSummaryName: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.heading,
    marginTop: 2,
  },
  packageSummaryPrice: {
    fontSize: 17,
    fontWeight: '800',
    color: THEME.colors.deepTerracotta,
  },
  inputSectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.heading,
    marginBottom: 8,
  },
  dateScroll: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  activeDateChip: {
    backgroundColor: THEME.colors.primarySaffron,
    borderColor: THEME.colors.primarySaffron,
  },
  dateChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: THEME.colors.heading,
    marginLeft: 5,
  },
  activeDateChipText: {
    color: '#FFFFFF',
  },
  slotOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  activeSlotOption: {
    borderColor: THEME.colors.primarySaffron,
    backgroundColor: '#FDF6EE',
  },
  slotText: {
    fontSize: 11.5,
    color: THEME.colors.bodyText,
    marginLeft: 8,
  },
  activeSlotText: {
    color: THEME.colors.deepTerracotta,
    fontWeight: '600',
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
    marginBottom: 10,
  },
  panditNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBF4EC',
    borderWidth: 1,
    borderColor: '#EEDDC9',
    borderRadius: 12,
    padding: 10,
    marginVertical: 10,
  },
  panditNoticeText: {
    fontSize: 11,
    color: THEME.colors.deepTerracotta,
    marginLeft: 8,
    flex: 1,
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
