import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Linking, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import { Camera, CalendarCheck, ChevronRight, LogOut, MessageCircle, Pencil, Phone, Plus, ScrollText, ShieldCheck, ShoppingBag, Trash2, UserRound, Video } from 'lucide-react-native';
import { AppBackground } from '../components/common/AppBackground';
import { AppHeader } from '../components/common/AppHeader';
import { Avatar } from '../components/common/Avatar';
import { Button, Card, EmptyState, Field, StatusPill } from '../components/ui';
import { KeyboardAwareScrollView } from '../components/ui/KeyboardAwareScrollView';
import { THEME } from '../constants/theme';
import { RADIUS, SPACE, TYPE } from '../constants/ui';
import { useAuth } from '../context/AuthContext';
import { useAvatarPicker } from '../hooks/useAvatarPicker';
import { api, PaymentRefType } from '../services/api';
import { openPayment } from '../services/payment';
import type { Booking, KundliRequest, Order } from '../types/api';
import { WEBSITE_URL } from '../config/api';
import { profileCompleteness } from '../utils/profile';
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

const ProgressBar: React.FC<{ percent: number }> = ({ percent }) => (
  <View style={styles.progressTrack}>
    <View style={[styles.progressFill, { width: `${percent}%` }]} />
  </View>
);

const SegmentedTabs: React.FC<{ value: AccountSection; onChange: (v: AccountSection) => void }> = ({ value, onChange }) => (
  <View style={styles.tabs}>
    {SECTIONS.map((s) => (
      <TouchableOpacity
        key={s.id}
        style={[styles.tab, value === s.id && styles.tabActive]}
        onPress={() => onChange(s.id)}
        accessibilityRole="tab"
        accessibilityState={{ selected: value === s.id }}
      >
        <Text style={[styles.tabText, value === s.id && styles.tabTextActive]}>{s.label}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

const MenuRow: React.FC<{ icon: React.ReactNode; tint: string; label: string; hint?: string; onPress: () => void; danger?: boolean; last?: boolean }> = ({
  icon,
  tint,
  label,
  hint,
  onPress,
  danger,
  last,
}) => (
  <TouchableOpacity style={[styles.menuRow, !last && styles.menuRowBorder]} onPress={onPress} activeOpacity={0.7} accessibilityRole="button">
    <View style={[styles.menuIcon, { backgroundColor: tint }]}>{icon}</View>
    <View style={styles.flex}>
      <Text style={[styles.menuText, danger && styles.dangerText]}>{label}</Text>
      {hint ? <Text style={styles.menuHint}>{hint}</Text> : null}
    </View>
    <ChevronRight size={18} color={THEME.colors.mutedText} />
  </TouchableOpacity>
);

export const AccountScreen: React.FC<AccountScreenProps> = ({ section, onSectionChange, onEditProfile, onContactSupport, onNotificationPress }) => {
  const { user, logout, deleteAccount, addFamilyMember, removeFamilyMember, refreshUser } = useAuth();
  const { busy: avatarBusy, openMenu } = useAvatarPicker();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [kundli, setKundli] = useState<KundliRequest[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [member, setMember] = useState({ name: '', relation: '', gotra: '' });
  const [memberErrors, setMemberErrors] = useState<Record<string, string>>({});
  const [savingMember, setSavingMember] = useState(false);

  const { percent, missing } = useMemo(() => profileCompleteness(user), [user]);

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
      if (ok) Alert.alert('Payment successful', 'Thank you! Your payment has been received.');
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
        text: 'Cancel it',
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
    if (member.name.trim().length < 2) next.name = 'Name is required';
    if (member.relation.trim().length < 2) next.relation = 'Relation is required';
    setMemberErrors(next);
    if (Object.keys(next).length) return;
    setSavingMember(true);
    try {
      await addFamilyMember({ name: member.name.trim(), relation: member.relation.trim(), gotra: member.gotra.trim(), dateOfBirth: '', rashi: '', nakshatra: '' });
      setMember({ name: '', relation: '', gotra: '' });
    } catch (e) {
      Alert.alert('Could not add', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setSavingMember(false);
    }
  };

  const confirmRemoveMember = (id: string, name: string) => {
    Alert.alert('Remove member?', `${name} will be removed from your family list.`, [
      { text: 'Keep', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeFamilyMember(id).catch((e) => Alert.alert('Could not remove', e.message)) },
    ]);
  };

  const confirmDelete = () => {
    Alert.alert('Delete account?', 'Your profile, photo, family members and saved details will be permanently deleted. Upcoming bookings will be cancelled. This cannot be undone.', [
      { text: 'Keep account', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteAccount().catch((e) => Alert.alert('Could not delete', e.message)) },
    ]);
  };

  const confirmLogout = () => {
    Alert.alert('Logout?', 'You will need to login again to book.', [
      { text: 'Stay', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const renderBooking = (b: Booking, i: number) => {
    const active = b.status === 'PENDING' || b.status === 'CONFIRMED';
    const unpaid = active && b.paymentStatus !== 'PAID' && b.amount > 0;
    return (
      <View key={b.id}>
        <Card style={styles.item}>
          <View style={styles.itemHead}>
            <Text style={styles.itemTitle}>{b.title}</Text>
            <StatusPill label={BOOKING_STATUS_LABELS[b.status]} colors={STATUS_COLORS[b.status]} />
          </View>
          <Text style={styles.itemMeta}>
            {formatDate(b.date)} • {formatTime(b.startTime)} - {formatTime(b.endTime)}
          </Text>
          <Text style={styles.itemMeta}>
            {MODE_LABELS[b.mode]}
            {b.packageName ? ` • ${b.packageName}` : ''}
          </Text>
          <Text style={styles.itemMeta}>
            {b.bookingId} • {rupees(b.amount)} • {PAYMENT_STATUS_LABELS[b.paymentStatus]}
          </Text>
          {b.panditNote ? <Text style={styles.note}>Pandit Ji: {b.panditNote}</Text> : null}
          {b.status === 'CANCELLED' && b.cancelReason ? <Text style={styles.cancelNote}>{b.cancelReason}</Text> : null}
          {b.meetingLink ? <Button title="Join video call" icon={<Video size={16} color="#FFF" />} onPress={() => Linking.openURL(b.meetingLink)} style={styles.action} /> : null}
          <View style={styles.actions}>
            {unpaid ? <Button title="Pay now" onPress={() => payFor('booking', b.bookingId, b.paymentUrl)} loading={busyId === b.bookingId} style={styles.flexBtn} /> : null}
            {active ? (
              <Button
                title="Cancel"
                variant="outline"
                disabled={busyId === b.bookingId}
                onPress={() => confirmCancel('Cancel booking?', `${b.title} on ${formatDate(b.date)} at ${formatTime(b.startTime)} will be cancelled.`, () => api.cancelBooking(b.bookingId), b.bookingId)}
                style={styles.flexBtn}
              />
            ) : null}
          </View>
        </Card>
      </View>
    );
  };

  const renderOrder = (o: Order, i: number) => {
    const cancellable = o.status === 'PLACED' || o.status === 'CONFIRMED';
    return (
      <View key={o.id}>
        <Card style={styles.item}>
          <View style={styles.itemHead}>
            <Text style={styles.itemTitle}>{o.orderId}</Text>
            <StatusPill label={ORDER_STATUS_LABELS[o.status]} colors={STATUS_COLORS[o.status]} />
          </View>
          <Text style={styles.itemMeta}>{formatDateTime(o.createdAt)}</Text>
          {o.items.map((item) => (
            <Text key={item.productId} style={styles.itemMeta}>
              {item.quantity} × {item.name}
            </Text>
          ))}
          <Text style={styles.itemMeta}>
            {rupees(o.totalAmount)} • {o.paymentMethod === 'COD' ? 'Cash on delivery' : PAYMENT_STATUS_LABELS[o.paymentStatus]}
          </Text>
          {o.trackingNumber ? (
            <Text style={styles.note}>
              {o.courierPartner || 'Courier'}: {o.trackingNumber}
            </Text>
          ) : null}
          {o.adminNote ? <Text style={styles.note}>{o.adminNote}</Text> : null}
          {o.status === 'CANCELLED' && o.cancelReason ? <Text style={styles.cancelNote}>{o.cancelReason}</Text> : null}
          <View style={styles.actions}>
            {o.paymentUrl ? <Button title="Pay now" onPress={() => payFor('order', o.orderId, o.paymentUrl)} loading={busyId === o.orderId} style={styles.flexBtn} /> : null}
            {cancellable ? (
              <Button
                title="Cancel"
                variant="outline"
                disabled={busyId === o.orderId}
                onPress={() => confirmCancel('Cancel order?', `Order ${o.orderId} will be cancelled.`, () => api.cancelOrder(o.orderId), o.orderId)}
                style={styles.flexBtn}
              />
            ) : null}
          </View>
        </Card>
      </View>
    );
  };

  const renderKundli = (k: KundliRequest, i: number) => (
    <View key={k.id}>
      <Card style={styles.item}>
        <View style={styles.itemHead}>
          <Text style={styles.itemTitle}>{KUNDLI_TYPE_LABELS[k.type]}</Text>
          <StatusPill label={KUNDLI_STATUS_LABELS[k.status]} colors={STATUS_COLORS[k.status]} />
        </View>
        <Text style={styles.itemMeta}>
          {k.primaryPerson.fullName}
          {k.partnerPerson ? ` & ${k.partnerPerson.fullName}` : ''} • {formatDate(k.primaryPerson.dateOfBirth)}
        </Text>
        <Text style={styles.itemMeta}>
          {k.requestId} • {rupees(k.amount)} • {PAYMENT_STATUS_LABELS[k.paymentStatus]}
        </Text>
        {k.questions ? <Text style={styles.itemMeta}>Q: {k.questions}</Text> : null}
        {k.panditResponse ? (
          <View style={styles.response}>
            <Text style={styles.responseTitle}>Pandit Ji&apos;s reply</Text>
            <Text style={styles.responseText}>{k.panditResponse}</Text>
            {k.respondedAt ? <Text style={styles.itemMeta}>{formatDateTime(k.respondedAt)}</Text> : null}
          </View>
        ) : (
          <Text style={styles.note}>Pandit Ji&apos;s reply will appear here.</Text>
        )}
        {k.paymentUrl || (k.paymentStatus !== 'PAID' && k.amount > 0 && k.status !== 'CLOSED') ? (
          <Button title="Pay now" onPress={() => payFor('kundli', k.requestId, k.paymentUrl)} loading={busyId === k.requestId} style={styles.action} />
        ) : null}
      </Card>
    </View>
  );

  const renderFamily = () => (
    <View>
      {user?.familyMembers.length ? (
        user.familyMembers.map((m, i) => (
          <View key={m.id}>
            <Card style={styles.memberRow}>
              <View style={styles.memberIcon}>
                <UserRound size={20} color={THEME.colors.primarySaffron} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.itemTitle}>{m.name}</Text>
                <Text style={styles.itemMeta}>
                  {m.relation}
                  {m.gotra ? ` • ${m.gotra}` : ''}
                </Text>
              </View>
              <TouchableOpacity onPress={() => confirmRemoveMember(m.id, m.name)} accessibilityLabel={`Remove ${m.name}`} style={styles.iconBtn}>
                <Trash2 size={18} color="#B91C1C" />
              </TouchableOpacity>
            </Card>
          </View>
        ))
      ) : (
        <Text style={styles.muted}>Add family members to include them in your puja sankalp.</Text>
      )}
      <Card style={styles.item}>
        <Text style={styles.itemTitle}>Add family member</Text>
        <Field label="Name" required value={member.name} onChangeText={(v) => setMember((s) => ({ ...s, name: v }))} error={memberErrors.name} />
        <Field label="Relation" required value={member.relation} onChangeText={(v) => setMember((s) => ({ ...s, relation: v }))} placeholder="e.g. Wife, Son, Mother" error={memberErrors.relation} />
        <Field label="Gotra" value={member.gotra} onChangeText={(v) => setMember((s) => ({ ...s, gotra: v }))} placeholder="Optional" />
        <Button title="Add member" icon={<Plus size={16} color="#FFF" />} onPress={saveMember} loading={savingMember} />
      </Card>
    </View>
  );

  const list = section === 'bookings' ? bookings : section === 'orders' ? orders : section === 'kundli' ? kundli : null;
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '';
  const location = [user?.city, user?.state].filter(Boolean).join(', ');

  return (
    <AppBackground variant="golden">
      <AppHeader title="My Account" onNotificationPress={onNotificationPress} />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={loading && Boolean(bookings)} onRefresh={loadAll} />}
      >
        <View>
          <LinearGradient colors={['#F59A45', '#E4702B', '#CF5A22']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
            <View style={styles.heroTop}>
              <View>
                <TouchableOpacity onPress={openMenu} activeOpacity={0.85} style={styles.avatarWrap} accessibilityRole="button" accessibilityLabel="Change profile photo">
                  <Avatar uri={user?.avatarUrl} name={user?.name} size={84} ring />
                  <View style={styles.cameraBadge}>{avatarBusy ? <ActivityIndicator size="small" color={C.primarySaffron} /> : <Camera size={14} color={C.primarySaffron} />}</View>
                </TouchableOpacity>
              </View>
              <View style={styles.heroText}>
                <Text style={styles.heroName} numberOfLines={1}>
                  {user?.name || 'Devotee'}
                </Text>
                {user?.phone ? <Text style={styles.heroMeta}>{user.phone}</Text> : null}
                {user?.email ? (
                  <Text style={styles.heroMeta} numberOfLines={1}>
                    {user.email}
                  </Text>
                ) : null}
                <View style={styles.chips}>
                  {location ? <Text style={styles.chip}>{location}</Text> : null}
                  {memberSince ? <Text style={styles.chip}>Since {memberSince}</Text> : null}
                </View>
              </View>
            </View>

            <View style={styles.completion}>
              <View style={styles.completionHead}>
                <Text style={styles.completionLabel}>Profile {percent}% complete</Text>
                {percent < 100 ? (
                  <TouchableOpacity onPress={onEditProfile} hitSlop={8}>
                    <Text style={styles.completionAction}>Complete</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.doneBadge}>
                    <ShieldCheck size={12} color="#86EFAC" />
                    <Text style={styles.doneText}>All set</Text>
                  </View>
                )}
              </View>
              <ProgressBar percent={percent} />
              {percent < 100 && missing.length ? (
                <Text style={styles.completionHint} numberOfLines={2}>
                  Add {missing.slice(0, 3).join(', ')}
                  {missing.length > 3 ? ` and ${missing.length - 3} more` : ''}
                </Text>
              ) : null}
            </View>

            <View style={styles.heroActions}>
              <TouchableOpacity style={styles.editBtn} onPress={onEditProfile} activeOpacity={0.85} accessibilityRole="button">
                <Pencil size={15} color={C.primarySaffron} />
                <Text style={styles.editText}>Edit profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.photoBtn} onPress={openMenu} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel="Change photo">
                <Camera size={15} color="#FFF" />
                <Text style={styles.photoText}>Photo</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.stats}>
          {[
            { id: 'bookings' as const, label: 'Bookings', value: bookings?.length ?? 0, icon: CalendarCheck },
            { id: 'orders' as const, label: 'Orders', value: orders?.length ?? 0, icon: ShoppingBag },
            { id: 'kundli' as const, label: 'Kundli', value: kundli?.length ?? 0, icon: ScrollText },
          ].map(({ id, label, value, icon: Icon }) => (
            <TouchableOpacity key={id} style={[styles.stat, section === id && styles.statActive]} onPress={() => onSectionChange(id)} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel={`${label}: ${value}`}>
              <Icon size={18} color={THEME.colors.primarySaffron} />
              <Text style={styles.statValue}>{value}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View>
          <SegmentedTabs value={section} onChange={onSectionChange} />
        </View>

        <View style={styles.listArea}>
          {error ? <EmptyState title="Could not load" subtitle={error} action={<Button title="Retry" onPress={loadAll} />} /> : null}
          {!error && loading && !list && section !== 'family' ? <ActivityIndicator color={THEME.colors.primarySaffron} style={styles.loader} /> : null}
          {!error && section === 'bookings' && bookings ? (bookings.length ? bookings.map(renderBooking) : <EmptyState title="No bookings yet" subtitle="Book a puja or an appointment with Pandit Ji." />) : null}
          {!error && section === 'orders' && orders ? (orders.length ? orders.map(renderOrder) : <EmptyState title="No orders yet" subtitle="Puja kits you order will appear here." />) : null}
          {!error && section === 'kundli' && kundli ? (kundli.length ? kundli.map(renderKundli) : <EmptyState title="No kundli requests" subtitle="Send your birth details to Pandit Ji from the Kundli tab." />) : null}
          {section === 'family' ? renderFamily() : null}
        </View>

        <View>
          <Text style={styles.groupLabel}>Account</Text>
          <View style={styles.group}>
            <MenuRow icon={<Pencil size={18} color="#B7791F" />} tint="#FFF1CC" label="Edit profile" hint="Name, birth details, address" onPress={onEditProfile} />
            <MenuRow icon={<Camera size={18} color="#6D4FD1" />} tint="#EEE9FB" label="Profile photo" hint={user?.avatarUrl ? 'Change or remove' : 'Add a photo'} onPress={openMenu} last />
          </View>

          <Text style={styles.groupLabel}>Support</Text>
          <View style={styles.group}>
            <MenuRow icon={<Phone size={18} color="#15803D" />} tint="#E6F4EA" label="Contact Pandit Ji" hint="Call or WhatsApp" onPress={onContactSupport} />
            <MenuRow icon={<MessageCircle size={18} color={THEME.colors.primarySaffron} />} tint="#FDEBDD" label="Privacy policy" onPress={() => Linking.openURL(`${WEBSITE_URL}/privacy-policy`)} last />
          </View>

          <View style={[styles.group, styles.groupGap]}>
            <MenuRow icon={<LogOut size={18} color={THEME.colors.heading} />} tint={THEME.colors.softPeach} label="Logout" onPress={confirmLogout} />
            <MenuRow icon={<Trash2 size={18} color="#B91C1C" />} tint="#FEE2E2" label="Delete account" hint="Permanently remove your data" onPress={confirmDelete} danger last />
          </View>

          <Text style={styles.version}>VedRit v{version}</Text>
        </View>
      </KeyboardAwareScrollView>
    </AppBackground>
  );
};

const C = THEME.colors;
const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingBottom: 48 },
  hero: { marginHorizontal: SPACE.lg, marginTop: SPACE.sm, borderRadius: RADIUS.xl, padding: SPACE.lg },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: SPACE.lg },
  avatarWrap: { width: 92, height: 92 },
  cameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#F59A45',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: { flex: 1 },
  heroName: { color: '#FFFFFF', fontSize: 21, fontWeight: '800', letterSpacing: -0.2 },
  heroMeta: { color: 'rgba(255,255,255,0.9)', fontSize: 13, marginTop: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  chip: { color: '#FFFFFF', fontSize: 11, fontWeight: '700', backgroundColor: 'rgba(255,255,255,0.22)', paddingHorizontal: 9, paddingVertical: 3, borderRadius: RADIUS.pill, overflow: 'hidden' },
  completion: { marginTop: SPACE.lg, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: RADIUS.md, padding: SPACE.md },
  completionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  completionLabel: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  completionAction: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  doneBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  doneText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  progressTrack: { height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)', overflow: 'hidden' },
  progressFill: { height: 7, borderRadius: 4, backgroundColor: '#FFFFFF' },
  completionHint: { color: 'rgba(255,255,255,0.88)', fontSize: 12, marginTop: 8 },
  heroActions: { flexDirection: 'row', gap: SPACE.sm, marginTop: SPACE.md },
  editBtn: { flex: 1, height: 44, borderRadius: RADIUS.pill, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  editText: { color: C.primarySaffron, fontWeight: '800', fontSize: 14 },
  photoBtn: { height: 44, paddingHorizontal: 18, borderRadius: RADIUS.pill, borderWidth: 1, borderColor: 'rgba(255,255,255,0.7)', flexDirection: 'row', alignItems: 'center', gap: 7 },
  photoText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  stats: { flexDirection: 'row', gap: SPACE.sm, paddingHorizontal: SPACE.lg, marginTop: SPACE.lg },
  stat: { flex: 1, backgroundColor: '#FFF', borderRadius: RADIUS.lg, borderWidth: 1.5, borderColor: C.borderLight, alignItems: 'center', paddingVertical: SPACE.md, gap: 2 },
  statActive: { borderColor: C.primarySaffron, backgroundColor: C.softSaffronBg },
  statValue: { fontSize: 22, fontWeight: '800', color: C.heading, marginTop: 2 },
  statLabel: TYPE.caption,
  tabs: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: RADIUS.pill, padding: 4, marginHorizontal: SPACE.lg, marginTop: SPACE.lg, borderWidth: 1, borderColor: C.borderLight },
  tabActive: { backgroundColor: C.primarySaffron, borderRadius: RADIUS.pill },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabText: { fontSize: 13, fontWeight: '700', color: C.bodyText },
  tabTextActive: { color: '#FFF' },
  listArea: { paddingHorizontal: SPACE.lg, marginTop: SPACE.lg },
  loader: { marginVertical: 30 },
  item: { marginBottom: 12 },
  itemHead: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 },
  itemTitle: { fontSize: 15, fontWeight: '800', color: C.heading, flex: 1 },
  itemMeta: { fontSize: 12.5, color: C.bodyText, marginTop: 2 },
  note: { fontSize: 12.5, color: C.deepTerracotta, marginTop: 8 },
  cancelNote: { fontSize: 12.5, color: '#991B1B', marginTop: 8 },
  response: { backgroundColor: C.softSaffronBg, borderRadius: 12, padding: 12, marginTop: 10 },
  responseTitle: { fontSize: 13, fontWeight: '800', color: C.primarySaffron, marginBottom: 4 },
  responseText: { fontSize: 14, color: C.heading, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  flexBtn: { flex: 1, minHeight: 42 },
  action: { marginTop: 10, minHeight: 42 },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  memberIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.softSaffronBg, alignItems: 'center', justifyContent: 'center' },
  iconBtn: { padding: 8 },
  muted: { fontSize: 13, color: C.mutedText, marginBottom: 12 },
  groupLabel: { ...TYPE.label, color: C.mutedText, marginHorizontal: SPACE.lg, marginTop: SPACE.xl, marginBottom: SPACE.sm },
  group: { backgroundColor: '#FFF', borderRadius: RADIUS.lg, marginHorizontal: SPACE.lg, borderWidth: 1, borderColor: C.borderLight, overflow: 'hidden' },
  groupGap: { marginTop: SPACE.lg },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: SPACE.md, paddingHorizontal: SPACE.md, paddingVertical: 13 },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: C.borderLight },
  menuIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  menuText: { fontSize: 15, fontWeight: '700', color: C.heading },
  menuHint: { ...TYPE.caption, marginTop: 1 },
  dangerText: { color: '#B91C1C' },
  version: { ...TYPE.caption, textAlign: 'center', marginTop: SPACE.xl },
});
