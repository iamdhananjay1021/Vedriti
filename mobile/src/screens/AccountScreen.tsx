import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  CalendarCheck,
  FileText,
  PhoneCall,
  Clock,
  ShieldCheck,
  Award,
  Truck,
  CheckCircle2,
  Sparkles,
  QrCode,
  Download,
  Share2,
  Users,
  LogOut,
  LogIn,
  Plus,
  Trash2,
  Languages,
  X,
} from 'lucide-react-native';
import { AppBackground } from '../components/common/AppBackground';
import { AppHeader } from '../components/common/AppHeader';
import { THEME } from '../constants/theme';
import {
  MOCK_USER_BOOKINGS,
  DEVOTEE_SANKALP_RECORD,
} from '../data/mockData';
import { useAuth, FamilyMember } from '../context/AuthContext';
import { LanguageCode, TRANSLATIONS } from '../services/languageService';

interface AccountScreenProps {
  onContactSupport: () => void;
  onNotificationPress?: () => void;
}

type AccountTab = 'bookings' | 'sankalp' | 'prasad' | 'family';

export const AccountScreen: React.FC<AccountScreenProps> = ({
  onContactSupport,
  onNotificationPress,
}) => {
  const { user, openAuthModal, logout, addFamilyMember, removeFamilyMember } = useAuth();
  const [activeTab, setActiveTab] = useState<AccountTab>('bookings');
  const [currentLang, setCurrentLang] = useState<LanguageCode>('hi');

  // Add Family Member form state
  const [isAddFamilyModalOpen, setIsAddFamilyModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRelation, setNewMemberRelation] = useState('धर्मपत्नी (Spouse)');
  const [newMemberGotra, setNewMemberGotra] = useState(user.gotra || 'Kashyap Gotra');
  const [newMemberRashi, setNewMemberRashi] = useState('Mesh (Aries)');

  const handleDownloadPatra = () => {
    Alert.alert(
      'Sankalp Patra Downloaded 📜',
      'Your consecrated Vedic Sankalp Patra has been saved in high-resolution PDF format with Acharya Ji’s digital seal.',
      [{ text: 'Jai Shri Krishna' }]
    );
  };

  const handleSaveFamilyMember = () => {
    if (!newMemberName.trim()) {
      Alert.alert('नाम आवश्यक', 'कृपया परिवार सदस्य का नाम दर्ज करें।');
      return;
    }
    addFamilyMember({
      name: newMemberName.trim(),
      relation: newMemberRelation,
      gotra: newMemberGotra.trim() || user.gotra,
      rashi: newMemberRashi,
    });
    setNewMemberName('');
    setIsAddFamilyModalOpen(false);
    Alert.alert('सदस्य नामांकित! 🌿', `${newMemberName} को आपके पारिवारिक संकल्प में जोड़ लिया गया है।`);
  };

  const strings = TRANSLATIONS[currentLang];

  return (
    <AppBackground variant="golden">
      {/* Universal Luxury App Header */}
      <AppHeader
        title={strings.accountTab}
        subtitle="Devotee Credentials & Consecrated Records"
        onNotificationPress={onNotificationPress}
      />

      {/* Devotee Profile Card */}
      <View style={styles.topProfileSection}>
        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.isLoggedIn ? (user.name.charAt(0) || 'य') : 'ॐ'}
              </Text>
            </View>

            <View style={styles.userTextCol}>
              <View style={styles.userNameRow}>
                <Text style={styles.userName} numberOfLines={1}>{user.name}</Text>
                {user.isLoggedIn && (
                  <View style={styles.vipBadge}>
                    <Sparkles size={8} color="#D4AF37" />
                    <Text style={styles.vipText}>VedRiti VIP</Text>
                  </View>
                )}
              </View>

              <Text style={styles.userPhone}>
                {user.isLoggedIn ? (user.phone || user.email) : 'प्रवेश नहीं किया गया है'}
              </Text>

              {user.isLoggedIn ? (
                <View style={styles.gotraPill}>
                  <Text style={styles.gotraText}>
                    गोत्र: {user.gotra} • कुलदेवी: {user.kuldevi}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Login / Logout Button */}
            {user.isLoggedIn ? (
              <TouchableOpacity
                onPress={logout}
                activeOpacity={0.7}
                style={styles.logoutBtn}
                accessibilityLabel="Log out"
              >
                <LogOut size={13} color="#9E2A1A" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={openAuthModal}
                activeOpacity={0.8}
                style={styles.loginCtaBtn}
              >
                <LogIn size={13} color="#FFF" />
                <Text style={styles.loginCtaText}>{strings.login}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Punya Points & Language Switcher Ribbon */}
          <View style={styles.punyaRibbon}>
            <View style={styles.punyaLeft}>
              <Award size={13} color="#C65D24" />
              <Text style={styles.punyaTitle}>Punya Balance:</Text>
              <Text style={styles.punyaAmount}>{user.punyaPoints} Punya</Text>
            </View>

            {/* Language Switcher Chips */}
            <View style={styles.langChipsRow}>
              {(['hi', 'en', 'sa'] as LanguageCode[]).map((lang) => (
                <TouchableOpacity
                  key={lang}
                  onPress={() => setCurrentLang(lang)}
                  style={[
                    styles.langChip,
                    currentLang === lang && styles.langChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.langChipText,
                      currentLang === lang && styles.langChipTextActive,
                    ]}
                  >
                    {lang === 'hi' ? 'हिन्दी' : lang === 'en' ? 'ENG' : 'संस्कृत'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* 4-Way Tab Toggle */}
        <View style={styles.tabToggle}>
          <TouchableOpacity
            onPress={() => setActiveTab('bookings')}
            style={[styles.toggleBtn, activeTab === 'bookings' && styles.activeToggleBtn]}
          >
            <CalendarCheck size={11} color={activeTab === 'bookings' ? '#FFF' : '#7E7266'} />
            <Text style={[styles.toggleBtnText, activeTab === 'bookings' && styles.activeToggleBtnText]}>
              Bookings ({MOCK_USER_BOOKINGS.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('sankalp')}
            style={[styles.toggleBtn, activeTab === 'sankalp' && styles.activeToggleBtn]}
          >
            <Award size={11} color={activeTab === 'sankalp' ? '#FFF' : '#7E7266'} />
            <Text style={[styles.toggleBtnText, activeTab === 'sankalp' && styles.activeToggleBtnText]}>
              Sankalp Patra
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('prasad')}
            style={[styles.toggleBtn, activeTab === 'prasad' && styles.activeToggleBtn]}
          >
            <Truck size={11} color={activeTab === 'prasad' ? '#FFF' : '#7E7266'} />
            <Text style={[styles.toggleBtnText, activeTab === 'prasad' && styles.activeToggleBtnText]}>
              Prasad Track
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('family')}
            style={[styles.toggleBtn, activeTab === 'family' && styles.activeToggleBtn]}
          >
            <Users size={11} color={activeTab === 'family' ? '#FFF' : '#7E7266'} />
            <Text style={[styles.toggleBtnText, activeTab === 'family' && styles.activeToggleBtnText]}>
              परिवार ({user.familyMembers.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollList}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Tab 1: Bookings */}
        {activeTab === 'bookings' && (
          <View>
            {MOCK_USER_BOOKINGS.map((booking) => {
              const isConfirmed = booking.status === 'Confirmed';
              return (
                <View key={booking.id} style={styles.card}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.bookingId}>Booking #{booking.id}</Text>
                    <View
                      style={[
                        styles.statusPill,
                        { backgroundColor: isConfirmed ? '#DCFCE7' : '#F3ECE3' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: isConfirmed ? '#16A34A' : '#786F66' },
                        ]}
                      >
                        {booking.status}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.pujaTitle}>{booking.pujaName}</Text>

                  <View style={styles.rowItem}>
                    <Clock size={12} color="#C65D24" />
                    <Text style={styles.metaText}>
                      {booking.date} • {booking.timeSlot}
                    </Text>
                  </View>

                  <View style={styles.rowItem}>
                    <ShieldCheck size={12} color="#A7471B" />
                    <Text style={styles.metaText}>{booking.panditJi}</Text>
                  </View>

                  <View style={styles.cardFooter}>
                    <Text style={styles.amountText}>
                      Dakshina: ₹{booking.amount.toLocaleString('en-IN')}
                    </Text>

                    <TouchableOpacity
                      onPress={() => setActiveTab('prasad')}
                      activeOpacity={0.8}
                      style={styles.trackPrasadBtn}
                    >
                      <Truck size={11} color="#C65D24" />
                      <Text style={styles.trackPrasadText}>Track Holy Prasad</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Tab 2: Digital Sankalp Patra */}
        {activeTab === 'sankalp' && (
          <View style={styles.patraContainer}>
            <LinearGradient
              colors={['#FFFDF9', '#FAF3E8', '#F3E4D2']}
              style={styles.patraCard}
            >
              <View style={styles.certificateBorder}>
                <View style={styles.certificateHeader}>
                  <Text style={styles.certOm}>ॐ</Text>
                  <Text style={styles.certBrand}>VEDRITI VEDIC SANCTUM</Text>
                  <Text style={styles.certTitle}>प्रशस्ति पत्रम् (Sankalp Patra)</Text>
                  <Text style={styles.certSub}>
                    Issued under the authority of Kashi Vishwanath Vidvat Parishad
                  </Text>
                </View>

                <View style={styles.certBody}>
                  <Text style={styles.certShloka}>
                    "यस्य स्मरणमात्रेण जन्मसंसारबन्धनात्। विमुच्यते नमस्तस्मै विष्णवे प्रभविष्णवे॥"
                  </Text>

                  <View style={styles.certFieldRow}>
                    <Text style={styles.certFieldLabel}>यजमान (Devotee):</Text>
                    <Text style={styles.certFieldValue}>{user.name}</Text>
                  </View>

                  <View style={styles.certFieldRow}>
                    <Text style={styles.certFieldLabel}>गोत्र (Gotra Lineage):</Text>
                    <Text style={styles.certFieldValue}>{user.gotra}</Text>
                  </View>

                  <View style={styles.certFieldRow}>
                    <Text style={styles.certFieldLabel}>अनुष्ठान (Sacred Ritual):</Text>
                    <Text style={styles.certFieldValue}>{DEVOTEE_SANKALP_RECORD.pujaName}</Text>
                  </View>

                  <View style={styles.certFieldRow}>
                    <Text style={styles.certFieldLabel}>स्थानम् (Sanctum Altar):</Text>
                    <Text style={styles.certFieldValue}>{DEVOTEE_SANKALP_RECORD.templeGarbhagriha}</Text>
                  </View>

                  <View style={styles.certFieldRow}>
                    <Text style={styles.certFieldLabel}>आचार्य (Head Priest):</Text>
                    <Text style={styles.certFieldValue}>{DEVOTEE_SANKALP_RECORD.acharyaName}</Text>
                  </View>
                </View>

                <View style={styles.certFooter}>
                  <View style={styles.sealCircle}>
                    <Text style={styles.sealText}>VEDIC{'\n'}SEAL{'\n'}ॐ</Text>
                  </View>

                  <View style={styles.certActions}>
                    <TouchableOpacity
                      onPress={handleDownloadPatra}
                      activeOpacity={0.85}
                      style={styles.downloadBtn}
                    >
                      <Download size={12} color="#FFF" />
                      <Text style={styles.downloadBtnText}>Download PDF</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Tab 3: Prasad Courier Tracker */}
        {activeTab === 'prasad' && (
          <View style={styles.trackerCard}>
            <View style={styles.trackerHeader}>
              <View>
                <Text style={styles.trackerTitle}>Consecrated Holy Prasad</Text>
                <Text style={styles.trackerSub}>
                  Courier Partner: {DEVOTEE_SANKALP_RECORD.courierPartner}
                </Text>
                <Text style={styles.awbText}>AWB #{DEVOTEE_SANKALP_RECORD.awbNumber}</Text>
              </View>

              <View style={styles.etaBadge}>
                <Text style={styles.etaLabel}>Estimated Arrival</Text>
                <Text style={styles.etaTime}>{DEVOTEE_SANKALP_RECORD.estimatedDelivery}</Text>
              </View>
            </View>

            <View style={styles.stepperContainer}>
              {DEVOTEE_SANKALP_RECORD.stages.map((stage, idx) => (
                <View key={stage.step} style={styles.stepRow}>
                  <View style={styles.stepIndicatorCol}>
                    <View
                      style={[
                        styles.stepDot,
                        stage.isCompleted && styles.stepDotCompleted,
                        stage.isCurrent && styles.stepDotCurrent,
                      ]}
                    >
                      {stage.isCompleted ? (
                        <CheckCircle2 size={12} color="#FFF" />
                      ) : (
                        <Text style={styles.stepNumText}>{stage.step}</Text>
                      )}
                    </View>

                    {idx < DEVOTEE_SANKALP_RECORD.stages.length - 1 && (
                      <View
                        style={[
                          styles.stepLine,
                          stage.isCompleted && styles.stepLineCompleted,
                        ]}
                      />
                    )}
                  </View>

                  <View style={styles.stepDetailsCol}>
                    <View style={styles.stepTitleRow}>
                      <Text style={[styles.stageTitle, stage.isCurrent && styles.stageTitleCurrent]}>
                        {stage.title}
                      </Text>
                      <Text style={styles.stageTimestamp}>{stage.timestamp}</Text>
                    </View>
                    <Text style={styles.stageSubtext}>{stage.subtext}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Tab 4: Family Member Gotra Directory */}
        {activeTab === 'family' && (
          <View>
            {/* Header with Add Button */}
            <View style={styles.familyHeaderRow}>
              <View>
                <Text style={styles.familyHeading}>पारिवारिक गोत्र निर्देशिका</Text>
                <Text style={styles.familySub}>
                  संकल्प के समय 1-टैप में परिवार के सदस्यों का नाम जोड़ें
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setIsAddFamilyModalOpen(true)}
                activeOpacity={0.8}
                style={styles.addMemberBtn}
              >
                <Plus size={12} color="#FFF" />
                <Text style={styles.addMemberBtnText}>सदस्य जोड़ें</Text>
              </TouchableOpacity>
            </View>

            {/* Family Members Cards */}
            {user.familyMembers.map((member) => (
              <View key={member.id} style={styles.familyCard}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberAvatarText}>{member.name.charAt(0)}</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <View style={styles.memberNameRow}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <View style={styles.relationBadge}>
                      <Text style={styles.relationText}>{member.relation}</Text>
                    </View>
                  </View>

                  <Text style={styles.memberGotraText}>
                    गोत्र: {member.gotra} {member.rashi ? `• राशि: ${member.rashi}` : ''}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => removeFamilyMember(member.id)}
                  style={styles.deleteMemberBtn}
                >
                  <Trash2 size={14} color="#A7471B" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Family Member Modal */}
      <Modal
        visible={isAddFamilyModalOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setIsAddFamilyModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.addMemberSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>नया परिवार सदस्य जोड़ें</Text>
              <TouchableOpacity onPress={() => setIsAddFamilyModalOpen(false)}>
                <X size={18} color="#4A3428" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>पूरा नाम (Full Name) *</Text>
            <TextInput
              value={newMemberName}
              onChangeText={setNewMemberName}
              placeholder="उदा. सुनीता शर्मा"
              placeholderTextColor="#A89E94"
              style={styles.formInput}
            />

            <Text style={styles.inputLabel}>संबंध (Relationship) *</Text>
            <TextInput
              value={newMemberRelation}
              onChangeText={setNewMemberRelation}
              placeholder="उदा. धर्मपत्नी, पुत्र, पुत्री, माताजी"
              placeholderTextColor="#A89E94"
              style={styles.formInput}
            />

            <Text style={styles.inputLabel}>गोत्र (Gotra)</Text>
            <TextInput
              value={newMemberGotra}
              onChangeText={setNewMemberGotra}
              placeholder="उदा. कश्यप गोत्र"
              placeholderTextColor="#A89E94"
              style={styles.formInput}
            />

            <Text style={styles.inputLabel}>जन्म राशि (Rashi - Optional)</Text>
            <TextInput
              value={newMemberRashi}
              onChangeText={setNewMemberRashi}
              placeholder="उदा. कर्क (Cancer)"
              placeholderTextColor="#A89E94"
              style={styles.formInput}
            />

            <TouchableOpacity
              onPress={handleSaveFamilyMember}
              activeOpacity={0.88}
              style={styles.saveMemberSubmitBtn}
            >
              <LinearGradient
                colors={THEME.gradients.vermilionSunset}
                style={styles.saveMemberGradient}
              >
                <CheckCircle2 size={15} color="#FFF" />
                <Text style={styles.saveMemberText}>निर्देशिका में सहेजें (Save Member)</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </AppBackground>
  );
};

const styles = StyleSheet.create({
  topProfileSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    marginBottom: 10,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EFE7DD',
    overflow: 'hidden',
    marginBottom: 10,
  },
  goldLine: {
    height: 2,
    width: '100%',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FAF0E4',
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.colors.deepTerracotta,
  },
  userTextCol: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontFamily: THEME.typography.serif,
    fontSize: 16.5,
    fontWeight: '800',
    color: THEME.colors.headingDeep,
    flex: 1,
  },
  vipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#26130A',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 6,
    marginLeft: 4,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  vipText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#F7E7B4',
    marginLeft: 2,
  },
  userPhone: {
    fontSize: 11,
    color: THEME.colors.mutedText,
    marginTop: 1,
  },
  gotraPill: {
    backgroundColor: '#FDF2E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#F8DECA',
  },
  gotraText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: THEME.colors.deepTerracotta,
  },
  logoutBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FAF0E4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFE0D0',
    marginLeft: 8,
  },
  loginCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.primarySaffron,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 8,
  },
  loginCtaText: {
    color: '#FFF',
    fontSize: 10.5,
    fontWeight: '800',
    marginLeft: 4,
  },
  punyaRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FCFAF7',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderTopWidth: 1,
    borderTopColor: '#F5ECE1',
  },
  punyaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  punyaTitle: {
    fontSize: 10,
    color: THEME.colors.bodyText,
    marginLeft: 4,
  },
  punyaAmount: {
    fontSize: 10.5,
    fontWeight: '800',
    color: THEME.colors.headingDeep,
    marginLeft: 4,
  },
  langChipsRow: {
    flexDirection: 'row',
  },
  langChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#FAF5EE',
    marginLeft: 4,
    borderWidth: 0.5,
    borderColor: '#EFE2D3',
  },
  langChipActive: {
    backgroundColor: '#C65D24',
    borderColor: '#C65D24',
  },
  langChipText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: THEME.colors.bodyText,
  },
  langChipTextActive: {
    color: '#FFF',
  },
  tabToggle: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 3,
    borderWidth: 1,
    borderColor: '#EFE7DD',
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 12,
  },
  activeToggleBtn: {
    backgroundColor: THEME.colors.primarySaffron,
  },
  toggleBtnText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: THEME.colors.bodyText,
    marginLeft: 3,
  },
  activeToggleBtnText: {
    color: '#FFFFFF',
  },
  scrollList: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EFE7DD',
    padding: 14,
    marginBottom: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  bookingId: {
    fontSize: 10.5,
    color: THEME.colors.mutedText,
    fontWeight: '700',
  },
  statusPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  pujaTitle: {
    fontFamily: THEME.typography.serif,
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.headingDeep,
    marginBottom: 6,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 10.5,
    color: THEME.colors.bodyText,
    marginLeft: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F5ECE1',
  },
  amountText: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.headingDeep,
  },
  trackPrasadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF2E9',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F8DECA',
  },
  trackPrasadText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: THEME.colors.deepTerracotta,
    marginLeft: 4,
  },
  patraContainer: {
    marginBottom: 20,
  },
  patraCard: {
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    padding: 12,
  },
  certificateBorder: {
    borderWidth: 1.5,
    borderColor: '#C59A3F',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 14,
  },
  certificateHeader: {
    alignItems: 'center',
    marginBottom: 10,
  },
  certOm: {
    fontSize: 22,
    color: '#8B1E0F',
    fontWeight: '900',
  },
  certBrand: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#996515',
    letterSpacing: 1,
    marginTop: 2,
  },
  certTitle: {
    fontFamily: THEME.typography.serif,
    fontSize: 16,
    fontWeight: '900',
    color: THEME.colors.headingDeep,
    marginTop: 2,
  },
  certSub: {
    fontSize: 9,
    color: THEME.colors.mutedText,
    textAlign: 'center',
    marginTop: 2,
  },
  certBody: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EAD7C2',
    marginVertical: 8,
  },
  certShloka: {
    fontFamily: THEME.typography.serif,
    fontSize: 11,
    fontStyle: 'italic',
    color: THEME.colors.royalVermilion,
    textAlign: 'center',
    marginBottom: 10,
  },
  certFieldRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 5,
  },
  certFieldLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: THEME.colors.headingDeep,
    width: 110,
  },
  certFieldValue: {
    fontSize: 10.5,
    color: THEME.colors.bodyText,
    flex: 1,
    fontWeight: '600',
  },
  certFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  sealCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#8B1E0F',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF0E4',
  },
  sealText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#8B1E0F',
    textAlign: 'center',
    lineHeight: 10,
  },
  certActions: {},
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.primarySaffron,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  downloadBtnText: {
    color: '#FFF',
    fontSize: 10.5,
    fontWeight: '800',
    marginLeft: 4,
  },
  trackerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#EFE0D0',
    padding: 16,
    marginBottom: 20,
    shadowColor: '#382016',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  trackerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5ECE1',
    marginBottom: 14,
  },
  trackerTitle: {
    fontFamily: THEME.typography.serif,
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.headingDeep,
  },
  trackerSub: {
    fontSize: 10.5,
    color: THEME.colors.bodyText,
    marginTop: 2,
  },
  awbText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: THEME.colors.deepTerracotta,
    marginTop: 2,
  },
  etaBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'flex-end',
  },
  etaLabel: {
    fontSize: 8,
    color: '#166534',
    fontWeight: '700',
  },
  etaTime: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  stepperContainer: {},
  stepRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  stepIndicatorCol: {
    alignItems: 'center',
    marginRight: 10,
    width: 22,
  },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EFE5D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotCompleted: {
    backgroundColor: '#16A34A',
  },
  stepDotCurrent: {
    backgroundColor: THEME.colors.primarySaffron,
  },
  stepNumText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFF',
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#EFE5D9',
    marginTop: 4,
  },
  stepLineCompleted: {
    backgroundColor: '#16A34A',
  },
  stepDetailsCol: {
    flex: 1,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stageTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.headingDeep,
  },
  stageTitleCurrent: {
    color: THEME.colors.royalVermilion,
    fontWeight: '800',
  },
  stageTimestamp: {
    fontSize: 9.5,
    color: THEME.colors.mutedText,
  },
  stageSubtext: {
    fontSize: 10.5,
    color: THEME.colors.bodyText,
    marginTop: 2,
    lineHeight: 14,
  },
  familyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  familyHeading: {
    fontFamily: THEME.typography.serif,
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.headingDeep,
  },
  familySub: {
    fontSize: 10.5,
    color: THEME.colors.mutedText,
    marginTop: 1,
    maxWidth: 220,
  },
  addMemberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.primarySaffron,
    paddingHorizontal: 10,
    paddingVertical: 5.5,
    borderRadius: 10,
  },
  addMemberBtnText: {
    color: '#FFF',
    fontSize: 10.5,
    fontWeight: '800',
    marginLeft: 3,
  },
  familyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFE7DD',
    marginBottom: 8,
  },
  memberAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FAF0E4',
    borderWidth: 1,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  memberAvatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.deepTerracotta,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberName: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.headingDeep,
    marginRight: 6,
  },
  relationBadge: {
    backgroundColor: '#FDF2E9',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 5,
  },
  relationText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: THEME.colors.deepTerracotta,
  },
  memberGotraText: {
    fontSize: 10,
    color: THEME.colors.mutedText,
    marginTop: 2,
  },
  deleteMemberBtn: {
    padding: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(26, 16, 9, 0.7)',
    justifyContent: 'flex-end',
  },
  addMemberSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
    borderTopWidth: 2,
    borderTopColor: '#D4AF37',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sheetTitle: {
    fontFamily: THEME.typography.serif,
    fontSize: 16.5,
    fontWeight: '800',
    color: THEME.colors.headingDeep,
  },
  inputLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: THEME.colors.headingDeep,
    marginBottom: 3,
  },
  formInput: {
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#EBDDCB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7.5,
    fontSize: 12,
    color: THEME.colors.headingDeep,
    marginBottom: 10,
  },
  saveMemberSubmitBtn: {
    marginTop: 8,
    borderRadius: 14,
    overflow: 'hidden',
  },
  saveMemberGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  saveMemberText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 6,
  },
});
