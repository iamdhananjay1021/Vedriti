import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ShieldCheck, UserCheck, PackageCheck, Lock, Sparkles, CheckCircle2 } from 'lucide-react-native';
import { THEME } from '../../constants/theme';

export const TrustSection: React.FC = () => {
  const pillars = [
    {
      id: 'authentic',
      title: 'Authentic Vedic Vidhi',
      subtitle: 'Strict Shastric Vidhan & Sanskrit Mantras',
      icon: ShieldCheck,
    },
    {
      id: 'guidance',
      title: 'Certified Acharyas',
      subtitle: 'Sampurnanand & BHU Sanskrit Scholars',
      icon: UserCheck,
    },
    {
      id: 'quality',
      title: '100% Shuddh Samagri',
      subtitle: 'A2 Cow Ghee, Gangajal & Bhimseni Kapur',
      icon: PackageCheck,
    },
    {
      id: 'payments',
      title: 'Digital Sankalp Vault',
      subtitle: 'Live Video Proof & Consecrated Prasad',
      icon: Sparkles,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <LinearGradient
          colors={['#D4AF37', '#F7E7B4', '#D4AF37']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.goldLine}
        />

        <View style={styles.header}>
          <Text style={styles.badgeText}>VEDIC AUTHENTICITY GUARANTEE</Text>
          <Text style={styles.sectionHeading}>Why Devotees Trust VedRiti</Text>
          <Text style={styles.sectionSubheading}>
            Rooted in Kashi tradition, consecrated with authentic shraddha and purity.
          </Text>
        </View>

        <View style={styles.grid}>
          {pillars.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <View
                key={item.id}
                style={[
                  styles.pillarItem,
                  index % 2 === 0 ? styles.borderRight : null,
                  index < 2 ? styles.borderBottom : null,
                ]}
              >
                <View style={styles.iconCircle}>
                  <IconComponent size={16} color={THEME.colors.primarySaffron} strokeWidth={2} />
                </View>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFE7DD',
    overflow: 'hidden',
  },
  goldLine: {
    height: 2,
    width: '100%',
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#996515',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  sectionHeading: {
    fontFamily: THEME.typography.serif,
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.headingDeep,
    letterSpacing: -0.2,
  },
  sectionSubheading: {
    fontSize: 11,
    color: THEME.colors.mutedText,
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    paddingBottom: 12,
  },
  pillarItem: {
    width: '50%',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  borderRight: {
    borderRightWidth: 1,
    borderRightColor: '#F3EAE0',
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3EAE0',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FDF2E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#F8DECA',
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.headingDeep,
    lineHeight: 15,
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 10,
    color: THEME.colors.mutedText,
    lineHeight: 13,
  },
});
