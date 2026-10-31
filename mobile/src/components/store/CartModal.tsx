import React, { useEffect, useMemo, useState } from 'react';
import { KeyboardAwareScrollView } from '../ui/KeyboardAwareScrollView';
import {
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
import { ChevronLeft, Minus, Plus, Trash2, X } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { Button, Card, Chips, EmptyState, Field, SectionTitle } from '../ui';
import { ProductImage } from '../common/ProductImage';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { api, ApiError } from '../../services/api';
import { openPayment } from '../../services/payment';
import type { Order } from '../../types/api';
import { isValidPhone, isValidPin, localPhone, rupees } from '../../utils/format';

interface Props {
  visible: boolean;
  onClose: () => void;
  onViewOrders: () => void;
}

type Step = 'cart' | 'address' | 'done';

export const CartModal: React.FC<Props> = ({ visible, onClose, onViewOrders }) => {
  const cart = useCart();
  const { user } = useAuth();
  const { settings, refresh } = useAppData();
  const [step, setStep] = useState<Step>('cart');
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '', state: '', pinCode: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'COD'>('ONLINE');
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setStep('cart');
    setOrder(null);
    setPaid(false);
    setErrors({});
    setForm({
      name: user?.name || '',
      phone: localPhone(user?.phone || ''),
      address: user?.address || '',
      city: user?.city || '',
      state: user?.state || '',
      pinCode: user?.pinCode || '',
    });
  }, [visible]);

  const delivery = useMemo(() => {
    if (!settings) return 0;
    return cart.subtotal >= settings.freeDeliveryAbove ? 0 : settings.deliveryCharge;
  }, [settings, cart.subtotal]);
  const total = cart.subtotal + delivery;

  const set = (key: keyof typeof form) => (value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = 'Name is required';
    if (!isValidPhone(form.phone)) next.phone = 'Enter a valid 10-digit mobile number';
    if (form.address.trim().length < 5) next.address = 'Full address is required';
    if (form.city.trim().length < 2) next.city = 'City is required';
    if (form.state.trim().length < 2) next.state = 'State is required';
    if (!isValidPin(form.pinCode)) next.pinCode = 'Enter a valid 6-digit PIN code';
    setErrors(next);
    return !Object.keys(next).length;
  };

  const pay = async (target: Order) => {
    const url = target.paymentUrl || (await api.payNow('order', target.orderId)).paymentUrl;
    const ok = await openPayment(url, 'order', target.orderId);
    setPaid(ok);
    return ok;
  };

  const placeOrder = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const created = await api.createOrder({
        items: cart.lines.map((l) => ({ productId: l.kit.id, quantity: l.quantity })),
        name: form.name.trim(),
        phone: form.phone,
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pinCode: form.pinCode.trim(),
        paymentMethod,
      });
      cart.clear();
      setOrder(created);
      setStep('done');
      refresh();
      if (created.paymentMethod === 'ONLINE') await pay(created);
    } catch (e) {
      const err = e as ApiError;
      Alert.alert('Could not place order', err.message);
      if (err.status === 409 || err.status === 404) {
        await refresh();
        setStep('cart');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const retryPay = async () => {
    if (!order) return;
    setSubmitting(true);
    try {
      await pay(order);
    } catch (e: any) {
      Alert.alert('Payment', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const back = () => {
    if (step === 'address') setStep('cart');
    else onClose();
  };

  const renderCart = () =>
    cart.lines.length ? (
      <View>
        {cart.lines.map(({ kit, quantity }) => (
          <Card key={kit.id} style={styles.line}>
            <ProductImage source={kit.image} categoryKey={kit.categoryKey} style={styles.thumb} iconSize={22} />
            <View style={styles.flex}>
              <Text style={styles.lineTitle} numberOfLines={2}>
                {kit.name}
              </Text>
              <Text style={styles.linePrice}>{rupees(kit.price)}</Text>
              <View style={styles.qtyRow}>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => cart.setQuantity(kit.id, quantity - 1)} accessibilityLabel="Decrease quantity">
                  {quantity === 1 ? <Trash2 size={14} color="#B91C1C" /> : <Minus size={14} color={THEME.colors.heading} />}
                </TouchableOpacity>
                <Text style={styles.qty}>{quantity}</Text>
                <TouchableOpacity
                  style={[styles.qtyBtn, quantity >= Math.min(20, kit.stockQuantity) && styles.disabled]}
                  disabled={quantity >= Math.min(20, kit.stockQuantity)}
                  onPress={() => cart.setQuantity(kit.id, quantity + 1)}
                  accessibilityLabel="Increase quantity"
                >
                  <Plus size={14} color={THEME.colors.heading} />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.lineTotal}>{rupees(kit.price * quantity)}</Text>
          </Card>
        ))}
        <Card style={styles.summary}>
          <Row label="Subtotal" value={rupees(cart.subtotal)} />
          <Row label="Delivery" value={delivery ? rupees(delivery) : 'Free'} />
          {settings && delivery > 0 ? (
            <Text style={styles.hint}>Add {rupees(settings.freeDeliveryAbove - cart.subtotal)} more for free delivery</Text>
          ) : null}
          <View style={styles.divider} />
          <Row label="Total" value={rupees(total)} bold />
        </Card>
        <Button title="Proceed to Address" onPress={() => setStep('address')} />
      </View>
    ) : (
      <EmptyState title="Your cart is empty" subtitle="Add puja kits and samagri from the store." action={<Button title="Continue shopping" onPress={onClose} />} />
    );

  const renderAddress = () => (
    <View>
      <SectionTitle title="Delivery address" />
      <Field label="Name" required value={form.name} onChangeText={set('name')} error={errors.name} />
      <Field
        label="Mobile"
        required
        prefix="+91"
        value={form.phone}
        onChangeText={(v) => set('phone')(v.replace(/\D/g, '').slice(0, 10))}
        keyboardType="phone-pad"
        maxLength={10}
        error={errors.phone}
      />
      <Field label="Address" required value={form.address} onChangeText={set('address')} error={errors.address} multiline style={styles.multiline} />
      <Field label="City" required value={form.city} onChangeText={set('city')} error={errors.city} />
      <Field label="State" required value={form.state} onChangeText={set('state')} error={errors.state} />
      <Field
        label="PIN code"
        required
        value={form.pinCode}
        onChangeText={(v) => set('pinCode')(v.replace(/\D/g, '').slice(0, 6))}
        keyboardType="number-pad"
        maxLength={6}
        error={errors.pinCode}
      />
      <Chips
        label="Payment"
        value={paymentMethod}
        onChange={setPaymentMethod}
        options={[
          { value: 'ONLINE', label: 'Pay online' },
          ...(settings?.allowCod ? [{ value: 'COD' as const, label: 'Cash on delivery' }] : []),
        ]}
      />
      <Card style={styles.summary}>
        <Row label={`Items (${cart.count})`} value={rupees(cart.subtotal)} />
        <Row label="Delivery" value={delivery ? rupees(delivery) : 'Free'} />
        <View style={styles.divider} />
        <Row label="Total" value={rupees(total)} bold />
      </Card>
      <Button title={paymentMethod === 'ONLINE' ? `Pay ${rupees(total)}` : 'Place Order'} onPress={placeOrder} loading={submitting} />
    </View>
  );

  const renderDone = () => {
    if (!order) return null;
    const pending = order.paymentMethod === 'ONLINE' && !paid;
    return (
      <View>
        <Text style={styles.doneOm}>ॐ</Text>
        <Text style={styles.doneTitle}>{pending ? 'Complete your payment' : 'Order placed!'}</Text>
        <Text style={styles.doneText}>
          {pending
            ? 'Your order is reserved for 30 minutes. Complete the payment to confirm it.'
            : order.paymentMethod === 'COD'
            ? 'Pay in cash when your order is delivered.'
            : 'Payment received. We will ship your order soon.'}
        </Text>
        <Card style={styles.summary}>
          <Row label="Order ID" value={order.orderId} bold />
          <Row label="Total" value={rupees(order.totalAmount)} />
        </Card>
        {pending ? <Button title="Pay now" onPress={retryPay} loading={submitting} style={styles.gap} /> : null}
        <Button
          title="View my orders"
          variant={pending ? 'outline' : 'primary'}
          onPress={() => {
            onClose();
            onViewOrders();
          }}
        />
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={back}>
      <SafeAreaView style={styles.flexBg} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={back} style={styles.headerBtn} accessibilityLabel="Back">
            {step === 'address' ? <ChevronLeft size={22} color={THEME.colors.heading} /> : <X size={22} color={THEME.colors.heading} />}
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{step === 'cart' ? 'My Cart' : step === 'address' ? 'Checkout' : 'Order status'}</Text>
        </View>
        <View style={styles.flex}>
          <KeyboardAwareScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
            {step === 'cart' && renderCart()}
            {step === 'address' && renderAddress()}
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
    <Text style={[styles.rowValue, bold && styles.bold]}>{value}</Text>
  </View>
);

const C = THEME.colors;
const styles = StyleSheet.create({
  flex: { flex: 1 },
  flexBg: { flex: 1, backgroundColor: C.primaryBg },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 10 },
  headerBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: C.heading },
  body: { padding: 16, paddingBottom: 48 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  thumb: { width: 64, height: 64, borderRadius: 12, backgroundColor: C.softPeach },
  lineTitle: { fontSize: 14, fontWeight: '700', color: C.heading },
  linePrice: { fontSize: 12, color: C.mutedText, marginTop: 2 },
  lineTotal: { fontSize: 14, fontWeight: '800', color: C.primarySaffron },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  qtyBtn: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  qty: { fontSize: 15, fontWeight: '800', color: C.heading, minWidth: 18, textAlign: 'center' },
  disabled: { opacity: 0.35 },
  summary: { marginVertical: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  rowLabel: { fontSize: 14, color: C.bodyText },
  rowValue: { fontSize: 14, color: C.heading, fontWeight: '600' },
  bold: { fontWeight: '800', fontSize: 16 },
  divider: { height: 1, backgroundColor: C.borderLight, marginVertical: 8 },
  hint: { fontSize: 12, color: C.bilvaGreen, marginTop: 2 },
  multiline: { minHeight: 70, textAlignVertical: 'top' },
  doneOm: { fontSize: 56, color: C.primarySaffron, textAlign: 'center' },
  doneTitle: { fontSize: 22, fontWeight: '800', color: C.heading, textAlign: 'center' },
  doneText: { fontSize: 14, color: C.bodyText, textAlign: 'center', marginTop: 8 },
  gap: { marginBottom: 10 },
});
