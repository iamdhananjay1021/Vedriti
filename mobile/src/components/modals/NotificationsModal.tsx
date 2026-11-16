import React from 'react';
import { ActivityIndicator, FlatList, Linking, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Bell, CalendarClock, Gift, Megaphone, PartyPopper, ShieldAlert, X } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { RADIUS, SPACE } from '../../constants/ui';
import type { InboxNotification } from '../../types/api';

interface Props {
  visible: boolean;
  items: InboxNotification[];
  loading: boolean;
  failed: boolean;
  onClose: () => void;
  onRetry: () => void;
}

const ICONS: Record<InboxNotification['type'], React.ElementType> = {
  ANNOUNCEMENT: Megaphone,
  OFFER: Gift,
  FESTIVAL: PartyPopper,
  REMINDER: CalendarClock,
  NOTICE: ShieldAlert,
};

const when = (iso: string) => {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} d ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const openLink = (url: string) => {
  if (/^https?:\/\//i.test(url)) Linking.openURL(url).catch(() => undefined);
};

export const NotificationsModal: React.FC<Props> = ({ visible, items, loading, failed, onClose, onRetry }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
    <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close notifications" />
    <View style={styles.sheet}>
      <View style={styles.handle} />
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity onPress={onClose} style={styles.close} accessibilityRole="button" accessibilityLabel="Close">
          <X size={18} color={THEME.colors.heading} />
        </TouchableOpacity>
      </View>

      {loading && !items.length ? (
        <View style={styles.center}>
          <ActivityIndicator color={THEME.colors.primarySaffron} />
        </View>
      ) : failed && !items.length ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>Could not load notifications</Text>
          <TouchableOpacity onPress={onRetry} style={styles.retry}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : !items.length ? (
        <View style={styles.center}>
          <View style={styles.emptyIcon}>
            <Bell size={26} color={THEME.colors.primarySaffron} />
          </View>
          <Text style={styles.emptyTitle}>You are all caught up</Text>
          <Text style={styles.emptyText}>Announcements and updates from Pandit Ji will appear here.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(n) => n.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.gap} />}
          renderItem={({ item }) => {
            const Icon = ICONS[item.type] || Megaphone;
            return (
              <View style={[styles.card, !item.read && styles.cardUnread]}>
                <View style={styles.iconWrap}>
                  <Icon size={18} color={THEME.colors.primarySaffron} />
                </View>
                <View style={styles.body}>
                  <View style={styles.rowTop}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    {!item.read ? <View style={styles.dot} /> : null}
                  </View>
                  <Text style={styles.cardText}>{item.body}</Text>
                  <View style={styles.rowBottom}>
                    <Text style={styles.time}>{when(item.createdAt)}</Text>
                    {item.ctaLabel && /^https?:\/\//i.test(item.ctaUrl) ? (
                      <TouchableOpacity onPress={() => openLink(item.ctaUrl)} accessibilityRole="link">
                        <Text style={styles.cta}>{item.ctaLabel}</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  </Modal>
);

const C = THEME.colors;
const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(26,16,9,0.45)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '82%',
    minHeight: '45%',
    backgroundColor: '#FAF6EE',
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingBottom: SPACE.xl,
  },
  handle: { alignSelf: 'center', width: 42, height: 4, borderRadius: 2, backgroundColor: C.border, marginTop: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACE.lg, paddingVertical: SPACE.md },
  title: { fontSize: 20, fontWeight: '800', color: C.heading },
  close: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: C.borderLight, alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, paddingHorizontal: 32 },
  emptyIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: C.softSaffronBg, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: C.heading },
  emptyText: { fontSize: 13.5, color: C.mutedText, textAlign: 'center', marginTop: 6, lineHeight: 19 },
  retry: { marginTop: 14, paddingHorizontal: 18, paddingVertical: 9, borderRadius: 999, backgroundColor: C.primarySaffron },
  retryText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  list: { paddingHorizontal: SPACE.lg, paddingBottom: SPACE.lg },
  gap: { height: SPACE.sm },
  card: { flexDirection: 'row', gap: SPACE.md, backgroundColor: '#FFFFFF', borderRadius: RADIUS.lg, borderWidth: 1, borderColor: C.borderLight, padding: SPACE.md },
  cardUnread: { borderColor: C.primarySaffron, backgroundColor: '#FFFBF5' },
  iconWrap: { width: 38, height: 38, borderRadius: 12, backgroundColor: C.softSaffronBg, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1 },
  rowTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  cardTitle: { flex: 1, fontSize: 14.5, fontWeight: '800', color: C.heading, lineHeight: 19 },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: C.primarySaffron, marginTop: 5 },
  cardText: { fontSize: 13.5, color: C.bodyText, lineHeight: 19, marginTop: 4 },
  rowBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  time: { fontSize: 11.5, color: C.mutedText },
  cta: { fontSize: 13, fontWeight: '800', color: C.primarySaffron },
});
