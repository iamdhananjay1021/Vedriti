import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Constants from 'expo-constants';
import {
  Calendar,
  CalendarCheck,
  Camera,
  ChevronRight,
  Clock,
  Compass,
  Flame,
  HelpCircle,
  LogOut,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  ScrollText,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
  UserRound,
  Users,
  Video,
} from 'lucide-react-native';
import { AppBackground } from '../components/common/AppBackground';
import { Avatar } from '../components/common/Avatar';
import { Button, Card, EmptyState, Field, StatusPill } from '../components/ui';
import { KeyboardAwareScrollView } from '../components/ui/KeyboardAwareScrollView';
import { THEME } from '../constants/theme';
import { RADIUS, SPACE } from '../constants/ui';
import { useAuth } from '../context/AuthContext';
import { useAvatarPicker } from '../hooks/useAvatarPicker';
import { api, PaymentRefType } from '../services/api';
import { openPayment } from '../services/payment';
import type { Booking, KundliRequest, Order } from '../types/api';
import { WEBSITE_URL } from '../config/api';
import {
  BOOKING_STATUS_LABELS,
  formatDate,
  formatDateTime,
  formatTime,
  KUNDLI_STATUS_LABELS,
  KUNDLI_TYPE_LABELS,
  MODE_LABELS,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  rupees,
  STATUS_COLORS,
} from '../utils/format';

export type AccountSection = 'bookings' | 'orders' | 'kundli' | 'family';

interface AccountScreenProps {
  section: AccountSection;
  onSectionChange: (section: AccountSection) => void;
  onEditProfile: () => void;
  onContactSupport: () => void;
  onNotificationPress?: () => void;
}

const SECTIONS: { id: AccountSection; label: string }[] = [
  { id: 'bookings', label: 'Bookings' },
  { id: 'orders', label: 'Orders' },
  { id: 'kundli', label: 'Kundli' },
  { id: 'family', label: 'Family' },
];

const POPULAR_RELATIONS = ['Wife', 'Husband', 'Son', 'Daughter', 'Mother', 'Father'];

const MenuRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  hint?: string;
  onPress: () => void;
  danger?: boolean;
  last?: boolean;
}> = ({ icon, label, hint, onPress, danger, last }) => (
  <TouchableOpacity
    style={[styles.menuRow, !last && styles.menuRowBorder]}
    onPress={onPress}
    activeOpacity={0.65}
    accessibilityRole="button"
  >
    <View style={styles.menuIconWrap}>{icon}</View>
    <View style={styles.flex}>
      <Text style={[styles.menuText, danger && styles.dangerText]}>{label}</Text>
      {hint ? <Text style={styles.menuHint}>{hint}</Text> : null}
    </View>
    <ChevronRight size={17} color="#9E9185" />
  </TouchableOpacity>
);

