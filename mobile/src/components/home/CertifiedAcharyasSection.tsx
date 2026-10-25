import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Award, ShieldCheck, Star, Video, CheckCircle2 } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { CERTIFIED_ACHARYAS, CertifiedAcharya } from '../../data/mockData';

interface CertifiedAcharyasSectionProps {
  onConsultAcharyaPress?: (acharya: CertifiedAcharya) => void;
}

export const CertifiedAcharyasSection: React.FC<CertifiedAcharyasSectionProps> = ({
  onConsultAcharyaPress,
}) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.badgeRow}>
          <ShieldCheck size={14} color="#D4AF37" />
          <Text style={styles.badgeText}>Authentic Vedic Pedigree</Text>
        </View>
        <Text style={styles.sectionTitle}>Certified Acharya Parishad</Text>
        <Text style={styles.sectionSubtitle}>
          Revered scholars from Sampurnanand Sanskrit University & Kashi Gurukuls
        </Text>
      </View>

      {/* Horizontal Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        {CERTIFIED_ACHARYAS.map((acharya) => (
          <View key={acharya.id} style={styles.card}>
            <View style={styles.cardSurface}>
              {/* Top Banner Accent */}
              <View style={styles.topRow}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitial}>
                    {acharya.name.charAt(acharya.name.indexOf('पं.') + 3) || 'आ'}
                  </Text>
                </View>

                <View style={styles.ratingBadge}>
                  <Star size={10} color="#D4AF37" fill="#D4AF37" />
                  <Text style={styles.ratingText}>{acharya.rating}</Text>
                  <Text style={styles.totalPujas}>({acharya.totalPujas}+)</Text>
                </View>
              </View>

              {/* Acharya Info */}
              <Text style={styles.acharyaName} numberOfLines={1}>
                {acharya.name}
              </Text>
              <Text style={styles.acharyaTitle} numberOfLines={2}>
                {acharya.title}
              </Text>

              {/* Pedigree & Experience */}
              <View style={styles.pedigreeBox}>
                <Award size={11} color="#C65D24" style={{ marginTop: 1 }} />
                <Text style={styles.pedigreeText} numberOfLines={2}>
                  {acharya.pedigree}
                </Text>
              </View>

              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Specialty:</Text>
                <Text style={styles.specVal} numberOfLines={1}>
                  {acharya.vedicSpecialty}
                </Text>
              </View>

              <View style={styles.experienceRow}>
                <CheckCircle2 size={11} color="#16A34A" />
                <Text style={styles.expText}>
                  {acharya.experienceYears}+ Yrs Vedic Karmakand Experience
                </Text>
              </View>

              {/* Consultation CTA */}
              <TouchableOpacity
                onPress={() => onConsultAcharyaPress && onConsultAcharyaPress(acharya)}
                activeOpacity={0.85}
                style={styles.consultBtn}
              >
                <Video size={12} color="#FFF" />
                <Text style={styles.consultBtnText}>Request Guidance</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  headerRow: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#996515',
    marginLeft: 4,
    letterSpacing: 0.2,
  },
  sectionTitle: {
    fontFamily: THEME.typography.serif,
    fontSize: 19,
    fontWeight: '800',
    color: THEME.colors.headingDeep,
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: THEME.colors.mutedText,
    marginTop: 2,
  },
  scrollList: {
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 4,
  },
  card: {
    width: 250,
    marginRight: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFE7DD',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  cardSurface: {
    padding: 14,
    justifyContent: 'space-between',
    minHeight: 250,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FAF0E4',
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.deepTerracotta,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF9',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F3E4D4',
  },
  ratingText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: THEME.colors.headingDeep,
    marginLeft: 3,
  },
  totalPujas: {
    fontSize: 9,
    color: THEME.colors.mutedText,
    marginLeft: 2,
  },
  acharyaName: {
    fontFamily: THEME.typography.serif,
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.headingDeep,
    marginBottom: 2,
  },
  acharyaTitle: {
    fontSize: 10.5,
    color: THEME.colors.deepTerracotta,
    fontWeight: '600',
    lineHeight: 14,
    marginBottom: 8,
  },
  pedigreeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FCFAF7',
    padding: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F3E8DC',
    marginBottom: 8,
  },
  pedigreeText: {
    fontSize: 9.5,
    color: THEME.colors.bodyText,
    marginLeft: 5,
    lineHeight: 13,
    flex: 1,
  },
  specRow: {
    marginBottom: 6,
  },
  specLabel: {
    fontSize: 9.5,
    color: THEME.colors.mutedText,
    fontWeight: '600',
  },
  specVal: {
    fontSize: 10.5,
    fontWeight: '700',
    color: THEME.colors.headingDeep,
    marginTop: 1,
  },
  experienceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  expText: {
    fontSize: 9.5,
    color: '#15803D',
    fontWeight: '700',
    marginLeft: 4,
  },
  consultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.primarySaffron,
    paddingVertical: 7,
    borderRadius: 12,
  },
  consultBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 5,
  },
});
