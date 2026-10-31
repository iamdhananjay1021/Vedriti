import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { KeyboardAwareScrollView } from '../ui/KeyboardAwareScrollView';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle2, ChevronLeft, Clock, X } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { Button, Card, Chips, Field, SectionTitle } from '../ui';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { api, ApiError } from '../../services/api';
import { openPayment } from '../../services/payment';
import type { Puja } from '../../data/mockData';
import type { Booking, BookingMode, CalendarDay, DaySlots, PackageType } from '../../types/api';
import {
  formatDate,
  formatDay,
  formatDuration,
  formatTime,
  isValidPhone,
  isValidPin,
  localPhone,
  MODE_HINTS,
  MODE_LABELS,
  rupees,
} from '../../utils/format';

export type BookingRequest =
  | { serviceType: 'PUJA'; puja: Puja; packageType?: PackageType }
  | { serviceType: 'CONSULTATION' };

interface Props {
  request: BookingRequest | null;
  onClose: () => void;
  onViewBookings: () => void;
}

type Step = 'details' | 'slot' | 'sankalp' | 'review' | 'done';
const STEPS: Step[] = ['details', 'slot', 'sankalp', 'review'];
const STEP_TITLES: Record<Step, string> = {
  details: 'Choose package & mode',
  slot: 'Select date & time',
  sankalp: 'Sankalp details',
  review: 'Review & pay',
  done: 'Booking placed',
};