export const AccountScreen: React.FC<AccountScreenProps> = ({
  section,
  onSectionChange,
  onEditProfile,
  onContactSupport,
}) => {
  const { user, logout, deleteAccount, addFamilyMember, removeFamilyMember, refreshUser } = useAuth();
  const { busy: avatarBusy, openMenu } = useAvatarPicker();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [kundli, setKundli] = useState<KundliRequest[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [member, setMember] = useState({ name: '', relation: 'Wife', gotra: '' });
  const [memberErrors, setMemberErrors] = useState<Record<string, string>>({});
  const [savingMember, setSavingMember] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [b, o, k] = await Promise.allSettled([api.myBookings(), api.myOrders(), api.myKundli(), refreshUser()]);
    if (b.status === 'fulfilled') setBookings(b.value);
    if (o.status === 'fulfilled') setOrders(o.value);
    if (k.status === 'fulfilled') setKundli(k.value);
    const failed = [b, o, k].find((r) => r.status === 'rejected') as PromiseRejectedResult | undefined;
    if (failed) setError(failed.reason?.message || 'Could not load your data');
    setLoading(false);
  }, [refreshUser]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const payFor = async (type: PaymentRefType, reference: string, url: string | null) => {
    setBusyId(reference);
    try {
      const paymentUrl = url || (await api.payNow(type, reference)).paymentUrl;
      const ok = await openPayment(paymentUrl, type, reference);
      if (ok) Alert.alert('Payment Successful', 'Thank you! Your payment has been received.');
      await loadAll();
    } catch (e) {
      Alert.alert('Payment', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const confirmCancel = (title: string, message: string, action: () => Promise<unknown>, id: string) => {
    Alert.alert(title, message, [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Cancel',
        style: 'destructive',
        onPress: async () => {
          setBusyId(id);
          try {
            await action();
            await loadAll();
          } catch (e) {
            Alert.alert('Could not cancel', e instanceof Error ? e.message : 'Please try again.');
          } finally {
            setBusyId(null);
          }
        },
      },
    ]);
  };

  const saveMember = async () => {
    const next: Record<string, string> = {};
    if (member.name.trim().length < 2) next.name = 'Please enter member name';
    if (!member.relation.trim()) next.relation = 'Relation is required';
    setMemberErrors(next);
    if (Object.keys(next).length) return;
    setSavingMember(true);
    try {
      await addFamilyMember({
        name: member.name.trim(),
        relation: member.relation.trim(),
        gotra: member.gotra.trim() || user?.gotra || 'Kashyap',
        dateOfBirth: '',
        rashi: '',
        nakshatra: '',
      });
      setMember({ name: '', relation: 'Wife', gotra: '' });
      Alert.alert('Member Added', `${member.name.trim()} added to your family sankalp list.`);
    } catch (e) {
      Alert.alert('Could not add', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setSavingMember(false);
    }
  };

  const confirmRemoveMember = (id: string, name: string) => {
    Alert.alert('Remove Member?', `Remove ${name} from your family sankalp list?`, [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => removeFamilyMember(id).catch((e) => Alert.alert('Error', e.message)),
      },
    ]);
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete Account?',
      'Your profile, family members, and puja records will be permanently removed. Upcoming bookings will be cancelled.',
      [
        { text: 'Keep Account', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteAccount().catch((e) => Alert.alert('Could not delete', e.message)),
        },
      ]
    );
  };

  const confirmLogout = () => {
    Alert.alert('Logout?', 'You will need to login again to manage your bookings and rituals.', [
      { text: 'Stay', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const renderBooking = (b: Booking) => {
    const active = b.status === 'PENDING' || b.status === 'CONFIRMED';
    const unpaid = active && b.paymentStatus !== 'PAID' && b.amount > 0;
    const isConfirmed = b.status === 'CONFIRMED';
    const isCancelled = b.status === 'CANCELLED';

    return (
      <View key={b.id} style={[styles.flatItemCard, isConfirmed && styles.itemConfirmed, isCancelled && styles.itemCancelled]}>
        <View style={styles.itemHeader}>
          <View style={styles.flex}>
            <Text style={styles.bookingRef}>#{b.bookingId} • {MODE_LABELS[b.mode]}</Text>
            <Text style={styles.itemTitle}>{b.title}</Text>
          </View>
          <StatusPill label={BOOKING_STATUS_LABELS[b.status]} colors={STATUS_COLORS[b.status]} />
        </View>

        <View style={styles.itemMetaRow}>
          <Text style={styles.itemMetaText}>
            {formatDate(b.date)} • {formatTime(b.startTime)} - {formatTime(b.endTime)}
          </Text>
          {b.packageName ? <Text style={styles.itemMetaTag}>{b.packageName}</Text> : null}
        </View>

        <View style={styles.priceStrip}>
          <Text style={styles.priceAmount}>{rupees(b.amount)}</Text>
          <Text style={styles.priceStatus}>
            {b.paymentStatus === 'PAID'
              ? 'Paid'
              : b.paymentMethod === 'ONLINE'
              ? 'Payment Pending'
              : 'Pay After Puja'}
          </Text>
        </View>

        {b.panditNote ? (
          <View style={styles.panditNoteBox}>
            <Text style={styles.panditNoteText}>Pandit Ji: {b.panditNote}</Text>
          </View>
        ) : null}

        {isCancelled && b.cancelReason ? (
          <Text style={styles.cancelText}>Reason: {b.cancelReason}</Text>
        ) : null}

        {b.meetingLink ? (
          <TouchableOpacity
            style={styles.videoButton}
            onPress={() => Linking.openURL(b.meetingLink || '')}
            activeOpacity={0.8}
          >
            <Video size={15} color="#FFFFFF" />
            <Text style={styles.videoButtonText}>Join Video Call</Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.actionsRow}>
          {unpaid ? (
            <Button
              title="Pay Now"
              onPress={() => payFor('booking', b.bookingId, b.paymentUrl)}
              loading={busyId === b.bookingId}
              style={styles.flexBtn}
            />
          ) : null}
          {active ? (
            <Button
              title="Cancel"
              variant="outline"
              disabled={busyId === b.bookingId}
              onPress={() =>
                confirmCancel(
                  'Cancel Booking?',
                  `Cancel "${b.title}" scheduled on ${formatDate(b.date)}?`,
                  () => api.cancelBooking(b.bookingId),
                  b.bookingId
                )
              }
              style={styles.flexBtn}
            />
          ) : null}
        </View>
      </View>
    );
  };

  const renderOrder = (o: Order) => {
    const cancellable = o.status === 'PLACED' || o.status === 'CONFIRMED';
    return (
      <View key={o.id} style={styles.flatItemCard}>
        <View style={styles.itemHeader}>
          <View style={styles.flex}>
            <Text style={styles.bookingRef}>Order #{o.orderId}</Text>
            <Text style={styles.itemMetaText}>{formatDateTime(o.createdAt)}</Text>
          </View>
          <StatusPill label={ORDER_STATUS_LABELS[o.status]} colors={STATUS_COLORS[o.status]} />
        </View>

        <View style={styles.orderListBox}>
          {o.items.map((item) => (
            <View key={item.productId} style={styles.orderItemLine}>
              <Text style={styles.orderItemName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.orderItemQty}>×{item.quantity}</Text>
            </View>
          ))}
        </View>

        <View style={styles.priceStrip}>
          <Text style={styles.priceAmount}>{rupees(o.totalAmount)}</Text>
          <Text style={styles.priceStatus}>
            {o.paymentMethod === 'COD' ? 'Cash on Delivery' : PAYMENT_STATUS_LABELS[o.paymentStatus]}
          </Text>
        </View>

        {o.trackingNumber ? (
          <Text style={styles.trackingLine}>
            {o.courierPartner || 'Courier'}: {o.trackingNumber}
          </Text>
        ) : null}

        <View style={styles.actionsRow}>
          {o.paymentUrl ? (
            <Button
              title="Pay Now"
              onPress={() => payFor('order', o.orderId, o.paymentUrl)}
              loading={busyId === o.orderId}
              style={styles.flexBtn}
            />
          ) : null}
          {cancellable ? (
            <Button
              title="Cancel Order"
              variant="outline"
              disabled={busyId === o.orderId}
              onPress={() =>
                confirmCancel(
                  'Cancel Order?',
                  `Cancel order #${o.orderId}?`,
                  () => api.cancelOrder(o.orderId),
                  o.orderId
                )
              }
              style={styles.flexBtn}
            />
          ) : null}
        </View>
      </View>
    );
  };

  const renderKundli = (k: KundliRequest) => (
    <View key={k.id} style={styles.flatItemCard}>
      <View style={styles.itemHeader}>
        <View style={styles.flex}>
          <Text style={styles.bookingRef}>Inquiry #{k.requestId}</Text>
          <Text style={styles.itemTitle}>{KUNDLI_TYPE_LABELS[k.type]}</Text>
        </View>
        <StatusPill label={KUNDLI_STATUS_LABELS[k.status]} colors={STATUS_COLORS[k.status]} />
      </View>

      <Text style={styles.itemMetaText}>
        {k.primaryPerson.fullName}
        {k.partnerPerson ? ` & ${k.partnerPerson.fullName}` : ''} • {formatDate(k.primaryPerson.dateOfBirth)}
      </Text>

      <View style={styles.priceStrip}>
        <Text style={styles.priceAmount}>{rupees(k.amount)}</Text>
        <Text style={styles.priceStatus}>{PAYMENT_STATUS_LABELS[k.paymentStatus]}</Text>
      </View>

      {k.questions ? (
        <View style={styles.questionBox}>
          <Text style={styles.questionText}>&ldquo;{k.questions}&rdquo;</Text>
        </View>
      ) : null}

      {k.panditResponse ? (
        <View style={styles.panditResponseCard}>
          <Text style={styles.panditResponseHead}>Pandit Ji&apos;s Guidance:</Text>
          <Text style={styles.panditResponseText}>{k.panditResponse}</Text>
        </View>
      ) : (
        <Text style={styles.awaitingText}>Pandit Ji is analyzing your birth chart.</Text>
      )}

      {k.paymentUrl || (k.paymentStatus !== 'PAID' && k.amount > 0 && k.status !== 'CLOSED') ? (
        <Button
          title="Pay Offering"
          onPress={() => payFor('kundli', k.requestId, k.paymentUrl)}
          loading={busyId === k.requestId}
          style={styles.singleActionBtn}
        />
      ) : null}
    </View>
  );

  const renderFamily = () => (
    <View style={styles.familyWrapper}>
      <Text style={styles.blockHeading}>Family Sankalp Members</Text>
      <Text style={styles.blockSubtitle}>
        Members included by name and gotra in your puja rituals.
      </Text>

      {user?.familyMembers?.length ? (
        user.familyMembers.map((m) => (
          <View key={m.id} style={styles.memberCard}>
            <View style={styles.memberAvatar}>
              <UserRound size={17} color={C.primarySaffron} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.memberName}>{m.name}</Text>
              <Text style={styles.memberMeta}>
                {m.relation} • Gotra: {m.gotra || user?.gotra || 'Kashyap'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => confirmRemoveMember(m.id, m.name)}
              accessibilityLabel={`Remove ${m.name}`}
              style={styles.deleteBtn}
            >
              <Trash2 size={16} color="#DC2626" />
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No family members added</Text>
          <Text style={styles.emptySub}>Add members below to include them in puja sankalp.</Text>
        </View>
      )}

      <Card style={styles.addMemberBox}>
        <Text style={styles.addMemberTitle}>Add Family Member</Text>

        <Field
          label="Full Name *"
          required
          value={member.name}
          onChangeText={(v) => setMember((s) => ({ ...s, name: v }))}
          error={memberErrors.name}
          placeholder="e.g. Aarti Pandey"
        />

        <Text style={styles.fieldLabel}>Select Relation *</Text>
        <View style={styles.relationsWrap}>
          {POPULAR_RELATIONS.map((rel) => {
            const isSelected = member.relation === rel;
            return (
              <TouchableOpacity
                key={rel}
                onPress={() => setMember((s) => ({ ...s, relation: rel }))}
                style={[styles.relPill, isSelected && styles.relPillActive]}
              >
                <Text style={[styles.relPillText, isSelected && styles.relPillTextActive]}>{rel}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Field
          label="Gotra"
          value={member.gotra}
          onChangeText={(v) => setMember((s) => ({ ...s, gotra: v }))}
          placeholder={user?.gotra ? `Default: ${user.gotra}` : 'e.g. Garg / Kashyap'}
        />

        <Button
          title="Add to Sankalp"
          icon={<Plus size={15} color="#FFF" />}
          onPress={saveMember}
          loading={savingMember}
          style={styles.addSubmitBtn}
        />
      </Card>
    </View>
  );

  const list = section === 'bookings' ? bookings : section === 'orders' ? orders : section === 'kundli' ? kundli : null;
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '2026';
  const location = [user?.city, user?.state].filter(Boolean).join(', ');

  return (
    <AppBackground variant="golden">
      {/* SAFE MINIMAL TOP HEADER */}
      <View style={styles.topHeader}>
        <Text style={styles.screenTitle}>Your Profile</Text>
        <Text style={styles.screenSubtitle}>Manage your bookings, rituals & account</Text>
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={loading && Boolean(bookings)} onRefresh={loadAll} tintColor={C.primarySaffron} />}
      >
        {/* CLEAN, FLAT DEVOTEE PROFILE CARD (NO SHADOWS, NO UNNECESSARY BADGES) */}
        <View style={styles.profileSection}>
          <View style={styles.flatProfileCard}>
            <View style={styles.profileRow}>
              <View style={styles.avatarWrap}>
                <Avatar uri={user?.avatarUrl} name={user?.name} size={68} ring />
                <TouchableOpacity
                  onPress={openMenu}
                  activeOpacity={0.8}
                  style={styles.cameraIconBtn}
                  accessibilityLabel="Change photo"
                >
                  {avatarBusy ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Camera size={12} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.userInfoCol}>
                <Text style={styles.userName} numberOfLines={1}>
                  {user?.name || 'Devotee'}
                </Text>

                {user?.phone ? <Text style={styles.userPhone}>{user.phone}</Text> : null}

                <Text style={styles.userVedicMeta} numberOfLines={1}>
                  Gotra: {user?.gotra || 'Kashyap'} {location ? `• ${location}` : ''}
                </Text>
              </View>
            </View>

            {/* CLEAN ACTION BUTTONS (NO HEAVY SHADOWS) */}
            <View style={styles.cardActionsRow}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={onEditProfile}
                activeOpacity={0.8}
              >
                <Pencil size={13} color="#FFFFFF" />
                <Text style={styles.editBtnText}>Edit Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.photoBtn}
                onPress={openMenu}
                activeOpacity={0.8}
              >
                <Camera size={13} color={C.primarySaffron} />
                <Text style={styles.photoBtnText}>Change Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* MINIMAL SADHANA COUNTERS (CLEAN 4 STATS, NO BLURRY SHADOWS) */}
        <View style={styles.sadhanaSection}>
          <View style={styles.sadhanaCard}>
            <View style={styles.sadhanaTopBar}>
              <Text style={styles.sadhanaTitle}>Devotional Journey</Text>
              <Text style={styles.sadhanaSince}>Member since {memberSince}</Text>
            </View>

            <View style={styles.sadhanaColsRow}>
              <View style={styles.sadhanaCol}>
                <Text style={styles.sadhanaNum}>{user?.dailyPujaStreak || 0}d</Text>
                <Text style={styles.sadhanaLabel}>Daily Streak</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.sadhanaCol}>
                <Text style={styles.sadhanaNum}>{user?.totalJapaCount || 0}</Text>
                <Text style={styles.sadhanaLabel}>Mantra Japa</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.sadhanaCol}>
                <Text style={styles.sadhanaNum}>{user?.totalMalasCompleted || 0}</Text>
                <Text style={styles.sadhanaLabel}>Malas Done</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.sadhanaCol}>
                <Text style={styles.sadhanaNum}>{bookings?.length || 0}</Text>
                <Text style={styles.sadhanaLabel}>Pujas</Text>
              </View>
            </View>
          </View>
        </View>

        {/* VEDIC DETAILS (CLEAN 2x2 TILES, NO EXTRA BADGES) */}
        <View style={styles.vedicSection}>
          <View style={styles.vedicCard}>
            <View style={styles.vedicHead}>
              <Text style={styles.vedicHeadTitle}>Vedic & Sankalp Details</Text>
              <TouchableOpacity onPress={onEditProfile} hitSlop={6}>
                <Text style={styles.vedicEditLink}>Edit</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.vedicGrid}>
              <View style={styles.vedicBox}>
                <Text style={styles.vedicBoxLabel}>Gotra</Text>
                <Text style={styles.vedicBoxValue}>{user?.gotra || 'Kashyap'}</Text>
              </View>

              <View style={styles.vedicBox}>
                <Text style={styles.vedicBoxLabel}>Rashi</Text>
                <Text style={styles.vedicBoxValue}>{user?.rashi || 'Not Set'}</Text>
              </View>

              <View style={styles.vedicBox}>
                <Text style={styles.vedicBoxLabel}>Date of Birth</Text>
                <Text style={styles.vedicBoxValue}>
                  {user?.dateOfBirth ? formatDate(user.dateOfBirth) : 'Add DOB'}
                </Text>
              </View>

              <View style={styles.vedicBox}>
                <Text style={styles.vedicBoxLabel}>Family Members</Text>
                <Text style={styles.vedicBoxValue}>
                  {user?.familyMembers?.length ? `${user.familyMembers.length} Members` : '0 Added'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* CLEAN SEGMENTED TABS (NO LOUD BADGES) */}
        <View style={styles.tabsWrapper}>
          <View style={styles.tabsBar}>
            {SECTIONS.map((s) => {
              const isSelected = section === s.id;
              return (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.tabItem, isSelected && styles.tabItemActive]}
                  onPress={() => onSectionChange(s.id)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.tabItemText, isSelected && styles.tabItemTextActive]}>
                    {s.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* CONTENT LIST */}
        <View style={styles.listArea}>
          {error ? (
            <EmptyState
              title="Could not load data"
              subtitle={error}
              action={<Button title="Retry" onPress={loadAll} />}
            />
          ) : null}

          {!error && loading && !list && section !== 'family' ? (
            <ActivityIndicator color={C.primarySaffron} style={styles.loader} />
          ) : null}

          {!error && section === 'bookings' && bookings ? (
            bookings.length ? (
              bookings.map(renderBooking)
            ) : (
              <EmptyState
                title="No ritual bookings yet"
                subtitle="Book a Vedic puja or consultation from the Pujas tab."
              />
            )
          ) : null}

          {!error && section === 'orders' && orders ? (
            orders.length ? (
              orders.map(renderOrder)
            ) : (
              <EmptyState
                title="No kit orders yet"
                subtitle="Spiritual kits you purchase will appear here."
              />
            )
          ) : null}

          {!error && section === 'kundli' && kundli ? (
            kundli.length ? (
              kundli.map(renderKundli)
            ) : (
              <EmptyState
                title="No kundli queries yet"
                subtitle="Send your birth chart details to Pandit Ji for astrological advice."
              />
            )
          ) : null}

          {section === 'family' ? renderFamily() : null}
        </View>

        {/* ACCOUNT SETTINGS & SUPPORT (CLEAN iOS-STYLE GROUP) */}
        <View style={styles.menuContainer}>
          <Text style={styles.groupTitle}>Settings & Preferences</Text>
          <View style={styles.menuBox}>
            <MenuRow
              icon={<Pencil size={15} color="#8A4A1C" />}
              label="Edit Profile Details"
              hint="Name, birth details & address"
              onPress={onEditProfile}
            />
            <MenuRow
              icon={<Camera size={15} color="#8A4A1C" />}
              label="Profile Photo"
              hint={user?.avatarUrl ? 'Change or remove' : 'Upload photo'}
              onPress={openMenu}
              last
            />
          </View>

          <Text style={styles.groupTitle}>Help & Support</Text>
          <View style={styles.menuBox}>
            <MenuRow
              icon={<Phone size={15} color="#15803D" />}
              label="Contact Pandit Ji Helpline"
              hint="Call or WhatsApp assistance"
              onPress={onContactSupport}
            />
            <MenuRow
              icon={<MessageCircle size={15} color={C.primarySaffron} />}
              label="Privacy Policy"
              onPress={() => Linking.openURL(`${WEBSITE_URL}/privacy-policy`)}
              last
            />
          </View>

          <View style={[styles.menuBox, styles.logoutGap]}>
            <MenuRow
              icon={<LogOut size={15} color="#2A170F" />}
              label="Logout"
              onPress={confirmLogout}
            />
            <MenuRow
              icon={<Trash2 size={15} color="#DC2626" />}
              label="Delete Account"
              hint="Permanently remove your profile and data"
              onPress={confirmDelete}
              danger
              last
            />
          </View>

          <View style={styles.footerBranding}>
            <Text style={styles.versionLine}>VedRit • v{version}</Text>
            <Text style={styles.managedLine}>Managed by Urbexon Software Solutions LLP</Text>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </AppBackground>
  );
};

const C = THEME.colors;
const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingBottom: 50 },

  // TOP HEADER (SAFE FROM CAMERA CUTOUTS, CLEAN FONT)
  topHeader: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 14 : 8,
    paddingBottom: 8,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C120C',
    letterSpacing: -0.2,
  },
  screenSubtitle: {
    fontSize: 12.5,
    color: '#6E6053',
    marginTop: 2,
    fontWeight: '400',
  },

  // FLAT PROFILE CARD (NO SHADOWS, CLEAN BORDER)
  profileSection: {
    paddingHorizontal: 16,
    marginTop: 6,
  },
  flatProfileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E8DFD5',
    padding: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarWrap: {
    width: 72,
    height: 72,
    position: 'relative',
  },
  cameraIconBtn: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.primarySaffron,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfoCol: {
    flex: 1,
  },
  userName: {
    fontSize: 18.5,
    fontWeight: '700',
    color: '#1C120C',
  },
  userPhone: {
    fontSize: 13,
    color: '#594D44',
    marginTop: 2,
    fontWeight: '500',
  },
  userVedicMeta: {
    fontSize: 12,
    color: '#786C60',
    marginTop: 3,
    fontWeight: '400',
  },

  // CARD ACTIONS (FLAT, CLEAN PILLS)
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2ECE4',
  },
  editBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    backgroundColor: C.primarySaffron,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  editBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  photoBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FAF6EE',
    borderWidth: 1,
    borderColor: '#E8DFD5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  photoBtnText: {
    color: C.primarySaffron,
    fontWeight: '600',
    fontSize: 13,
  },

  // SADHANA STRIP (FLAT, CLEAN 4 STATS)
  sadhanaSection: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  sadhanaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8DFD5',
    padding: 12,
  },
  sadhanaTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2ECE4',
    marginBottom: 8,
  },
  sadhanaTitle: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1C120C',
  },
  sadhanaSince: {
    fontSize: 11,
    color: '#786C60',
    fontWeight: '400',
  },
  sadhanaColsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  sadhanaCol: {
    alignItems: 'center',
    flex: 1,
  },
  sadhanaNum: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#1C120C',
  },
  sadhanaLabel: {
    fontSize: 10,
    color: '#786C60',
    marginTop: 1,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 22,
    backgroundColor: '#E8DFD5',
  },

  // VEDIC DETAILS (CLEAN 2x2 GRID, NO BADGES)
  vedicSection: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  vedicCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8DFD5',
    padding: 12,
  },
  vedicHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2ECE4',
    marginBottom: 8,
  },
  vedicHeadTitle: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1C120C',
  },
  vedicEditLink: {
    fontSize: 11.5,
    fontWeight: '600',
    color: C.primarySaffron,
  },
  vedicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  vedicBox: {
    width: '48.5%',
    backgroundColor: '#FAF7F2',
    borderRadius: 10,
    padding: 8,
  },
  vedicBoxLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#786C60',
    textTransform: 'uppercase',
  },
  vedicBoxValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1C120C',
    marginTop: 2,
  },

  // TABS (CLEAN, NO LOUD BADGES)
  tabsWrapper: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  tabsBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8DFD5',
    padding: 3,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 9,
  },
  tabItemActive: {
    backgroundColor: C.primarySaffron,
  },
  tabItemText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#594D44',
  },
  tabItemTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // LIST AREA & FLAT CARDS
  listArea: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  loader: {
    marginVertical: 24,
  },
  flatItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8DFD5',
    padding: 13,
    marginBottom: 10,
  },
  itemConfirmed: {
    borderLeftWidth: 3.5,
    borderLeftColor: '#15803D',
  },
  itemCancelled: {
    borderLeftWidth: 3.5,
    borderLeftColor: '#DC2626',
    opacity: 0.75,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  bookingRef: {
    fontSize: 10.5,
    fontWeight: '600',
    color: C.primarySaffron,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C120C',
    marginTop: 1,
  },
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 5,
  },
  itemMetaText: {
    fontSize: 11.5,
    color: '#786C60',
    fontWeight: '400',
  },
  itemMetaTag: {
    fontSize: 11,
    color: '#8A4A1C',
    backgroundColor: '#FFF4E8',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    fontWeight: '500',
  },
  priceStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F2ECE4',
    paddingTop: 8,
    marginTop: 8,
  },
  priceAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C120C',
  },
  priceStatus: {
    fontSize: 11,
    fontWeight: '500',
    color: '#594D44',
  },
  panditNoteBox: {
    backgroundColor: '#FFF8F0',
    borderRadius: 8,
    padding: 7,
    marginTop: 6,
  },
  panditNoteText: {
    fontSize: 11.5,
    color: '#8A4A1C',
    lineHeight: 16,
  },
  cancelText: {
    fontSize: 11,
    color: '#DC2626',
    marginTop: 4,
  },
  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#7C3AED',
    borderRadius: 8,
    paddingVertical: 8,
    marginTop: 8,
  },
  videoButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  flexBtn: {
    flex: 1,
    minHeight: 36,
  },
  singleActionBtn: {
    marginTop: 8,
    minHeight: 36,
  },

  // ORDER SPECIFIC
  orderListBox: {
    backgroundColor: '#FAF7F2',
    borderRadius: 8,
    padding: 6,
    marginTop: 6,
  },
  orderItemLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 1,
  },
  orderItemName: {
    fontSize: 11.5,
    color: '#2A170F',
    flex: 1,
  },
  orderItemQty: {
    fontSize: 11.5,
    fontWeight: '600',
    color: C.primarySaffron,
  },
  trackingLine: {
    fontSize: 11,
    color: '#15803D',
    marginTop: 5,
  },

  // KUNDLI SPECIFIC
  questionBox: {
    backgroundColor: '#F7F4EF',
    borderRadius: 6,
    padding: 6,
    marginTop: 6,
  },
  questionText: {
    fontSize: 11.5,
    color: '#4A3E34',
    fontStyle: 'italic',
  },
  panditResponseCard: {
    backgroundColor: '#FFFBF5',
    borderRadius: 8,
    padding: 8,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#F0E2D0',
  },
  panditResponseHead: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#8A4A1C',
  },
  panditResponseText: {
    fontSize: 12,
    color: '#2A170F',
    lineHeight: 16,
    marginTop: 2,
  },
  awaitingText: {
    fontSize: 11,
    color: '#786C60',
    marginTop: 6,
  },

  // FAMILY SPECIFIC
  familyWrapper: {
    marginTop: 2,
  },
  blockHeading: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C120C',
  },
  blockSubtitle: {
    fontSize: 11.5,
    color: '#786C60',
    marginBottom: 8,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E8DFD5',
    marginBottom: 6,
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF4E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C120C',
  },
  memberMeta: {
    fontSize: 11,
    color: '#786C60',
    marginTop: 1,
  },
  deleteBtn: {
    padding: 6,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8DFD5',
    padding: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C120C',
  },
  emptySub: {
    fontSize: 11,
    color: '#786C60',
    marginTop: 2,
  },
  addMemberBox: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8DFD5',
    padding: 12,
  },
  addMemberTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C120C',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#594D44',
    marginBottom: 4,
    marginTop: 2,
  },
  relationsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginBottom: 10,
  },
  relPill: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E8DFD5',
  },
  relPillActive: {
    backgroundColor: C.primarySaffron,
    borderColor: C.primarySaffron,
  },
  relPillText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#594D44',
  },
  relPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  addSubmitBtn: {
    marginTop: 6,
  },

  // SETTINGS & MENU (iOS-STYLE FLAT GROUP)
  menuContainer: {
    marginTop: 10,
  },
  groupTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#786C60',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  menuBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E8DFD5',
    overflow: 'hidden',
  },
  logoutGap: {
    marginTop: 10,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F2ECE4',
  },
  menuIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: '#FAF7F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#1C120C',
  },
  menuHint: {
    fontSize: 10.5,
    color: '#786C60',
    marginTop: 1,
  },
  dangerText: {
    color: '#DC2626',
  },

  // FOOTER
  footerBranding: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  versionLine: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#9E9185',
  },
  managedLine: {
    fontSize: 10,
    color: '#9E9185',
    marginTop: 2,
  },
});
