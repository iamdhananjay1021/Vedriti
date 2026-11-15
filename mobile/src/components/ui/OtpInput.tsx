import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { THEME } from '../../constants/theme';

interface Props {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  autoFocus?: boolean;
  hasError?: boolean;
  onComplete?: (value: string) => void;
}

export const OtpInput = React.forwardRef<TextInput, Props>(({ value, onChange, length = 6, autoFocus, hasError, onComplete }, ref) => {
  const inner = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const setRef = (node: TextInput | null) => {
    inner.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as React.MutableRefObject<TextInput | null>).current = node;
  };

  const handleChange = (text: string) => {
    const clean = text.replace(/\D/g, '').slice(0, length);
    onChange(clean);
    if (clean.length === length) onComplete?.(clean);
  };

  const active = Math.min(value.length, length - 1);

  return (
    <View>
      <Pressable style={styles.row} onPress={() => inner.current?.focus()} accessibilityLabel="Verification code">
        {Array.from({ length }).map((_, i) => {
          const char = value[i] || '';
          const isActive = focused && i === active;
          return (
            <View key={i} style={[styles.box, char ? styles.boxFilled : null, isActive && styles.boxActive, hasError && styles.boxError]}>
              <Text style={styles.digit}>{char}</Text>
            </View>
          );
        })}
      </Pressable>
      <TextInput
        ref={setRef}
        value={value}
        onChangeText={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={length}
        autoFocus={autoFocus}
        caretHidden
        style={styles.hidden}
      />
    </View>
  );
});

OtpInput.displayName = 'OtpInput';

const C = THEME.colors;
const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  box: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFilled: { borderColor: C.primarySaffron, backgroundColor: C.softSaffronBg },
  boxActive: { borderColor: C.primarySaffron, borderWidth: 2 },
  boxError: { borderColor: '#B91C1C' },
  digit: { fontSize: 24, fontWeight: '800', color: C.heading },
  hidden: { position: 'absolute', width: 1, height: 1, opacity: 0 },
});
