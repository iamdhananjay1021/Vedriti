import React, { useState } from 'react';
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
import { X, Check, ShoppingBag, Truck, ShieldCheck, CheckCircle2 } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { PujaKit } from '../../data/mockData';

interface ProductDetailModalProps {
  kit: PujaKit | null;
  visible: boolean;
  onClose: () => void;
  onOrderSuccess: (orderId: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  kit,
  visible,
  onClose,
  onOrderSuccess,
}) => {
  const [step, setStep] = useState<'details' | 'checkout' | 'success'>('details');
  const [shippingAddress, setShippingAddress] = useState('Sector 62, Noida, UP - 201309');
  const [recipientName, setRecipientName] = useState('Anand Sharma');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [isOrdering, setIsOrdering] = useState(false);

  if (!kit) return null;

  const handleCheckout = () => {
    setIsOrdering(true);
    setTimeout(() => {
      setIsOrdering(false);
      setStep('success');
      setTimeout(() => {
        setStep('details');
        onOrderSuccess('VR-ORD-' + Math.floor(1000 + Math.random() * 9000));
        onClose();
      }, 1800);
    }, 1200);
  };

  const handleResetClose = () => {
    setStep('details');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.eyebrow}>
                {step === 'details'
                  ? 'Puja Samagri Kit'
                  : step === 'checkout'
                  ? 'Delivery & Checkout'
                  : 'Order Placed'}
              </Text>
              <Text style={styles.sheetTitle} numberOfLines={1}>
                {kit.name}
              </Text>
            </View>
            <TouchableOpacity onPress={handleResetClose} style={styles.closeCircle}>
              <X size={18} color="#4A3B32" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {step === 'success' ? (
              <View style={styles.confirmState}>
                <View style={styles.successIconCircle}>
                  <CheckCircle2 size={42} color="#16A34A" />
                </View>
                <Text style={styles.confirmTitle}>Order Placed Successfully!</Text>
                <Text style={styles.confirmDesc}>
                  Your sacred samagri kit has been booked. It will be consecrated with mantras and dispatched within 24 hours.
                </Text>
              </View>
            ) : step === 'checkout' ? (
              <View style={styles.checkoutForm}>
                <Text style={styles.sectionHeading}>Shipping Address</Text>
                <TextInput
                  value={recipientName}
                  onChangeText={setRecipientName}
                  placeholder="Full Name"
                  style={styles.textInput}
                />
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Phone Number"
                  keyboardType="phone-pad"
                  style={styles.textInput}
                />
                <TextInput
                  value={shippingAddress}
                  onChangeText={setShippingAddress}
                  placeholder="Complete Address with Pincode"
                  multiline
                  numberOfLines={2}
                  style={styles.textInput}
                />

                {/* Price Breakdown */}
                <View style={styles.priceBreakdown}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.bodyText}>Kit Price</Text>
                    <Text style={styles.boldText}>₹{kit.price}</Text>
                  </View>
                  <View style={styles.rowBetween}>
                    <Text style={styles.bodyText}>Delivery (Doorstep Express)</Text>
                    <Text style={[styles.boldText, { color: '#16A34A' }]}>FREE</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.rowBetween}>
                    <Text style={styles.totalText}>Total Amount</Text>
                    <Text style={styles.totalValue}>₹{kit.price}</Text>
                  </View>
                </View>

                {/* Place Order CTA */}
                <TouchableOpacity
                  onPress={handleCheckout}
                  disabled={isOrdering}
                  activeOpacity={0.85}
                  style={styles.mainCtaButton}
                >
                  <Text style={styles.mainCtaText}>
                    {isOrdering ? 'Processing Order...' : `Place Order • ₹${kit.price}`}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.detailsContainer}>
                <Image source={kit.image} style={styles.heroProductImage} resizeMode="cover" />

                <Text style={styles.tagline}>{kit.tagline}</Text>

                <View style={styles.priceRow}>
                  <Text style={styles.priceCurrent}>₹{kit.price}</Text>
                  <Text style={styles.priceOriginal}>₹{kit.originalPrice}</Text>
                  <View style={styles.discountPill}>
                    <Text style={styles.discountText}>
                      {Math.round(((kit.originalPrice - kit.price) / kit.originalPrice) * 100)}% OFF
                    </Text>
                  </View>
                </View>

                <Text style={styles.sectionHeading}>Description</Text>
                <Text style={styles.bodyDescription}>{kit.description}</Text>

                <Text style={styles.sectionHeading}>Items Included ({kit.itemsCount}+ items)</Text>
                {kit.itemsIncluded.map((item, idx) => (
                  <View key={idx} style={styles.bulletRow}>
                    <Check size={14} color="#C65D24" />
                    <Text style={styles.bulletText}>{item}</Text>
                  </View>
                ))}

                <View style={styles.trustBadgeRow}>
                  <View style={styles.trustPill}>
                    <ShieldCheck size={14} color="#C65D24" />
                    <Text style={styles.trustText}>100% Pure & Vedic Certified</Text>
                  </View>
                  <View style={styles.trustPill}>
                    <Truck size={14} color="#C65D24" />
                    <Text style={styles.trustText}>Dispatched in 24 Hours</Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => setStep('checkout')}
                  activeOpacity={0.85}
                  style={[styles.mainCtaButton, { marginTop: 18 }]}
                >
                  <ShoppingBag size={16} color="#FFF" />
                  <Text style={[styles.mainCtaText, { marginLeft: 8 }]}>Proceed to Checkout  →</Text>
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
    fontSize: 17,
    fontWeight: '700',
    color: THEME.colors.heading,
    marginTop: 2,
    maxWidth: 270,
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
  heroProductImage: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 12,
    color: THEME.colors.mutedText,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 14,
  },
  priceCurrent: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.heading,
  },
  priceOriginal: {
    fontSize: 13,
    color: THEME.colors.mutedText,
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  discountPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  discountText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#16A34A',
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.heading,
    marginTop: 10,
    marginBottom: 6,
  },
  bodyDescription: {
    fontSize: 12.5,
    lineHeight: 18,
    color: THEME.colors.bodyText,
    marginBottom: 10,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  bulletText: {
    fontSize: 12,
    color: THEME.colors.bodyText,
    marginLeft: 8,
  },
  trustBadgeRow: {
    flexDirection: 'row',
    marginTop: 14,
  },
  trustPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF2E9',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 8,
  },
  trustText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: THEME.colors.heading,
    marginLeft: 5,
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
  },
  mainCtaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  checkoutForm: {
    paddingBottom: 24,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: THEME.colors.heading,
    marginBottom: 10,
  },
  priceBreakdown: {
    backgroundColor: '#FBF8F3',
    borderRadius: 14,
    padding: 14,
    marginVertical: 14,
    borderWidth: 1,
    borderColor: '#EEDDC9',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  bodyText: {
    fontSize: 12,
    color: THEME.colors.bodyText,
  },
  boldText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.heading,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEDDC9',
    marginVertical: 8,
  },
  totalText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.heading,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.deepTerracotta,
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