export const BookingModal: React.FC<Props> = ({ request, onClose, onViewBookings }) => {
  const { user } = useAuth();
  const { settings } = useAppData();
  const visible = Boolean(request);
  const isPuja = request?.serviceType === 'PUJA';
  const puja = request?.serviceType === 'PUJA' ? request.puja : null;

  const [step, setStep] = useState<Step>('details');
  const [packageType, setPackageType] = useState<PackageType | null>(null);
  const [mode, setMode] = useState<BookingMode | null>(null);
  const [calendar, setCalendar] = useState<CalendarDay[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [date, setDate] = useState<string | null>(null);
  const [daySlots, setDaySlots] = useState<DaySlots | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<string | null>(null);

  const [devoteeName, setDevoteeName] = useState('');
  const [phone, setPhone] = useState('');
  const [gotra, setGotra] = useState('');
  const [selectedFamily, setSelectedFamily] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'PAY_LATER'>('ONLINE');
  const [submitting, setSubmitting] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [paid, setPaid] = useState(false);

  const modeOptions: BookingMode[] = useMemo(() => {
    if (puja) return puja.modes;
    return settings?.consultation.modes ?? [];
  }, [puja, settings]);

  const packages = useMemo(() => {
    if (!puja) return [];
    return [
      { type: 'PANDIT_ONLY' as PackageType, pkg: puja.packages.panditOnly },
      { type: 'WITH_SAMAGRI' as PackageType, pkg: puja.packages.panditWithSamagri },
    ].filter((p) => p.pkg.enabled);
  }, [puja]);

  const amount = useMemo(() => {
    if (!isPuja) return settings?.consultation.fee ?? 0;
    return packages.find((p) => p.type === packageType)?.pkg.price ?? 0;
  }, [isPuja, packages, packageType, settings]);

  const title = puja ? puja.name : settings?.consultation.title || 'Consultation with Pandit Ji';
  const duration = puja ? puja.durationMinutes : settings?.consultation.durationMinutes ?? 30;
  const needsAddress = mode === 'AT_HOME';

  useEffect(() => {
    if (!request) return;
    setStep('details');
    setPackageType(
      request.serviceType === 'PUJA'
        ? request.packageType && packages.some((p) => p.type === request.packageType)
          ? request.packageType
          : packages[0]?.type ?? null
        : null
    );
    setMode(modeOptions.length === 1 ? modeOptions[0] : null);
    setDate(null);
    setStartTime(null);
    setDaySlots(null);
    setCalendar([]);
    setDevoteeName(user?.name || '');
    setPhone(localPhone(user?.phone || ''));
    setGotra(user?.gotra || '');
    setSelectedFamily([]);
    setNote('');
    setAddress(user?.address || '');
    setCity(user?.city || '');
    setPinCode(user?.pinCode || '');
    setErrors({});
    setPaymentMethod('ONLINE');
    setBooking(null);
    setPaid(false);
  }, [request]);

  const slotParams = useMemo(
    () => (puja ? { serviceType: 'PUJA' as const, pujaId: puja.id } : { serviceType: 'CONSULTATION' as const }),
    [puja]
  );

  const loadCalendar = useCallback(async () => {
    setCalendarLoading(true);
    setSlotError(null);
    try {
      const days = await api.calendar({ ...slotParams, days: settings?.bookingWindowDays ?? 30 });
      setCalendar(days);
      const first = days.find((d) => d.available);
      if (first && !date) setDate(first.date);
      if (!first) setSlotError('No slots are open right now. Please contact Pandit Ji.');
    } catch (e: any) {
      setSlotError(e.message);
    } finally {
      setCalendarLoading(false);
    }
  }, [slotParams, settings, date]);

  const loadSlots = useCallback(
    async (d: string) => {
      setSlotsLoading(true);
      setSlotError(null);
      try {
        setDaySlots(await api.slots({ ...slotParams, date: d }));
      } catch (e: any) {
        setSlotError(e.message);
        setDaySlots(null);
      } finally {
        setSlotsLoading(false);
      }
    },
    [slotParams]
  );

  useEffect(() => {
    if (step === 'slot' && !calendar.length) loadCalendar();
  }, [step]);

  useEffect(() => {
    if (date && step === 'slot') {
      setStartTime(null);
      loadSlots(date);
    }
  }, [date]);

  const goBack = () => {
    const index = STEPS.indexOf(step);
    if (index <= 0 || step === 'done') onClose();
    else setStep(STEPS[index - 1]);
  };

  const nextFromDetails = () => {
    if (isPuja && !packageType) return Alert.alert('Select package', 'Please choose a package.');
    if (!mode) return Alert.alert('Select mode', isPuja ? 'Please choose how you want the puja.' : 'Please choose how you want to talk to Pandit Ji.');
    setStep('slot');
  };

  const nextFromSlot = () => {
    if (!date || !startTime) return Alert.alert('Select slot', 'Please choose a date and an available time slot.');
    setStep('sankalp');
  };

  const nextFromSankalp = () => {
    const next: Record<string, string> = {};
    if (devoteeName.trim().length < 2) next.devoteeName = 'Name is required';
    if (!isValidPhone(phone)) next.phone = 'Enter a valid 10-digit mobile number';
    if (needsAddress) {
      if (address.trim().length < 5) next.address = 'Full address is required for puja at home';
      if (!isValidPin(pinCode)) next.pinCode = 'Enter a valid 6-digit PIN code';
    }
    setErrors(next);
    if (Object.keys(next).length) return;
    setStep('review');
  };

  const pay = async (target: Booking) => {
    const url = target.paymentUrl || (await api.payNow('booking', target.bookingId)).paymentUrl;
    const success = await openPayment(url, 'booking', target.bookingId);
    setPaid(success);
    if (success) setBooking(await api.booking(target.bookingId).catch(() => target));
    return success;
  };

  const submit = async () => {
    if (!date || !startTime || !mode) return;
    setSubmitting(true);
    try {
      const created = await api.createBooking({
        serviceType: isPuja ? 'PUJA' : 'CONSULTATION',
        pujaId: puja?.id,
        packageType: packageType ?? undefined,
        mode,
        date,
        startTime,
        devoteeName: devoteeName.trim(),
        phone,
        gotra: gotra.trim(),
        familyMembers: selectedFamily,
        sankalpNote: note.trim(),
        address: needsAddress || mode === 'IN_PERSON' ? address.trim() : '',
        city: city.trim(),
        pinCode: needsAddress ? pinCode.trim() : '',
        paymentMethod,
      });
      setBooking(created);
      setStep('done');
      setPaid(created.paymentStatus === 'PAID');
      if (created.paymentMethod === 'ONLINE' && created.paymentStatus !== 'PAID') {
        await pay(created);
      }
    } catch (e) {
      const err = e as ApiError;
      if (err.status === 409) {
        Alert.alert('Slot not available', err.message);
        setStep('slot');
        setStartTime(null);
        if (date) loadSlots(date);
      } else {
        Alert.alert('Booking failed', err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const retryPayment = async () => {
    if (!booking) return;
    setSubmitting(true);
    try {
      await pay(booking);
    } catch (e: any) {
      Alert.alert('Payment', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const familyNames = (user?.familyMembers ?? []).map((m) => `${m.name} (${m.relation})`);

  const renderDetails = () => (
    <View>
      <Card style={styles.summaryCard}>
        <Text style={styles.itemTitle}>{title}</Text>
        <View style={styles.inline}>
          <Clock size={13} color={THEME.colors.mutedText} />
          <Text style={styles.muted}> {formatDuration(duration)}</Text>
        </View>
      </Card>

      {isPuja ? (
        <>
          <SectionTitle title="Package" />
          {packages.map(({ type, pkg }) => {
            const active = packageType === type;
            return (
              <TouchableOpacity key={type} onPress={() => setPackageType(type)} activeOpacity={0.85} style={[styles.option, active && styles.optionActive]}>
                <View style={styles.flex}>
                  <Text style={styles.optionTitle}>{pkg.name}</Text>
                  {pkg.tagline ? <Text style={styles.muted}>{pkg.tagline}</Text> : null}
                </View>
                <Text style={styles.price}>{rupees(pkg.price)}</Text>
              </TouchableOpacity>
            );
          })}
        </>
      ) : (
        <Card style={styles.summaryCard}>
          <Text style={styles.muted}>Consultation fee</Text>
          <Text style={styles.priceLarge}>{rupees(amount)}</Text>
        </Card>
      )}

      <SectionTitle title={isPuja ? 'How should the puja happen?' : 'How do you want to connect?'} />
      {modeOptions.length ? (
        modeOptions.map((m) => {
          const active = mode === m;
          return (
            <TouchableOpacity key={m} onPress={() => setMode(m)} activeOpacity={0.85} style={[styles.option, active && styles.optionActive]}>
              <View style={styles.flex}>
                <Text style={styles.optionTitle}>{MODE_LABELS[m]}</Text>
                <Text style={styles.muted}>{m === 'IN_PERSON' && settings?.templeAddress ? settings.templeAddress : MODE_HINTS[m]}</Text>
              </View>
              {active ? <CheckCircle2 size={20} color={THEME.colors.primarySaffron} /> : null}
            </TouchableOpacity>
          );
        })
      ) : (
        <Text style={styles.muted}>This service is not available right now.</Text>
      )}
      <Button title="Continue" onPress={nextFromDetails} disabled={!modeOptions.length} style={styles.cta} />
    </View>
  );

  const renderSlot = () => (
    <View>
      {calendarLoading ? (
        <ActivityIndicator color={THEME.colors.primarySaffron} style={styles.loader} />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dates}>
          {calendar.map((d) => {
            const f = formatDay(d.date);
            const active = d.date === date;
            return (
              <TouchableOpacity
                key={d.date}
                disabled={!d.available}
                onPress={() => setDate(d.date)}
                style={[styles.dateCell, active && styles.dateActive, !d.available && styles.dateDisabled]}
                accessibilityLabel={`${formatDate(d.date)}${d.available ? '' : ', unavailable'}`}
              >
                <Text style={[styles.dateWeek, active && styles.dateTextActive]}>{f.weekday}</Text>
                <Text style={[styles.dateNum, active && styles.dateTextActive]}>{f.day}</Text>
                <Text style={[styles.dateWeek, active && styles.dateTextActive]}>{f.month}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {slotError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{slotError}</Text>
          <Button title="Retry" variant="outline" onPress={() => (date ? loadSlots(date) : loadCalendar())} />
        </View>
      ) : null}

      {date ? <SectionTitle title={formatDate(date)} subtitle={`Each slot is ${formatDuration(duration)}`} /> : null}
      {slotsLoading ? (
        <ActivityIndicator color={THEME.colors.primarySaffron} style={styles.loader} />
      ) : daySlots ? (
        daySlots.slots.some((s) => s.available) ? (
          <View style={styles.slotGrid}>
            {daySlots.slots.map((s) => {
              const active = s.startTime === startTime;
              return (
                <TouchableOpacity
                  key={s.startTime}
                  disabled={!s.available}
                  onPress={() => setStartTime(s.startTime)}
                  style={[styles.slot, active && styles.slotActive, !s.available && styles.slotTaken]}
                  accessibilityLabel={`${formatTime(s.startTime)}${s.available ? '' : ', booked'}`}
                >
                  <Text style={[styles.slotText, active && styles.dateTextActive, !s.available && styles.slotTakenText]}>
                    {formatTime(s.startTime)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <Text style={styles.muted}>{daySlots.reason || 'No slots available on this date. Please pick another date.'}</Text>
        )
      ) : null}
      <Button title="Continue" onPress={nextFromSlot} disabled={!startTime} style={styles.cta} />
    </View>
  );

  const renderSankalp = () => (
    <View>
      <Field label="Name for sankalp" required value={devoteeName} onChangeText={setDevoteeName} error={errors.devoteeName} />
      <Field
        label="Contact number"
        required
        prefix="+91"
        value={phone}
        onChangeText={(v) => setPhone(v.replace(/\D/g, '').slice(0, 10))}
        keyboardType="phone-pad"
        maxLength={10}
        error={errors.phone}
      />
      {isPuja ? <Field label="Gotra" value={gotra} onChangeText={setGotra} placeholder="Leave blank if unknown" /> : null}

      {isPuja && familyNames.length ? (
        <View style={styles.familyBox}>
          <Text style={styles.label}>Include family members in sankalp</Text>
          <View style={styles.chipsWrap}>
            {familyNames.map((n) => {
              const active = selectedFamily.includes(n);
              return (
                <TouchableOpacity
                  key={n}
                  onPress={() => setSelectedFamily((prev) => (active ? prev.filter((x) => x !== n) : [...prev, n]))}
                  style={[styles.familyChip, active && styles.optionActive]}
                >
                  <Text style={[styles.familyText, active && { color: THEME.colors.primarySaffron }]}>{n}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ) : null}

      <Field
        label={isPuja ? 'Sankalp / special wish (optional)' : 'What would you like to discuss?'}
        value={note}
        onChangeText={setNote}
        multiline
        maxLength={1000}
        style={styles.multiline}
        placeholder={isPuja ? 'e.g. Health of family, success in business' : 'e.g. Career, marriage, muhurat for griha pravesh'}
      />

      {needsAddress ? (
        <>
          <SectionTitle title="Puja address" />
          <Field label="Full address" required value={address} onChangeText={setAddress} error={errors.address} multiline style={styles.multiline} />
          <Field label="City" value={city} onChangeText={setCity} />
          <Field
            label="PIN code"
            required
            value={pinCode}
            onChangeText={(v) => setPinCode(v.replace(/\D/g, '').slice(0, 6))}
            keyboardType="number-pad"
            maxLength={6}
            error={errors.pinCode}
          />
        </>
      ) : null}
      <Button title="Review booking" onPress={nextFromSankalp} style={styles.cta} />
    </View>
  );

  const renderReview = () => (
    <View>
      <Card style={styles.summaryCard}>
        <Text style={styles.itemTitle}>{title}</Text>
        {isPuja ? <Row label="Package" value={packages.find((p) => p.type === packageType)?.pkg.name || ''} /> : null}
        <Row label="Mode" value={mode ? MODE_LABELS[mode] : ''} />
        <Row label="Date" value={date ? formatDate(date) : ''} />
        <Row label="Time" value={startTime ? formatTime(startTime) : ''} />
        <Row label="Name" value={devoteeName} />
        <Row label="Contact" value={`+91 ${phone}`} />
        {needsAddress ? <Row label="Address" value={`${address}, ${city} ${pinCode}`} /> : null}
        <View style={styles.divider} />
        <Row label="Total" value={rupees(amount)} bold />
      </Card>

      {amount > 0 ? (
        <Chips
          label="Payment"
          value={paymentMethod}
          onChange={setPaymentMethod}
          options={[
            { value: 'ONLINE', label: 'Pay online now' },
            ...(settings?.allowPayLater ? [{ value: 'PAY_LATER' as const, label: 'Pay after confirmation' }] : []),
          ]}
        />
      ) : null}
      <Text style={styles.note}>
        {paymentMethod === 'ONLINE'
          ? 'Your slot is held for 30 minutes while you complete payment (UPI, card, netbanking).'
          : 'Pandit Ji will confirm your booking. You can pay from My Bookings anytime.'}
      </Text>
      <Button title={paymentMethod === 'ONLINE' && amount > 0 ? `Pay ${rupees(amount)} & Book` : 'Confirm Booking'} onPress={submit} loading={submitting} style={styles.cta} />
    </View>
  );

  const renderDone = () => {
    if (!booking) return null;
    const pendingPayment = booking.paymentMethod === 'ONLINE' && !paid;
    return (
      <View style={styles.doneWrap}>
        <Text style={styles.doneOm}>ॐ</Text>
        <Text style={styles.doneTitle}>{pendingPayment ? 'Complete your payment' : paid ? 'Booking confirmed!' : 'Booking request sent!'}</Text>
        <Text style={styles.doneText}>
          {pendingPayment
            ? 'Your slot is held for 30 minutes. Complete the payment to confirm it.'
            : paid
            ? 'Payment received. Pandit Ji will see you at the scheduled time.'
            : 'Pandit Ji will confirm your booking shortly. You will see the status in My Bookings.'}
        </Text>
        <Card style={styles.summaryCard}>
          <Row label="Booking ID" value={booking.bookingId} bold />
          <Row label="When" value={`${formatDate(booking.date)}, ${formatTime(booking.startTime)}`} />
          <Row label="Amount" value={rupees(booking.amount)} />
        </Card>
        {pendingPayment ? <Button title="Pay now" onPress={retryPayment} loading={submitting} style={styles.cta} /> : null}
        <Button
          title="View my bookings"
          variant={pendingPayment ? 'outline' : 'primary'}
          onPress={() => {
            onClose();
            onViewBookings();
          }}
          style={styles.cta}
        />
      </View>
    );
  };

  const stepIndex = STEPS.indexOf(step);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={goBack}>
      <SafeAreaView style={styles.root} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.headerBtn} accessibilityLabel="Back">
            {step === 'details' || step === 'done' ? <X size={22} color={THEME.colors.heading} /> : <ChevronLeft size={22} color={THEME.colors.heading} />}
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {STEP_TITLES[step]}
          </Text>
          {step !== 'done' ? (
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>
                {stepIndex + 1}/{STEPS.length}
              </Text>
            </View>
          ) : null}
        </View>
        {step !== 'done' ? (
          <View style={styles.progress}>
            <View style={[styles.progressFill, { width: `${((stepIndex + 1) / STEPS.length) * 100}%` }]} />
          </View>
        ) : null}
        <View style={styles.flex}>
          <KeyboardAwareScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
            {step === 'details' && renderDetails()}
            {step === 'slot' && renderSlot()}
            {step === 'sankalp' && renderSankalp()}
            {step === 'review' && renderReview()}
            {step === 'done' && renderDone()}
          </KeyboardAwareScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const Row: React.FC<{ label: string; value: string; bold?: boolean }> = ({ label, value, bold }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={[styles.rowValue, bold && styles.rowBold]}>{value}</Text>
  </View>
);

const C = THEME.colors;
const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1, backgroundColor: C.primaryBg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 56, gap: 10 },
  headerBtn: { padding: 6 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '800', color: C.heading },
  stepBadge: { backgroundColor: C.softSaffronBg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  stepBadgeText: { fontSize: 12, fontWeight: '800', color: C.primarySaffron },
  progress: { height: 4, backgroundColor: C.borderLight, marginHorizontal: 16, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 4, backgroundColor: C.primarySaffron },
  body: { padding: 16, paddingBottom: 48 },
  summaryCard: { marginBottom: 16 },
  itemTitle: { fontSize: 17, fontWeight: '800', color: C.heading, marginBottom: 6 },
  inline: { flexDirection: 'row', alignItems: 'center' },
  muted: { fontSize: 13, color: C.mutedText },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.border,
    padding: 14,
    marginBottom: 10,
    gap: 10,
  },
  optionActive: { borderColor: C.primarySaffron, backgroundColor: C.softSaffronBg },
  optionTitle: { fontSize: 15, fontWeight: '700', color: C.heading, marginBottom: 2 },
  price: { fontSize: 16, fontWeight: '800', color: C.primarySaffron },
  priceLarge: { fontSize: 24, fontWeight: '800', color: C.primarySaffron, marginTop: 4 },
  cta: { marginTop: 16 },
  loader: { marginVertical: 24 },
  dates: { gap: 8, paddingBottom: 16 },
  dateCell: {
    width: 62,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
  },
  dateActive: { backgroundColor: C.primarySaffron, borderColor: C.primarySaffron },
  dateDisabled: { opacity: 0.35 },
  dateWeek: { fontSize: 11, color: C.mutedText, fontWeight: '600' },
  dateNum: { fontSize: 20, fontWeight: '800', color: C.heading, marginVertical: 2 },
  dateTextActive: { color: '#FFF' },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slot: {
    width: '31%',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  slotActive: { backgroundColor: C.primarySaffron, borderColor: C.primarySaffron },
  slotTaken: { backgroundColor: C.borderLight, borderColor: C.borderLight },
  slotText: { fontSize: 13, fontWeight: '700', color: C.heading },
  slotTakenText: { color: C.mutedText, textDecorationLine: 'line-through' },
  errorBox: { backgroundColor: '#FEF2F2', borderRadius: 12, padding: 12, marginBottom: 12, gap: 8 },
  errorText: { color: '#991B1B', fontSize: 13 },
  label: { fontSize: 13, fontWeight: '700', color: C.heading, marginBottom: 8 },
  familyBox: { marginBottom: 14 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  familyChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: C.border, backgroundColor: '#FFF' },
  familyText: { fontSize: 13, color: C.bodyText, fontWeight: '600' },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, gap: 12 },
  rowLabel: { fontSize: 13, color: C.mutedText },
  rowValue: { fontSize: 13, color: C.heading, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  rowBold: { fontSize: 15, fontWeight: '800' },
  divider: { height: 1, backgroundColor: C.borderLight, marginVertical: 8 },
  note: { fontSize: 12.5, color: C.mutedText, marginTop: 4 },
  doneWrap: { alignItems: 'stretch' },
  doneOm: { fontSize: 56, color: C.primarySaffron, textAlign: 'center' },
  doneTitle: { fontSize: 22, fontWeight: '800', color: C.heading, textAlign: 'center', marginTop: 6 },
  doneText: { fontSize: 14, color: C.bodyText, textAlign: 'center', marginVertical: 12 },
});
