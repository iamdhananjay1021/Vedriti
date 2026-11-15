import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  Alert,
  Platform,
  ActivityIndicator,
  Vibration,
  Image,
} from 'react-native';
import {
  X,
  Flame,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Users,
  ShieldCheck,
  ChevronRight,
  Plus,
  Trash2,
  Video,
  Award,
  Check,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '../../services/api';
import type { ApiSamuhikPuja, ApiSamuhikTier, SamuhikEnrollInput } from '../../types/api';
import { THEME } from '../../constants/theme';

const { width } = Dimensions.get('window');

const POPULAR_GOTRAS = [
  'कश्यप (Kashyap)',
  'भारद्वाज (Bharadwaj)',
  'वशिष्ठ (Vashistha)',
  'शांडिल्य (Shandilya)',
  'गर्ग (Garg)',
  'कौशिक (Kaushik)',
  'पराशर (Parashar)',
  'अत्रि (Atri)',
  'गौतम (Gautam)',
];

const COMMON_SANKALPS = [
  'पारिवारिक सुख, शांति एवं समृद्धि',
  'उत्तम स्वास्थ्य, दीर्घायु व रोगमुक्ति',
  'व्यापार वृद्धि एवं आर्थिक उन्नति',
  'विवाह बाधा निवारण व संतान सुख',
  'समस्त ग्रह दोष व संकट शांति',
];

interface Props {
  visible: boolean;
  puja: ApiSamuhikPuja | null;
  onClose: () => void;
  onSuccess: (bookingId: string) => void;
  initialUserName?: string;
  initialUserPhone?: string;
  initialUserGotra?: string;
}

export const SamuhikBookingModal: React.FC<Props> = ({
  visible,
  puja,
  onClose,
  onSuccess,
  initialUserName = '',
  initialUserPhone = '',
  initialUserGotra = '',
}) => {
  const [selectedTier, setSelectedTier] = useState<ApiSamuhikTier | null>(null);
  const [devoteeName, setDevoteeName] = useState(initialUserName);
  const [phone, setPhone] = useState(initialUserPhone);
  const [gotra, setGotra] = useState(initialUserGotra || 'कश्यप');
  const [customGotra, setCustomGotra] = useState('');
  const [rashi, setRashi] = useState('');
  const [sankalpWish, setSankalpWish] = useState(COMMON_SANKALPS[0]);
  const [familyMembers, setFamilyMembers] = useState<{ name: string; relation: string }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'PAY_LATER'>('ONLINE');
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);

  useEffect(() => {
    if (puja && puja.tiers && puja.tiers.length > 0) {
      setSelectedTier(puja.tiers[0]);
    }
  }, [puja]);

  useEffect(() => {
    if (initialUserName) setDevoteeName(initialUserName);
    if (initialUserPhone) setPhone(initialUserPhone);
    if (initialUserGotra) setGotra(initialUserGotra);
  }, [initialUserName, initialUserPhone, initialUserGotra]);

  if (!puja) return null;

  const currentTier = selectedTier || puja.tiers[0] || {
    id: 'single',
    name: 'एकल संकल्प',
    dakshina: 101,
    maxFamilyMembers: 1,
    prasadIncluded: false,
  };

  const handleAddFamilyMember = () => {
    const maxAllowed = currentTier.maxFamilyMembers || 4;
    if (familyMembers.length >= maxAllowed - 1) {
      Alert.alert(
        'सीमा पूर्ण',
        `इस वर्ग में मुख्य यजमान सहित अधिकतम ${maxAllowed} सदस्य हो सकते हैं।`
      );
      return;
    }
    setFamilyMembers([...familyMembers, { name: '', relation: 'पत्नी / पति' }]);
  };

  const handleRemoveFamilyMember = (index: number) => {
    setFamilyMembers(familyMembers.filter((_, i) => i !== index));
  };

  const handleUpdateFamilyMember = (index: number, field: 'name' | 'relation', val: string) => {
    const updated = [...familyMembers];
    updated[index][field] = val;
    setFamilyMembers(updated);
  };

  const handleSubmit = async () => {
    const finalGotra = gotra === 'अन्य (Other)' ? customGotra.trim() : gotra.split('(')[0].trim();
    if (!devoteeName.trim()) {
      Alert.alert('नाम अनिवार्य है', 'कृपया यजमान का पूरा नाम दर्ज करें।');
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      Alert.alert('फ़ोन नंबर आवश्यक है', 'कृपया वैध 10-अंकीय WhatsApp फ़ोन नंबर दर्ज करें।');
      return;
    }
    if (!finalGotra) {
      Alert.alert('गोत्र आवश्यक है', 'पंडित जी द्वारा संकल्प पाठ हेतु गोत्र अनिवार्य है।');
      return;
    }

    setSubmitting(true);
    Vibration.vibrate(30);

    const payload: SamuhikEnrollInput = {
      devoteeName: devoteeName.trim(),
      phone: phone.trim(),
      gotra: finalGotra,
      rashi: rashi.trim() || undefined,
      sankalpWish: sankalpWish.trim(),
      familyMembers: familyMembers.filter((m) => m.name.trim().length > 0),
      tierId: currentTier.id,
      paymentMethod,
    };

    try {
      const res = await api.enrollSamuhikPuja(puja.id || (puja as any)._id, payload);
      setConfirmedBooking(res.booking);
      Vibration.vibrate([0, 80, 60, 100]);
      onSuccess(res.booking?.bookingId || 'SP-CONFIRMED');
    } catch (err: any) {
      Alert.alert('पंजीकरण त्रुटि', err?.message || 'पंजीकरण नहीं हो सका। कृपया पुनः प्रयास करें।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => {
              if (confirmedBooking) setConfirmedBooking(null);
              onClose();
            }}
            style={styles.closeBtn}
            activeOpacity={0.8}
          >
            <X size={20} color="#2A170F" />
          </TouchableOpacity>

          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle}>सामूहिक संकल्प पंजीकरण</Text>
            <Text style={styles.headerSubtitle}>पंडित जी द्वारा नाम व गोत्र से आहुति</Text>
          </View>

          <View style={{ width: 36 }} />
        </View>

        {/* CONFIRMED BOOKING RECEIPT SCREEN */}
        {confirmedBooking ? (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.confirmedScroll}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.confirmedCard}>
              <View style={styles.successIconCircle}>
                <CheckCircle2 size={46} color="#15803D" />
              </View>

              <Text style={styles.confirmedTitle}>संकल्प सफलतापूर्वक पंजीकृत!</Text>
              <Text style={styles.confirmedSub}>
                पंडित जी द्वारा आपके नाम व गोत्र का उच्चारण कर यज्ञ वेदी पर पावन आहुति अर्पित की जाएगी।
              </Text>

              {/* Booking Reference Pill */}
              <View style={styles.bookingIdBadge}>
                <Text style={styles.bookingIdLabel}>बुकिंग संदर्भ संख्या:</Text>
                <Text style={styles.bookingIdVal}>{confirmedBooking.bookingId}</Text>
              </View>

              {/* Summary Details Table */}
              <View style={styles.summaryTable}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryKey}>महोत्सव पूजा:</Text>
                  <Text style={styles.summaryVal}>{puja.title}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryKey}>मुख्य यजमान:</Text>
                  <Text style={styles.summaryVal}>{confirmedBooking.devoteeName}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryKey}>गोत्र:</Text>
                  <Text style={styles.summaryVal}>{confirmedBooking.gotra}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryKey}>संकल्प वर्ग:</Text>
                  <Text style={styles.summaryVal}>{confirmedBooking.tierName}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryKey}>दक्षिणा राशि:</Text>
                  <Text style={[styles.summaryVal, { color: '#C65D24', fontWeight: '800' }]}>
                    ₹{confirmedBooking.amount}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryKey}>तीर्थ स्थल:</Text>
                  <Text style={styles.summaryVal}>{puja.templeVenue}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryKey}>मुहूर्त:</Text>
                  <Text style={styles.summaryVal}>{puja.muhuratTime}</Text>
                </View>
              </View>

              {/* Proof Notice Card */}
              <View style={styles.proofNotice}>
                <Video size={16} color="#C65D24" />
                <Text style={styles.proofNoticeText}>
                  पूजा सम्पन्न होने के उपरांत संकल्प वीडियो व प्रसाद दर्शन आपके WhatsApp और ऐप के "Account" अनुभाग में उपलब्ध कराया जाएगा।
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  setConfirmedBooking(null);
                  onClose();
                }}
                style={styles.doneBtn}
                activeOpacity={0.88}
              >
                <Text style={styles.doneBtnText}>जय श्री राम • पूर्ण करें</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* HERO PUJA BANNER */}
            <View style={styles.pujaBannerCard}>
              <View style={styles.bannerTagRow}>
                <View style={styles.deityTag}>
                  <Flame size={12} color="#C65D24" />
                  <Text style={styles.deityTagText}>{puja.deity}</Text>
                </View>
                <View style={styles.festivalLiveTag}>
                  <Text style={styles.festivalLiveText}>महापर्व अनुष्ठान</Text>
                </View>
              </View>

              <Text style={styles.pujaBannerTitle}>{puja.title}</Text>
              {puja.subtitle ? <Text style={styles.pujaBannerSub}>{puja.subtitle}</Text> : null}

              <View style={styles.venueRow}>
                <View style={styles.venueItem}>
                  <MapPin size={13} color="#C65D24" />
                  <Text style={styles.venueText} numberOfLines={1}>
                    {puja.templeVenue}
                  </Text>
                </View>
                <View style={styles.venueItem}>
                  <Calendar size={13} color="#15803D" />
                  <Text style={styles.venueText}>
                    {new Date(puja.eventDate).toLocaleDateString('hi-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
              </View>
            </View>

            {/* SECTION 1: DAKSHINA TIERS SELECTION */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionNum}>1</Text>
                <View>
                  <Text style={styles.sectionTitle}>दक्षिणा संकल्प वर्ग चुनें</Text>
                  <Text style={styles.sectionSubtitle}>
                    सभी वर्गों में पंडित जी द्वारा व्यक्तिगत नाम-गोत्र संकल्प सम्मिलित है
                  </Text>
                </View>
              </View>

              <View style={styles.tiersGrid}>
                {puja.tiers.map((t) => {
                  const isSel = currentTier.id === t.id;
                  const isPopular = t.dakshina === 251;

                  return (
                    <TouchableOpacity
                      key={t.id}
                      onPress={() => {
                        setSelectedTier(t);
                        Vibration.vibrate(20);
                      }}
                      style={[styles.tierCard, isSel && styles.tierCardSelected]}
                      activeOpacity={0.85}
                    >
                      {isPopular ? (
                        <View style={styles.popularBadge}>
                          <Text style={styles.popularBadgeText}>⭐ सर्वाधिक लोकप्रिय</Text>
                        </View>
                      ) : null}

                      <View style={styles.tierTop}>
                        <View style={styles.tierLeft}>
                          <View style={[styles.radioCircle, isSel && styles.radioCircleActive]}>
                            {isSel ? <View style={styles.radioDot} /> : null}
                          </View>
                          <View>
                            <Text style={[styles.tierName, isSel && styles.tierNameSelected]}>
                              {t.name}
                            </Text>
                            <View style={styles.tierPillsRow}>
                              <View style={styles.tierPersonsPill}>
                                <Users size={11} color="#786B60" />
                                <Text style={styles.tierPersonsText}>
                                  {t.maxFamilyMembers > 1
                                    ? `तक ${t.maxFamilyMembers} सदस्य`
                                    : '1 यजमान'}
                                </Text>
                              </View>
                              {t.prasadIncluded ? (
                                <View style={styles.prasadPill}>
                                  <Sparkles size={11} color="#C65D24" />
                                  <Text style={styles.prasadText}>प्रसाद सम्मिलित</Text>
                                </View>
                              ) : null}
                            </View>
                          </View>
                        </View>

                        <Text style={styles.tierDakshina}>₹{t.dakshina}</Text>
                      </View>

                      {t.description ? <Text style={styles.tierDesc}>{t.description}</Text> : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* SECTION 2: DEVOTEE & GOTRA FORM */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionNum}>2</Text>
                <View>
                  <Text style={styles.sectionTitle}>यजमान विवरण व पवित्र गोत्र</Text>
                  <Text style={styles.sectionSubtitle}>
                    पंडित जी हवन वेदी पर इसी नाम व गोत्र का उच्चारण करेंगे
                  </Text>
                </View>
              </View>

              {/* Devotee Full Name */}
              <View style={styles.fieldBox}>
                <Text style={styles.fieldLabel}>मुख्य यजमान का पूरा नाम *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="उदा. धनंजय पाण्डेय"
                  placeholderTextColor="#A89F91"
                  value={devoteeName}
                  onChangeText={setDevoteeName}
                />
              </View>

              {/* WhatsApp Phone */}
              <View style={styles.fieldBox}>
                <Text style={styles.fieldLabel}>फ़ोन नम्बर (WhatsApp) *</Text>
                <Text style={styles.fieldHint}>
                  संकल्प वीडियो व फ़ोटो इसी नंबर पर प्रेषित किए जाएंगे।
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="उदा. 9876543210"
                  placeholderTextColor="#A89F91"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>

              {/* Gotra Picker Chips */}
              <View style={styles.fieldBox}>
                <Text style={styles.fieldLabel}>गोत्र (Gotra) *</Text>
                <Text style={styles.fieldHint}>
                  यदि गोत्र ज्ञात नहीं है तो वैदिक परंपरानुसार 'कश्यप' चुनें।
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.gotraChipsRow}
                >
                  {POPULAR_GOTRAS.map((g) => {
                    const isSel = gotra === g;
                    return (
                      <TouchableOpacity
                        key={g}
                        onPress={() => {
                          setGotra(g);
                          Vibration.vibrate(15);
                        }}
                        style={[styles.gotraChip, isSel && styles.gotraChipSelected]}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.gotraChipText, isSel && styles.gotraChipTextSelected]}>
                          {g.split(' ')[0]}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                  <TouchableOpacity
                    onPress={() => setGotra('अन्य (Other)')}
                    style={[styles.gotraChip, gotra === 'अन्य (Other)' && styles.gotraChipSelected]}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.gotraChipText,
                        gotra === 'अन्य (Other)' && styles.gotraChipTextSelected,
                      ]}
                    >
                      अन्य...
                    </Text>
                  </TouchableOpacity>
                </ScrollView>

                {gotra === 'अन्य (Other)' && (
                  <TextInput
                    style={[styles.textInput, { marginTop: 8 }]}
                    placeholder="अपना गोत्र यहाँ लिखें..."
                    placeholderTextColor="#A89F91"
                    value={customGotra}
                    onChangeText={setCustomGotra}
                  />
                )}
              </View>

              {/* Family Members (if Couple / Family Tier selected) */}
              {currentTier.maxFamilyMembers > 1 && (
                <View style={styles.fieldBox}>
                  <View style={styles.familyHeader}>
                    <Text style={styles.fieldLabel}>
                      परिवार के अन्य सदस्य ({familyMembers.length + 1} /{' '}
                      {currentTier.maxFamilyMembers})
                    </Text>
                    {familyMembers.length < currentTier.maxFamilyMembers - 1 && (
                      <TouchableOpacity
                        onPress={handleAddFamilyMember}
                        style={styles.addMemberBtn}
                        activeOpacity={0.8}
                      >
                        <Plus size={13} color="#C65D24" />
                        <Text style={styles.addMemberText}>सदस्य जोड़ें</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {familyMembers.map((m, idx) => (
                    <View key={idx} style={styles.familyMemberRow}>
                      <TextInput
                        style={[styles.textInput, { flex: 2, marginRight: 6 }]}
                        placeholder={`सदस्य ${idx + 2} का नाम`}
                        placeholderTextColor="#A89F91"
                        value={m.name}
                        onChangeText={(txt) => handleUpdateFamilyMember(idx, 'name', txt)}
                      />
                      <TextInput
                        style={[styles.textInput, { flex: 1.5, marginRight: 6 }]}
                        placeholder="संबंध (उदा. पत्नी)"
                        placeholderTextColor="#A89F91"
                        value={m.relation}
                        onChangeText={(txt) => handleUpdateFamilyMember(idx, 'relation', txt)}
                      />
                      <TouchableOpacity
                        onPress={() => handleRemoveFamilyMember(idx)}
                        style={styles.removeMemberBtn}
                      >
                        <Trash2 size={16} color="#DC2626" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* Sankalp Wish / Manokamana */}
              <View style={styles.fieldBox}>
                <Text style={styles.fieldLabel}>संकल्प कामना (मनोकामना)</Text>
                <View style={styles.wishChips}>
                  {COMMON_SANKALPS.slice(0, 3).map((w) => {
                    const isSel = sankalpWish === w;
                    return (
                      <TouchableOpacity
                        key={w}
                        onPress={() => setSankalpWish(w)}
                        style={[styles.wishChip, isSel && styles.wishChipSelected]}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.wishChipText, isSel && styles.wishChipTextSelected]}>
                          {w}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <TextInput
                  style={[styles.textInput, { marginTop: 8 }]}
                  placeholder="अन्य विशिष्ट मनोकामना यहाँ लिखें..."
                  placeholderTextColor="#A89F91"
                  value={sankalpWish}
                  onChangeText={setSankalpWish}
                />
              </View>
            </View>

            {/* SECTION 3: WHAT IS INCLUDED IN SANKALP */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionNum}>3</Text>
                <View>
                  <Text style={styles.sectionTitle}>संकल्प में क्या सम्मिलित है</Text>
                  <Text style={styles.sectionSubtitle}>शास्त्रोक्त वैदिक विधि व आहुति विवरण</Text>
                </View>
              </View>

              <View style={styles.inclusionsBox}>
                {[
                  'पंडित जी द्वारा आपके व परिजनों के नाम-गोत्र का व्यक्तिगत पाठ',
                  'तीर्थ क्षेत्र वेदी पर शुद्ध घृत व समिधा से महा-आहुति अर्पण',
                  'पूजा उपरांत WhatsApp व ऐप में संकल्प वीडियो दर्शन',
                  currentTier.prasadIncluded
                    ? 'अभिमंत्रित रक्षा सूत्र व पावन प्रसाद (डाक द्वारा प्रेषित)'
                    : 'डिजिटल संकल्प पत्र व पंडित जी का आशीर्वाद संदेश',
                ].map((item, i) => (
                  <View key={i} style={styles.inclusionItem}>
                    <CheckCircle2 size={15} color="#15803D" style={{ marginTop: 2 }} />
                    <Text style={styles.inclusionText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* SECTION 4: PAYMENT METHOD */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionNum}>4</Text>
                <View>
                  <Text style={styles.sectionTitle}>दक्षिणा भुगतान विधि</Text>
                  <Text style={styles.sectionSubtitle}>सुरक्षित डिजिटल भुगतान अथवा पूजा उपरांत</Text>
                </View>
              </View>

              <View style={styles.paymentMethodsRow}>
                <TouchableOpacity
                  onPress={() => setPaymentMethod('ONLINE')}
                  style={[
                    styles.payMethodCard,
                    paymentMethod === 'ONLINE' && styles.payMethodCardActive,
                  ]}
                  activeOpacity={0.8}
                >
                  <ShieldCheck
                    size={20}
                    color={paymentMethod === 'ONLINE' ? '#15803D' : '#786B60'}
                  />
                  <View>
                    <Text
                      style={[
                        styles.payMethodText,
                        paymentMethod === 'ONLINE' && styles.payMethodTextActive,
                      ]}
                    >
                      ऑनलाइन (UPI / Card)
                    </Text>
                    <Text style={styles.payMethodSub}>तुरंत रसीद व पुष्टि</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setPaymentMethod('PAY_LATER')}
                  style={[
                    styles.payMethodCard,
                    paymentMethod === 'PAY_LATER' && styles.payMethodCardActive,
                  ]}
                  activeOpacity={0.8}
                >
                  <Clock
                    size={20}
                    color={paymentMethod === 'PAY_LATER' ? '#C65D24' : '#786B60'}
                  />
                  <View>
                    <Text
                      style={[
                        styles.payMethodText,
                        paymentMethod === 'PAY_LATER' && styles.payMethodTextActive,
                      ]}
                    >
                      पूजा उपरांत दक्षिणा
                    </Text>
                    <Text style={styles.payMethodSub}>आहुति के बाद भुगतान</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        )}

        {/* STICKY BOTTOM ACTION BAR (ONLY IF NOT CONFIRMED) */}
        {!confirmedBooking && (
          <View style={styles.bottomBar}>
            <View>
              <Text style={styles.totalLabel}>कुल दक्षिणा संकल्प:</Text>
              <Text style={styles.totalPrice}>₹{currentTier.dakshina}</Text>
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitting}
              style={styles.submitBtn}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={['#EA580C', '#C65D24']}
                style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
              />
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>
                    पावन संकल्प लें • ₹{currentTier.dakshina}
                  </Text>
                  <ChevronRight size={18} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  topBar: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EFE7DD',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAF7F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleBox: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2A170F',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#C65D24',
    marginTop: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  pujaBannerCard: {
    margin: 16,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EFE7DD',
    padding: 16,
    shadowColor: '#2A170F',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  bannerTagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FDF2E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  deityTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C65D24',
  },
  festivalLiveTag: {
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  festivalLiveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  pujaBannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2A170F',
    marginTop: 8,
    lineHeight: 22,
  },
  pujaBannerSub: {
    fontSize: 12,
    color: '#554A41',
    marginTop: 4,
  },
  venueRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F4ECE3',
  },
  venueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  venueText: {
    fontSize: 11,
    color: '#786B60',
  },
  sectionBlock: {
    marginHorizontal: 16,
    marginBottom: 22,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFE7DD',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  sectionNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#C65D24',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2A170F',
  },
  sectionSubtitle: {
    fontSize: 10.5,
    color: '#786B60',
    marginTop: 1,
  },
  tiersGrid: {
    gap: 10,
  },
  tierCard: {
    borderRadius: 14,
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: '#EFE7DD',
    padding: 12,
    position: 'relative',
  },
  tierCardSelected: {
    backgroundColor: '#FFF8F2',
    borderColor: '#C65D24',
  },
  popularBadge: {
    position: 'absolute',
    top: -9,
    right: 12,
    backgroundColor: '#C65D24',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  popularBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  tierTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tierLeft: {
    flexDirection: 'row',
    gap: 10,
    flex: 1,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#A89F91',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioCircleActive: {
    borderColor: '#C65D24',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C65D24',
  },
  tierName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2A170F',
  },
  tierNameSelected: {
    color: '#C65D24',
    fontWeight: '800',
  },
  tierDakshina: {
    fontSize: 17,
    fontWeight: '900',
    color: '#C65D24',
  },
  tierDesc: {
    fontSize: 11,
    color: '#66594E',
    marginTop: 4,
    marginLeft: 28,
  },
  tierPillsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  tierPersonsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EFE7DD',
  },
  tierPersonsText: {
    fontSize: 9.5,
    color: '#786B60',
  },
  prasadPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FDF2E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  prasadText: {
    fontSize: 9.5,
    color: '#C65D24',
    fontWeight: '700',
  },
  fieldBox: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2A170F',
    marginBottom: 4,
  },
  fieldHint: {
    fontSize: 10.5,
    color: '#786B60',
    marginBottom: 6,
  },
  textInput: {
    borderRadius: 12,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE7DD',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#2A170F',
  },
  gotraChipsRow: {
    gap: 6,
    paddingVertical: 4,
  },
  gotraChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE7DD',
  },
  gotraChipSelected: {
    backgroundColor: '#C65D24',
    borderColor: '#C65D24',
  },
  gotraChipText: {
    fontSize: 11,
    color: '#786B60',
    fontWeight: '600',
  },
  gotraChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  familyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  addMemberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  addMemberText: {
    fontSize: 11,
    color: '#C65D24',
    fontWeight: '700',
  },
  familyMemberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  removeMemberBtn: {
    padding: 8,
  },
  wishChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  wishChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE7DD',
  },
  wishChipSelected: {
    backgroundColor: '#FDF2E9',
    borderColor: '#C65D24',
  },
  wishChipText: {
    fontSize: 11,
    color: '#786B60',
  },
  wishChipTextSelected: {
    color: '#C65D24',
    fontWeight: '700',
  },
  inclusionsBox: {
    backgroundColor: '#FAF7F2',
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  inclusionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  inclusionText: {
    fontSize: 12,
    color: '#4B3621',
    flex: 1,
    lineHeight: 18,
  },
  paymentMethodsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  payMethodCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: '#EFE7DD',
  },
  payMethodCardActive: {
    backgroundColor: '#FFF8F2',
    borderColor: '#C65D24',
  },
  payMethodText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#2A170F',
  },
  payMethodTextActive: {
    color: '#C65D24',
    fontWeight: '800',
  },
  payMethodSub: {
    fontSize: 9.5,
    color: '#786B60',
    marginTop: 1,
  },
  bottomBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EFE7DD',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  totalLabel: {
    fontSize: 11,
    color: '#786B60',
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: '#C65D24',
  },
  submitBtn: {
    height: 46,
    paddingHorizontal: 22,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    overflow: 'hidden',
  },
  submitBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  // Confirmed Receipt Screen Styles
  confirmedScroll: {
    padding: 20,
    alignItems: 'center',
  },
  confirmedCard: {
    width: '100%',
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EFE7DD',
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  successIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#E6F4EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  confirmedTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2A170F',
    textAlign: 'center',
  },
  confirmedSub: {
    fontSize: 12,
    color: '#554A41',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  bookingIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FDF2E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#F5DDC7',
  },
  bookingIdLabel: {
    fontSize: 11,
    color: '#786B60',
  },
  bookingIdVal: {
    fontSize: 12,
    fontWeight: '900',
    color: '#C65D24',
  },
  summaryTable: {
    width: '100%',
    marginTop: 16,
    borderRadius: 14,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE7DD',
    padding: 14,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryKey: {
    fontSize: 11,
    color: '#786B60',
  },
  summaryVal: {
    fontSize: 12,
    color: '#2A170F',
    fontWeight: '700',
    maxWidth: '65%',
    textAlign: 'right',
  },
  proofNotice: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    backgroundColor: '#FFF8F2',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  proofNoticeText: {
    fontSize: 11,
    color: '#9A3412',
    flex: 1,
    lineHeight: 16,
  },
  doneBtn: {
    width: '100%',
    backgroundColor: '#C65D24',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
