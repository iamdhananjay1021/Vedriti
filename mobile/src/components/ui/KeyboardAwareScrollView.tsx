import React, { useCallback, useEffect, useRef } from 'react';
import { Dimensions, Keyboard, NativeScrollEvent, NativeSyntheticEvent, ScrollView, ScrollViewProps, StyleProp, TextInput, ViewStyle } from 'react-native';
import { useKeyboardInset } from '../../hooks/useKeyboardInset';

const MARGIN_ABOVE_KEYBOARD = 24;

export const KeyboardAwareScrollView: React.FC<ScrollViewProps & { children: React.ReactNode }> = ({
  children,
  contentContainerStyle,
  onScroll,
  ...rest
}) => {
  const ref = useRef<ScrollView>(null);
  const offset = useRef(0);
  const { inset } = useKeyboardInset();

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      offset.current = e.nativeEvent.contentOffset.y;
      onScroll?.(e);
    },
    [onScroll]
  );

  useEffect(() => {
    if (!inset) return;
    const timer = setTimeout(() => {
      const focused = TextInput.State.currentlyFocusedInput?.();
      if (!focused) return;
      focused.measureInWindow((_x, y, _w, height) => {
        const visibleBottom = Dimensions.get('window').height - inset - MARGIN_ABOVE_KEYBOARD;
        const overlap = y + height - visibleBottom;
        if (overlap > 0) ref.current?.scrollTo({ y: offset.current + overlap, animated: true });
      });
    }, 80);
    return () => clearTimeout(timer);
  }, [inset]);

  const padded: StyleProp<ViewStyle> = [contentContainerStyle, { paddingBottom: inset }];

  return (
    <ScrollView ref={ref} onScroll={handleScroll} scrollEventThrottle={16} contentContainerStyle={padded} keyboardDismissMode="interactive" {...rest}>
      {children}
    </ScrollView>
  );
};

export const dismissKeyboard = () => Keyboard.dismiss();
