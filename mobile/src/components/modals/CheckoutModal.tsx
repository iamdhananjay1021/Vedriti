import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  CheckCircle2,
  Calendar,
  Clock,
  ShieldCheck,
  CreditCard,
  Truck,
  Sparkles,
  MessageCircle,
  Tag,
  ArrowRight,
  Flame,
  Award,
  Users,
  Check,
} from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { Puja, PujaPackage, PujaKit, TODAYS_PANCHANG } from '../../data/mockData';
import { whatsappService } from '../../services/whatsappService';
import { useAuth } from '../../context/AuthContext';

export interface CheckoutItem {
  type: 'puja' | 'kit';
  puja?: Puja;
  package?: PujaPackage;
  kit?: PujaKit;
}

interface CheckoutModalProps {
  visible: boolean;
  item: CheckoutItem | null;
  onClose: () => void;
  onSuccess: (orderId: string) => void;
}

type CheckoutStep = 'address' | 'payment' | 'confirmed';

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  visible,
  item,
  onClose,
  onSuccess,
}) => {
  const { user, openAuthModal } = useAuth();
  const [step, setStep] = useState<CheckoutStep>('address');

  // Devotee & Sankalp Details
  const [devoteeName, setDevoteeName] = useState(user.name || 'Anand Sharma');
  const [phone, setPhone] = useState(user.phone || '+91 98765 43210');
  const [gotra, setGotra] = useState(user.gotra || 'Kashyap Gotra');
  const [address, setAddress] = useState('Sector 62, Noida, Uttar Pradesh');
  const [pinCode, setPinCode] = useState('201309');
  const [selectedDate, setSelectedDate] = useState('18 Oct 2026');
  const [selectedSlot, setSelectedSlot] = useState('11:45 AM - 12:35 PM (Abhijit Muhurat)');
  const [selectedFamilyMemberIds, setSelectedFamilyMemberIds] = useState<string[]>([]);

  // Sync with auth user on login or profile change
  useEffect(() => {
    if (user.isLoggedIn) {
      if (user.name && user.name !== 'अतिथि यजमान (Guest)') setDevoteeName(user.name);
      if (user.phone) setPhone(user.phone);
      if (user.gotra) setGotra(user.gotra);
      if (user.familyMembers && user.familyMembers.length > 0) {
        setSelectedFamilyMemberIds(user.familyMembers.map((m) => m.id));
      }
    }
  }, [user, visible]);

  // Discount & Loyalty
  const [usePunyaPoints, setUsePunyaPoints] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'cod'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState('');

  if (!item) return null;

  const basePrice = item.type === 'puja'
    ? (item.package?.price || item.puja?.startingPrice || 2100)
    : (item.kit?.price || 1850);

  const title = item.type === 'puja' ? item.puja?.name : item.kit?.name;
  const subtitle = item.type === 'puja' ? item.package?.name : item.kit?.tagline;

  // Calculate discounts
  const punyaDiscount = usePunyaPoints ? 200 : 0;
  const couponDiscount = couponApplied ? Math.round(basePrice * 0.1) : 0;
  const finalPrice = Math.max(0, basePrice - punyaDiscount - couponDiscount);

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase().trim() === 'VEDA10' || couponCode.toUpperCase().trim() === 'SHIVOHAM') {
      setCouponApplied(true);
      Alert.alert('Vedic Coupon Applied! 🌿', '10% Auspicious discount applied to your sacred dakshina.');
    } else {
      Alert.alert('Invalid Coupon', 'Please use coupon code VEDA10 or SHIVOHAM.');
    }
  };

  const handleProceedToPayment = () => {
    if (!devoteeName.trim() || !address.trim()) {
      Alert.alert('Required Fields', 'Please complete your Devotee Name and Address.');
      return;
    }
    setStep('payment');
  };

  const handleConfirmOrder = () => {
    setIsProcessing(true);
    const generatedId = (item.type === 'puja' ? 'VR-SANKALP-' : 'VR-ORD-') + Math.floor(1000 + Math.random() * 9000);
    setConfirmedOrderId(generatedId);

    setTimeout(() => {
      setIsProcessing(false);
      setStep('confirmed');
      onSuccess(generatedId);
    }, 1200);
  };

  const handleWhatsAppShare = () => {
    if (item.type === 'puja') {
      const selectedFamilyNames = user.familyMembers
        .filter((m) => selectedFamilyMemberIds.includes(m.id))
        .map((m) => `${m.name} (${m.relation.split(' ')[0]})`);

      whatsappService.sendBookingConfirmation({
        bookingId: confirmedOrderId,
        pujaName: title || 'Vedic Ritual',
        devoteeName,
        gotra,
        date: selectedDate,
        timeSlot: selectedSlot,
        amount: finalPrice,
        paymentMethod: paymentMethod.toUpperCase(),
        address,
        familyMembers: selectedFamilyNames,
      });
    } else {
      whatsappService.sendOrderConfirmation({
        orderId: confirmedOrderId,
        itemName: title || 'Puja Samagri Kit',
        devoteeName,
        amount: finalPrice,
        address,
        phone,
      });
    }
  };

  const handleClose = () => {
    setStep('address');
    setCouponApplied(false);
    setUsePunyaPoints(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.eyebrow}>
                {step === 'address'
                  ? 'Step 1/2: Devotee & Sankalp Details'
                  : step === 'payment'
                  ? 'Step 2/2: Vedic Dakshina & Payment'
                  : 'Sankalp Confirmed! ॐ'}
              </Text>
              <Text style={styles.sheetTitle} numberOfLines={1}>{title}</Text>
            </View>

            <TouchableOpacity onPress={handleClose} style={styles.closeCircle}>
              <X size={18} color="#4A3428" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* STEP 1: Address & Sankalp Credentials */}
            {step === 'address' && (
              <View>
                {/* Item Summary Card */}
                <View style={styles.summaryMiniCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.summaryLabel}>
                      {item.type === 'puja' ? 'Selected Ritual Package' : 'Consecrated Samagri Kit'}
                    </Text>
                    <Text style={styles.summaryName}>{title}</Text>
                    <Text style={styles.summarySub}>{subtitle}</Text>
                  </View>
                  <Text style={styles.summaryPrice}>₹{basePrice.toLocaleString('en-IN')}</Text>
                </View>

                {/* Devotee Input Fields */}
                <Text style={styles.sectionHeader}>यजमान (Devotee Credentials)</Text>

                {/* Guest 1-Tap Login Offer Banner */}
                {!user.isLoggedIn && (
                  <TouchableOpacity
                    onPress={openAuthModal}
                    activeOpacity={0.85}
                    style={styles.guestLoginBox}
                  >
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Sparkles size={13} color="#D4AF37" />
                        <Text style={styles.guestLoginTitle}>1-क्लिक स्थिर OTP से लॉगिन करें</Text>
                      </View>
                      <Text style={styles.guestLoginSub}>
                        स्थिर OTP 1080 से तुरंत 1,080 पुण्य अंक (₹200 की बचत) प्राप्त करें
                      </Text>
                    </View>
                    <View style={styles.guestLoginPill}>
                      <Text style={styles.guestLoginPillText}>लॉगिन ॐ</Text>
                    </View>
                  </TouchableOpacity>
                )}

                <Text style={styles.inputLabel}>Full Devotee Name *</Text>
                <TextInput
                  value={devoteeName}
                  onChangeText={setDevoteeName}
                  style={styles.input}
                  placeholder="e.g. Anand Sharma"
                  placeholderTextColor="#A89E94"
                />

                <View style={styles.rowTwo}>
                  <View style={styles.halfCol}>
                    <Text style={styles.inputLabel}>Gotra Lineage *</Text>
                    <TextInput
                      value={gotra}
                      onChangeText={setGotra}
                      style={styles.input}
                      placeholder="e.g. Kashyap"
                      placeholderTextColor="#A89E94"
                    />
                  </View>
                  <View style={styles.halfCol}>
                    <Text style={styles.inputLabel}>Contact Phone *</Text>
                    <TextInput
                      value={phone}
                      onChangeText={setPhone}
                      style={styles.input}
                      placeholder="+91..."
                      placeholderTextColor="#A89E94"
                    />
                  </View>
                </View>

                {/* Family Members Selection for Sankalp */}
                {item.type === 'puja' && user.familyMembers && user.familyMembers.length > 0 && (
                  <View style={styles.familySankalpSection}>
                    <View style={styles.familyHeaderRow}>
                      <Users size={14} color="#C65D24" />
                      <Text style={styles.familyHeaderTitle}>
                        पारिवारिक संकल्प (Include Family in Sankalp)
                      </Text>
                    </View>
                    <Text style={styles.familyHeaderSub}>
                      पंडित जी गर्भगृह में इन सदस्यों के नाम व गोत्र का उच्चारण करेंगे:
                    </Text>
                    <View style={styles.familyChipsContainer}>
                      {user.familyMembers.map((member) => {
                        const isSelected = selectedFamilyMemberIds.includes(member.id);
                        return (
                          <TouchableOpacity
                            key={member.id}
                            onPress={() => {
                              setSelectedFamilyMemberIds((prev) =>
                                isSelected ? prev.filter((id) => id !== member.id) : [...prev, member.id]
                              );
                            }}
                            activeOpacity={0.8}
                            style={[styles.familyChip, isSelected && styles.familyChipActive]}
                          >
                            <View style={[styles.familyCheckDot, isSelected && styles.familyCheckDotActive]}>
                              {isSelected && <Check size={10} color="#FFF" />}
                            </View>
                            <Text style={[styles.familyChipText, isSelected && styles.familyChipTextActive]}>
                              {member.name} ({member.relation.split(' ')[0]})
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}

                {item.type === 'puja' && (
                  <>
                    <Text style={styles.sectionHeader}>शुभ मुहूर्त (Date & Auspicious Slot)</Text>
                    <View style={styles.muhuratNoticeBox}>
                      <Clock size={12} color="#C65D24" />
                      <Text style={styles.muhuratNoticeText}>
                        Selected: {selectedDate} • {selectedSlot}
                      </Text>
                    </View>
                  </>
                )}

                <Text style={styles.sectionHeader}>वितरण पता (Altar / Delivery Address)</Text>
                <Text style={styles.inputLabel}>House/Flat No, Street, Landmark *</Text>
                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  style={[styles.input, styles.textArea]}
                  multiline
                  numberOfLines={2}
                  placeholder="Enter full address where ritual or prasad is required"
                  placeholderTextColor="#A89E94"
                />

                <Text style={styles.inputLabel}>Pin Code *</Text>
                <TextInput
                  value={pinCode}
                  onChangeText={setPinCode}
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="e.g. 201309"
                  placeholderTextColor="#A89E94"
                />

                <TouchableOpacity
                  onPress={handleProceedToPayment}
                  activeOpacity={0.88}
                  style={styles.primaryNextBtn}
                >
                  <LinearGradient
                    colors={THEME.gradients.vermilionSunset}
                    style={styles.btnGradient}
                  >
                    <Text style={styles.btnText}>Proceed to Dakshina Summary →</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {/* STEP 2: Payment & Discounts */}
            {step === 'payment' && (
              <View>
                {/* Price Breakdown */}
                <View style={styles.priceBreakdownCard}>
                  <Text style={styles.breakdownTitle}>Vedic Dakshina Breakdown</Text>
                  
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Ritual / Kit Dakshina</Text>
                    <Text style={styles.breakdownVal}>₹{basePrice.toLocaleString('en-IN')}</Text>
                  </View>

                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Garbhagriha Consecration & Mantras</Text>
                    <Text style={[styles.breakdownVal, { color: '#16A34A' }]}>FREE (मान्य)</Text>
                  </View>

                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Bluedart Holy Express Shipping</Text>
                    <Text style={[styles.breakdownVal, { color: '#16A34A' }]}>FREE (सप्रेम)</Text>
                  </View>

                  {/* Punya Points Redemption */}
                  <TouchableOpacity
                    onPress={() => setUsePunyaPoints(!usePunyaPoints)}
                    activeOpacity={0.8}
                    style={styles.loyaltyBox}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.loyaltyTitle}>Redeem Punya Points</Text>
                      <Text style={styles.loyaltySub}>
                        Apply {user.punyaPoints.toLocaleString('en-IN')} Punya balance for ₹200 savings
                      </Text>
                    </View>
                    <View style={[styles.switchCircle, usePunyaPoints && styles.switchCircleActive]}>
                      {usePunyaPoints && <CheckCircle2 size={14} color="#FFF" />}
                    </View>
                  </TouchableOpacity>

                  {/* Coupon Input */}
                  <View style={styles.couponRow}>
                    <TextInput
                      value={couponCode}
                      onChangeText={setCouponCode}
                      placeholder="Enter Coupon (e.g. VEDA10)"
                      placeholderTextColor="#A89E94"
                      style={styles.couponInput}
                      autoCapitalize="characters"
                    />
                    <TouchableOpacity
                      onPress={handleApplyCoupon}
                      activeOpacity={0.8}
                      style={styles.applyCouponBtn}
                    >
                      <Text style={styles.applyCouponText}>Apply</Text>
                    </TouchableOpacity>
                  </View>

                  {couponApplied && (
                    <View style={styles.couponSuccess}>
                      <Text style={styles.couponSuccessText}>✓ 10% Auspicious Vedic discount applied (-₹{couponDiscount})</Text>
                    </View>
                  )}

                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total Payable Dakshina</Text>
                    <Text style={styles.totalPrice}>₹{finalPrice.toLocaleString('en-IN')}</Text>
                  </View>
                </View>

                {/* Payment Methods */}
                <Text style={styles.sectionHeader}>Select Payment Mode</Text>
                
                {/* UPI */}
                <TouchableOpacity
                  onPress={() => setPaymentMethod('upi')}
                  activeOpacity={0.8}
                  style={[styles.payOption, paymentMethod === 'upi' && styles.payOptionActive]}
                >
                  <View style={styles.payIconCircle}>
                    <Sparkles size={14} color="#C65D24" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.payTitle}>Instant UPI (Google Pay / PhonePe / Paytm / BHIM)</Text>
                    <Text style={styles.paySub}>Fastest 1-tap payment</Text>
                  </View>
                  {paymentMethod === 'upi' && <CheckCircle2 size={16} color="#16A34A" />}
                </TouchableOpacity>

                {/* Cards */}
                <TouchableOpacity
                  onPress={() => setPaymentMethod('card')}
                  activeOpacity={0.8}
                  style={[styles.payOption, paymentMethod === 'card' && styles.payOptionActive]}
                >
                  <View style={styles.payIconCircle}>
                    <CreditCard size={14} color="#C65D24" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.payTitle}>Credit / Debit Cards (RuPay / Visa / Master)</Text>
                    <Text style={styles.paySub}>100% Secure 256-Bit Encrypted</Text>
                  </View>
                  {paymentMethod === 'card' && <CheckCircle2 size={16} color="#16A34A" />}
                </TouchableOpacity>

                {/* COD / Post-Sankalp */}
                <TouchableOpacity
                  onPress={() => setPaymentMethod('cod')}
                  activeOpacity={0.8}
                  style={[styles.payOption, paymentMethod === 'cod' && styles.payOptionActive]}
                >
                  <View style={styles.payIconCircle}>
                    <ShieldCheck size={14} color="#C65D24" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.payTitle}>Dakshina upon Sankalp Completion (COD)</Text>
                    <Text style={styles.paySub}>Pay Acharya Ji after ritual or upon prasad delivery</Text>
                  </View>
                  {paymentMethod === 'cod' && <CheckCircle2 size={16} color="#16A34A" />}
                </TouchableOpacity>

                {/* Confirm & Book CTA */}
                <TouchableOpacity
                  onPress={handleConfirmOrder}
                  activeOpacity={0.88}
                  style={styles.primaryNextBtn}
                >
                  <LinearGradient
                    colors={THEME.gradients.vermilionSunset}
                    style={styles.btnGradient}
                  >
                    <Flame size={14} color="#FFF" />
                    <Text style={styles.btnText}>
                      {isProcessing ? 'Processing Sankalp...' : `Confirm & Pay ₹${finalPrice.toLocaleString('en-IN')} ॐ`}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {/* STEP 3: Confirmed & WhatsApp Business Voucher */}
            {step === 'confirmed' && (
              <View style={styles.confirmedBox}>
                <View style={styles.successHalo}>
                  <CheckCircle2 size={46} color="#16A34A" />
                </View>
                <Text style={styles.confirmedTitle}>Vedic Sankalp Registered!</Text>
                <Text style={styles.orderRefText}>Ref #{confirmedOrderId}</Text>
                
                <Text style={styles.confirmedBody}>
                  May Lord Vishwanath and Mata Annapurna bestow health, long life, and prosperity upon the {gotra} family. Your booking has been registered with our Kashi Parishad.
                </Text>

                {/* WhatsApp Business Action Button */}
                <TouchableOpacity
                  onPress={handleWhatsAppShare}
                  activeOpacity={0.85}
                  style={styles.whatsAppVoucherBtn}
                >
                  <MessageCircle size={16} color="#FFF" />
                  <Text style={styles.whatsAppVoucherText}>
                    Get WhatsApp Business Voucher & Updates
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleClose}
                  activeOpacity={0.8}
                  style={styles.doneBtn}
                >
                  <Text style={styles.doneBtnText}>View in Devotee Sankalp Vault</Text>
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
    backgroundColor: 'rgba(26, 16, 9, 0.72)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    maxHeight: '90%',
    borderTopWidth: 2,
    borderTopColor: '#D4AF37',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5ECE1',
  },
  eyebrow: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#996515',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  sheetTitle: {
    fontFamily: THEME.typography.serif,
    fontSize: 17,
    fontWeight: '800',
    color: THEME.colors.headingDeep,
  },
  closeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FAF5EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 30,
  },
  summaryMiniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDFBF7',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFE0D0',
    marginBottom: 14,
  },
  summaryLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: THEME.colors.mutedText,
    textTransform: 'uppercase',
  },
  summaryName: {
    fontFamily: THEME.typography.serif,
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.headingDeep,
    marginTop: 1,
  },
  summarySub: {
    fontSize: 10,
    color: THEME.colors.royalVermilion,
    fontWeight: '600',
  },
  summaryPrice: {
    fontSize: 18,
    fontWeight: '900',
    color: THEME.colors.deepTerracotta,
  },
  sectionHeader: {
    fontFamily: THEME.typography.serif,
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.headingDeep,
    marginTop: 8,
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: THEME.colors.bodyText,
    marginBottom: 3,
  },
  input: {
    backgroundColor: '#FAF6EE',
    borderWidth: 1,
    borderColor: '#EBDDCB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
    fontSize: 12,
    color: THEME.colors.headingDeep,
    marginBottom: 10,
  },
  textArea: {
    minHeight: 52,
    textAlignVertical: 'top',
  },
  rowTwo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfCol: {
    width: '48%',
  },
  muhuratNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF2E9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F8DECA',
    marginBottom: 10,
  },
  muhuratNoticeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: THEME.colors.deepTerracotta,
    marginLeft: 6,
  },
  primaryNextBtn: {
    marginVertical: 14,
    borderRadius: 16,
    overflow: 'hidden',
  },
  btnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
  },
  btnText: {
    color: '#FFF',
    fontSize: 12.5,
    fontWeight: '800',
    marginLeft: 6,
  },
  priceBreakdownCard: {
    backgroundColor: '#FAF5EE',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE2D3',
    marginBottom: 14,
  },
  breakdownTitle: {
    fontFamily: THEME.typography.serif,
    fontSize: 13.5,
    fontWeight: '800',
    color: THEME.colors.headingDeep,
    marginBottom: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  breakdownLabel: {
    fontSize: 11,
    color: THEME.colors.bodyText,
  },
  breakdownVal: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.headingDeep,
  },
  loyaltyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EAD7C2',
    marginVertical: 8,
  },
  loyaltyTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.headingDeep,
  },
  loyaltySub: {
    fontSize: 9.5,
    color: '#15803D',
    fontWeight: '600',
  },
  switchCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  switchCircleActive: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  couponRow: {
    flexDirection: 'row',
    marginTop: 6,
    marginBottom: 6,
  },
  couponInput: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EBDDCB',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 11,
    color: THEME.colors.headingDeep,
    marginRight: 6,
  },
  applyCouponBtn: {
    backgroundColor: THEME.colors.primarySaffron,
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRadius: 10,
  },
  applyCouponText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  couponSuccess: {
    backgroundColor: '#DCFCE7',
    padding: 6,
    borderRadius: 6,
    marginBottom: 6,
  },
  couponSuccessText: {
    fontSize: 10,
    color: '#15803D',
    fontWeight: '700',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EAD7C2',
    paddingTop: 8,
    marginTop: 6,
  },
  totalLabel: {
    fontFamily: THEME.typography.serif,
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.headingDeep,
  },
  totalPrice: {
    fontSize: 19,
    fontWeight: '900',
    color: THEME.colors.deepTerracotta,
  },
  payOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFE0D0',
    marginBottom: 8,
  },
  payOptionActive: {
    borderColor: THEME.colors.primarySaffron,
    backgroundColor: '#FDF6EE',
  },
  payIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FAF5EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  payTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: THEME.colors.headingDeep,
  },
  paySub: {
    fontSize: 9.5,
    color: THEME.colors.mutedText,
    marginTop: 1,
  },
  confirmedBox: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  successHalo: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  confirmedTitle: {
    fontFamily: THEME.typography.serif,
    fontSize: 20,
    fontWeight: '900',
    color: THEME.colors.headingDeep,
  },
  orderRefText: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.deepTerracotta,
    marginTop: 2,
    marginBottom: 10,
  },
  confirmedBody: {
    fontSize: 11.5,
    lineHeight: 16,
    color: THEME.colors.bodyText,
    textAlign: 'center',
    marginBottom: 18,
  },
  whatsAppVoucherBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 14,
    width: '100%',
    marginBottom: 10,
  },
  whatsAppVoucherText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 6,
  },
  doneBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFE0D0',
    width: '100%',
    alignItems: 'center',
  },
  doneBtnText: {
    color: THEME.colors.headingDeep,
    fontSize: 11.5,
    fontWeight: '700',
  },
  guestLoginBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FDF6EE',
    borderWidth: 1.2,
    borderColor: '#D4AF37',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  guestLoginTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.headingDeep,
    marginLeft: 5,
  },
  guestLoginSub: {
    fontSize: 9.5,
    color: THEME.colors.deepTerracotta,
    marginTop: 1,
  },
  guestLoginPill: {
    backgroundColor: THEME.colors.royalVermilion,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    marginLeft: 8,
  },
  guestLoginPillText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  familySankalpSection: {
    backgroundColor: '#FAF5EE',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EFE0D0',
    marginBottom: 10,
  },
  familyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  familyHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.headingDeep,
    marginLeft: 6,
  },
  familyHeaderSub: {
    fontSize: 9.5,
    color: THEME.colors.mutedText,
    marginBottom: 8,
  },
  familyChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  familyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8D9C8',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginRight: 6,
    marginBottom: 6,
  },
  familyChipActive: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  familyCheckDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
    backgroundColor: '#FFF',
  },
  familyCheckDotActive: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  familyChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.bodyText,
  },
  familyChipTextActive: {
    color: '#15803D',
    fontWeight: '800',
  },
});
