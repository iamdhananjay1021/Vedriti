import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CalendarCheck, ChevronRight } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { RADIUS, SPACE, TYPE } from '../../constants/ui';
import { api } from '../../services/api';
import type { Booking } from '../../types/api';
import { BOOKING_STATUS_LABELS, formatDate, formatTime, STATUS_COLORS } from '../../utils/format';
import { StatusPill } from '../ui';

export const NextBookingCard: React.FC<{ onPress: () => void }> = ({ onPress }) => {
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    let active = true;
    api
      .myBookings()
      .then((list) => {
        if (!active) return;
        const upcoming = list
          .filter((b) => b.status === 'PENDING' || b.status === 'CONFIRMED')
          .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));
        setBooking(upcoming[0] ?? null);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  if (!booking) return null;

  return (
    <View style={styles.wrap}>
      <TouchableOpacity activeOpacity={0.88} onPress={onPress} style={styles.card} accessibilityRole="button" accessibilityLabel="Open my bookings">
        <View style={styles.icon}>
          <CalendarCheck size={22} color={THEME.colors.primarySaffron} />
        </View>
        <View style={styles.text}>
          <Text style={styles.kicker}>Your next booking</Text>
          <Text style={styles.title} numberOfLines={1}>
            {booking.title}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {formatDate(booking.date)} • {formatTime(booking.startTime)}
          </Text>
        </View>
        <View style={styles.right}>
          <StatusPill label={BOOKING_STATUS_LABELS[booking.status]} colors={STATUS_COLORS[booking.status]} />
          <ChevronRight size={18} color={THEME.colors.mutedText} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: SPACE.lg },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE.md,
    backgroundColor: '#FFF',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: THEME.colors.borderLight,
    padding: SPACE.md,
  },
  icon: { width: 46, height: 46, borderRadius: RADIUS.md, backgroundColor: THEME.colors.softSaffronBg, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1 },
  kicker: { ...TYPE.label, color: THEME.colors.primarySaffron, fontSize: 10 },
  title: { ...TYPE.cardTitle, marginTop: 1 },
  meta: { ...TYPE.caption, marginTop: 2 },
  right: { alignItems: 'flex-end', gap: 6 },
});
