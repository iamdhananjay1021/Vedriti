import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Calendar, Clock } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { formatDate, formatTime, parseDate, toIsoDate } from '../../utils/format';

const C = THEME.colors;

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ title, onPress, variant = 'primary', loading, disabled, style, icon }) => {
  const inactive = disabled || loading;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={inactive}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      style={[styles.button, styles[`button_${variant}`], inactive && styles.buttonDisabled, style]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? '#FFF' : C.primarySaffron} />
      ) : (
        <View style={styles.buttonRow}>
          {icon}
          <Text style={[styles.buttonText, styles[`buttonText_${variant}`]]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

interface FieldProps extends TextInputProps {
  label: string;
  error?: string | null;
  required?: boolean;
  hint?: string;
  prefix?: string;
}

export const Field = React.forwardRef<TextInput, FieldProps>(({ label, error, required, hint, prefix, style, ...input }, ref) => (
  <View style={styles.field}>
    <Text style={styles.label}>
      {label}
      {required ? <Text style={styles.required}> *</Text> : null}
    </Text>
    <View style={[styles.inputWrap, error ? styles.inputError : null, input.editable === false && styles.inputReadonly]}>
      {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
      <TextInput ref={ref} placeholderTextColor={C.mutedText} style={[styles.input, style]} {...input} />
    </View>
    {error ? <Text style={styles.errorText}>{error}</Text> : hint ? <Text style={styles.hint}>{hint}</Text> : null}
  </View>
));

Field.displayName = 'Field';

interface DateFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  mode?: 'date' | 'time';
  error?: string | null;
  required?: boolean;
  maximumDate?: Date;
  minimumDate?: Date;
  placeholder?: string;
}

export const DateField: React.FC<DateFieldProps> = ({
  label,
  value,
  onChange,
  mode = 'date',
  error,
  required,
  maximumDate,
  minimumDate,
  placeholder,
}) => {
  const [open, setOpen] = useState(false);

  const current = (() => {
    if (!value) return mode === 'date' ? new Date(1990, 0, 1) : new Date(2000, 0, 1, 6, 0);
    if (mode === 'date') return parseDate(value);
    const [h, m] = value.split(':').map(Number);
    return new Date(2000, 0, 1, h, m);
  })();

  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setOpen(false);
    if (event.type !== 'set' || !selected) return;
    if (mode === 'date') onChange(toIsoDate(selected));
    else onChange(`${String(selected.getHours()).padStart(2, '0')}:${String(selected.getMinutes()).padStart(2, '0')}`);
  };

  const Icon = mode === 'date' ? Calendar : Clock;
  const display = value ? (mode === 'date' ? formatDate(value) : formatTime(value)) : '';

  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setOpen(true)}
        style={[styles.inputWrap, error ? styles.inputError : null]}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${display || 'not selected'}`}
      >
        <Text style={[styles.input, styles.pickerText, !display && { color: C.mutedText }]}>
          {display || placeholder || (mode === 'date' ? 'Select date' : 'Select time')}
        </Text>
        <Icon size={16} color={C.primarySaffron} />
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {open ? (
        <DateTimePicker
          value={current}
          mode={mode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          onChange={handleChange}
        />
      ) : null}
      {open && Platform.OS === 'ios' ? <Button title="Done" variant="ghost" onPress={() => setOpen(false)} /> : null}
    </View>
  );
};

interface ChipsProps<T extends string> {
  options: { value: T; label: string; hint?: string }[];
  value: T | null;
  onChange: (value: T) => void;
  label?: string;
  error?: string | null;
}

export function Chips<T extends string>({ options, value, onChange, label, error }: ChipsProps<T>) {
  return (
    <View style={styles.field}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.chipsRow}>
        {options.map((o) => {
          const active = o.value === value;
          return (
            <TouchableOpacity
              key={o.value}
              onPress={() => onChange(o.value)}
              activeOpacity={0.8}
              style={[styles.chip, active && styles.chipActive]}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{o.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export const Card: React.FC<{ children: React.ReactNode; style?: StyleProp<ViewStyle> }> = ({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
);

export const SectionTitle: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <View style={styles.sectionTitle}>
    <Text style={styles.sectionTitleText}>{title}</Text>
    {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
  </View>
);

export const StatusPill: React.FC<{ label: string; colors: { bg: string; fg: string } }> = ({ label, colors }) => (
  <View style={[styles.pill, { backgroundColor: colors.bg }]}>
    <Text style={[styles.pillText, { color: colors.fg }]}>{label}</Text>
  </View>
);

export const EmptyState: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode }> = ({ title, subtitle, action }) => (
  <View style={styles.empty}>
    <Text style={styles.emptyOm}>ॐ</Text>
    <Text style={styles.emptyTitle}>{title}</Text>
    {subtitle ? <Text style={styles.emptySubtitle}>{subtitle}</Text> : null}
    {action}
  </View>
);

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    borderRadius: 999,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button_primary: { backgroundColor: C.primarySaffron },
  button_outline: { borderWidth: 1.5, borderColor: C.primarySaffron, backgroundColor: '#FFF' },
  button_ghost: { backgroundColor: 'transparent' },
  button_danger: { backgroundColor: '#B91C1C' },
  buttonDisabled: { opacity: 0.5 },
  buttonRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  buttonText: { fontSize: 15, fontWeight: '700' },
  buttonText_primary: { color: '#FFF' },
  buttonText_outline: { color: C.primarySaffron },
  buttonText_ghost: { color: C.primarySaffron },
  buttonText_danger: { color: '#FFF' },
  field: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '700', color: C.heading, marginBottom: 6 },
  required: { color: '#B91C1C' },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: '#FFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    minHeight: 50,
  },
  inputError: { borderColor: '#DC2626' },
  inputReadonly: { backgroundColor: C.softPeach },
  prefix: { fontSize: 15, fontWeight: '700', color: C.heading, marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: C.heading, paddingVertical: 12 },
  pickerText: { paddingVertical: 14 },
  errorText: { color: '#B91C1C', fontSize: 12, marginTop: 5 },
  hint: { color: C.mutedText, fontSize: 12, marginTop: 5 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: '#FFF',
  },
  chipActive: { backgroundColor: C.primarySaffron, borderColor: C.primarySaffron },
  chipText: { fontSize: 13, fontWeight: '600', color: C.bodyText },
  chipTextActive: { color: '#FFF' },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.borderLight,
    padding: 16,
    ...THEME.shadows.subtle,
  },
  sectionTitle: { marginBottom: 12 },
  sectionTitleText: { fontSize: 18, fontWeight: '800', color: C.heading, fontFamily: THEME.typography.serif },
  sectionSubtitle: { fontSize: 13, color: C.mutedText, marginTop: 3 },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, alignSelf: 'flex-start' },
  pillText: { fontSize: 11, fontWeight: '800' },
  empty: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24 },
  emptyOm: { fontSize: 40, color: C.goldDark, marginBottom: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: C.heading, textAlign: 'center' },
  emptySubtitle: { fontSize: 13, color: C.mutedText, textAlign: 'center', marginTop: 6, marginBottom: 14 },
});
