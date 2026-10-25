import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
} from 'react-native';
import {
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  Star,
  Sparkles,
  Search,
  X,
  CheckCircle2,
  PackageCheck,
  Info,
} from 'lucide-react-native';
import { AppBackground } from '../components/common/AppBackground';
import { AppHeader } from '../components/common/AppHeader';
import { THEME } from '../constants/theme';
import { PUJA_KITS, PujaKit } from '../data/mockData';

interface StoreScreenProps {
  onSelectKit: (kit: PujaKit) => void;
  onNotificationPress?: () => void;
}

const STORE_CATEGORIES = ['All Items', 'Hawan Kits', 'Rudraksha', 'Yantras', 'Gangajal & Dhoop'];

export const StoreScreen: React.FC<StoreScreenProps> = ({
  onSelectKit,
  onNotificationPress,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewKit, setPreviewKit] = useState<PujaKit | null>(null);

  const filteredKits = useMemo(() => {
    return PUJA_KITS.filter((k) => {
      // Category filter
      const matchesCategory =
        selectedCategory === 'All Items' || k.category === selectedCategory;

      // Search filter
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === '' ||
        k.name.toLowerCase().includes(query) ||
        k.tagline.toLowerCase().includes(query) ||
        (k.category && k.category.toLowerCase().includes(query)) ||
        (k.description && k.description.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <AppBackground variant="golden">
      {/* Luxury App Header */}
      <AppHeader
        title="Vedic Store & Samagri"
        subtitle="100% Consecrated Temple Artifacts & Hawan Kits"
        onNotificationPress={onNotificationPress}
      />

      {/* Main Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Purity Guarantee Ribbon */}
        <View style={styles.topNotice}>
          <ShieldCheck size={14} color="#C65D24" strokeWidth={2.2} />
          <Text style={styles.guaranteeText}>
            100% Shuddh Vedic Samagri • Consecrated by Kashi Acharyas • Lab Certified
          </Text>
        </View>

        {/* Clean Search Input */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={15} color="#8A8177" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search samagri, kits, rudraksha, yantras..."
              placeholderTextColor="#A89E94"
              style={styles.searchInput}
            />
            {searchQuery.trim().length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
                <X size={14} color="#8A8177" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScrollView}
          contentContainerStyle={styles.categoryScroll}
        >
          {STORE_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.8}
                style={[
                  styles.categoryChip,
                  isSelected && styles.categoryChipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected && styles.categoryChipTextSelected,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Section Heading & Result Count */}
        <View style={styles.listHeaderRow}>
          <Text style={styles.listTitle}>
            {selectedCategory === 'All Items' ? 'Featured Vedic Samagri' : selectedCategory}
          </Text>
          <Text style={styles.resultCount}>
            {filteredKits.length} {filteredKits.length === 1 ? 'Item' : 'Items'} Available
          </Text>
        </View>

        {/* Products List - Clean Modern Luxury White Cards */}
        {filteredKits.map((kit) => {
          const discountPercent = Math.round(
            ((kit.originalPrice - kit.price) / kit.originalPrice) * 100
          );

          return (
            <View key={kit.id} style={styles.productCard}>
              {/* Product Image Showcase with 16:9 aspect ratio */}
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setPreviewKit(kit)}
                style={styles.imageContainer}
              >
                <Image
                  source={kit.image}
                  style={styles.productImage}
                  resizeMode="contain"
                />

                {/* Floating Category/Badge Pill */}
                <View style={styles.floatingBadgesRow}>
                  {kit.badge && (
                    <View style={styles.badgePill}>
                      <Text style={styles.badgeText}>{kit.badge}</Text>
                    </View>
                  )}
                  {kit.certified && (
                    <View style={styles.certifiedPill}>
                      <Sparkles size={8.5} color="#D4AF37" />
                      <Text style={styles.certifiedText}>Kashi Certified</Text>
                    </View>
                  )}
                </View>

                {/* Rating Badge */}
                <View style={styles.ratingBadge}>
                  <Star size={9.5} color="#D4AF37" fill="#D4AF37" />
                  <Text style={styles.ratingValue}>{kit.rating || 4.95}</Text>
                </View>
              </TouchableOpacity>

              {/* Product Details Section */}
              <View style={styles.cardContent}>
                {/* Title & Items Count */}
                <View style={styles.titleRow}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {kit.name}
                  </Text>
                  {kit.itemsCount && kit.itemsCount > 1 ? (
                    <View style={styles.itemsBadge}>
                      <Text style={styles.itemsBadgeText}>{kit.itemsCount} Items</Text>
                    </View>
                  ) : null}
                </View>

                {/* Tagline / Subtitle */}
                <Text style={styles.productTagline} numberOfLines={2}>
                  {kit.tagline}
                </Text>

                {/* Included Samagri Highlights Preview */}
                {kit.itemsIncluded && kit.itemsIncluded.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setPreviewKit(kit)}
                    activeOpacity={0.75}
                    style={styles.previewHighlightsRow}
                  >
                    <Info size={11} color="#C65D24" />
                    <Text style={styles.previewHighlightsText}>
                      Includes: {kit.itemsIncluded.slice(0, 3).join(', ')}...
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Price & Action Row */}
                <View style={styles.priceRow}>
                  <View style={styles.priceCol}>
                    <View style={styles.rowBaseline}>
                      <Text style={styles.priceValue}>₹{kit.price.toLocaleString('en-IN')}</Text>
                      {kit.originalPrice > kit.price ? (
                        <Text style={styles.priceOld}>₹{kit.originalPrice.toLocaleString('en-IN')}</Text>
                      ) : null}
                      {discountPercent > 0 ? (
                        <View style={styles.discountBadge}>
                          <Text style={styles.discountText}>{discountPercent}% OFF</Text>
                        </View>
                      ) : null}
                    </View>
                    <View style={styles.deliveryRow}>
                      <Truck size={10.5} color="#15803D" />
                      <Text style={styles.deliveryText}>Free Consecrated Delivery</Text>
                    </View>
                  </View>

                  {/* Order Button */}
                  <TouchableOpacity
                    onPress={() => onSelectKit(kit)}
                    activeOpacity={0.88}
                    style={styles.orderButton}
                  >
                    <ShoppingBag size={12} color="#FFFFFF" />
                    <Text style={styles.orderButtonText}>Order Now</Text>
                    <ArrowRight size={11} color="#FFFFFF" style={{ marginLeft: 3 }} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Kit Detail Preview Modal */}
      {previewKit && (
        <Modal
          visible={Boolean(previewKit)}
          transparent
          animationType="fade"
          onRequestClose={() => setPreviewKit(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalCategory}>{previewKit.category}</Text>
                  <Text style={styles.modalTitle} numberOfLines={2}>{previewKit.name}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setPreviewKit(null)}
                  style={styles.closeBtn}
                >
                  <X size={18} color="#2A170F" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                <Text style={styles.modalDesc}>{previewKit.description}</Text>

                <View style={styles.ingredientsBox}>
                  <View style={styles.ingredientsHeaderRow}>
                    <PackageCheck size={14} color="#C65D24" />
                    <Text style={styles.ingredientsTitle}>
                      Consecrated Samagri Included ({previewKit.itemsIncluded?.length || 0} Items):
                    </Text>
                  </View>
                  {previewKit.itemsIncluded?.map((item, idx) => (
                    <View key={idx} style={styles.ingredientItem}>
                      <CheckCircle2 size={12} color="#15803D" style={{ marginTop: 2 }} />
                      <Text style={styles.ingredientText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <View>
                  <Text style={styles.modalPriceLabel}>Consecrated Price</Text>
                  <Text style={styles.modalPriceValue}>₹{previewKit.price.toLocaleString('en-IN')}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    const kit = previewKit;
                    setPreviewKit(null);
                    onSelectKit(kit);
                  }}
                  activeOpacity={0.88}
                  style={styles.modalOrderBtn}
                >
                  <ShoppingBag size={13} color="#FFFFFF" />
                  <Text style={styles.modalOrderBtnText}>Proceed to Order</Text>
                  <ArrowRight size={12} color="#FFFFFF" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </AppBackground>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  topNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF2E9',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F8DEC8',
  },
  guaranteeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#C65D24',
    marginLeft: 7,
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFE7DD',
    paddingHorizontal: 12,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: THEME.colors.headingDeep,
    marginLeft: 8,
    paddingVertical: 4,
  },
  clearBtn: {
    padding: 4,
  },
  categoryScrollView: {
    flexGrow: 0,
    marginVertical: 6,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    paddingVertical: 2,
    alignItems: 'center',
  },
  categoryChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#EFE7DD',
    marginRight: 7,
  },
  categoryChipSelected: {
    backgroundColor: '#C65D24',
    borderColor: '#C65D24',
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.headingDeep,
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 10,
  },
  listTitle: {
    fontFamily: THEME.typography.serif,
    fontSize: 17,
    fontWeight: '800',
    color: THEME.colors.headingDeep,
  },
  resultCount: {
    fontSize: 10.5,
    fontWeight: '700',
    color: THEME.colors.mutedText,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EFE7DD',
    padding: 12,
  },
  imageContainer: {
    width: '100%',
    height: 155,
    borderRadius: 14,
    backgroundColor: '#FAF7F2',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  productImage: {
    width: '88%',
    height: '88%',
  },
  floatingBadgesRow: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgePill: {
    backgroundColor: '#C65D24',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 7,
    marginRight: 5,
  },
  badgeText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  certifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(42, 23, 15, 0.88)',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 7,
    borderWidth: 0.5,
    borderColor: '#D4AF37',
  },
  certifiedText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#F7E7B4',
    marginLeft: 3,
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#EFE7DD',
  },
  ratingValue: {
    fontSize: 9.5,
    fontWeight: '800',
    color: THEME.colors.headingDeep,
    marginLeft: 3,
  },
  cardContent: {
    paddingTop: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productName: {
    fontFamily: THEME.typography.serif,
    fontSize: 15.5,
    fontWeight: '800',
    color: THEME.colors.headingDeep,
    flex: 1,
    marginRight: 8,
  },
  itemsBadge: {
    backgroundColor: '#FAF5EE',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EFE7DD',
  },
  itemsBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#78350F',
  },
  productTagline: {
    fontSize: 11,
    color: THEME.colors.mutedText,
    marginTop: 3,
    lineHeight: 15,
  },
  previewHighlightsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCFAF7',
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 8,
    marginTop: 6,
    borderWidth: 0.5,
    borderColor: '#F1E6D8',
  },
  previewHighlightsText: {
    fontSize: 9.5,
    color: '#8A5D3B',
    fontWeight: '600',
    marginLeft: 5,
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5EFE7',
  },
  priceCol: {},
  rowBaseline: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceValue: {
    fontSize: 17,
    fontWeight: '900',
    color: THEME.colors.headingDeep,
  },
  priceOld: {
    fontSize: 11.5,
    color: THEME.colors.mutedText,
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  discountBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 6,
  },
  discountText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#DC2626',
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  deliveryText: {
    fontSize: 9.5,
    color: '#15803D',
    fontWeight: '700',
    marginLeft: 4,
  },
  orderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C65D24',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 14,
  },
  orderButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    maxHeight: '80%',
    padding: 18,
    borderWidth: 1,
    borderColor: '#EFE7DD',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5EFE7',
  },
  modalCategory: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#C65D24',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalTitle: {
    fontFamily: THEME.typography.serif,
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.headingDeep,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  modalScroll: {
    marginVertical: 10,
  },
  modalDesc: {
    fontSize: 11.5,
    lineHeight: 16.5,
    color: THEME.colors.headingDeep,
    marginBottom: 12,
  },
  ingredientsBox: {
    backgroundColor: '#FAF7F2',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EFE7DD',
  },
  ingredientsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ingredientsTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.headingDeep,
    marginLeft: 6,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 2.5,
  },
  ingredientText: {
    fontSize: 11,
    color: THEME.colors.headingDeep,
    marginLeft: 6,
    flex: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5EFE7',
  },
  modalPriceLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: THEME.colors.mutedText,
  },
  modalPriceValue: {
    fontSize: 18,
    fontWeight: '900',
    color: THEME.colors.headingDeep,
  },
  modalOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C65D24',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  modalOrderBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 5,
  },
});
