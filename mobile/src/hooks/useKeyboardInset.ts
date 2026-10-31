import { useEffect, useState } from 'react';
import { Dimensions, Keyboard, KeyboardEvent, Platform } from 'react-native';

const SHOW = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
const HIDE = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

const insetFor = (e: KeyboardEvent) => {
  const { height, screenY } = e.endCoordinates ?? { height: 0, screenY: 0 };
  const windowHeight = Dimensions.get('window').height;
  if (screenY > 0) return Math.max(0, Math.round(windowHeight - screenY));
  return Math.max(0, Math.round(height));
};

export function useKeyboardInset() {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const show = Keyboard.addListener(SHOW, (e) => setInset(insetFor(e)));
    const hide = Keyboard.addListener(HIDE, () => setInset(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return { inset, keyboardHeight: inset };
}
