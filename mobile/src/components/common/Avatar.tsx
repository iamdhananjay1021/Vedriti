import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { THEME } from '../../constants/theme';

interface Props {
  uri?: string;
  name?: string;
  size?: number;
  ring?: boolean;
}

export const Avatar: React.FC<Props> = ({ uri, name = '', size = 38, ring = false }) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [uri]);

  const initial = (name.trim().charAt(0) || 'V').toUpperCase();
  const outer = ring ? size + 8 : size;

  return (
    <View
      style={[
        styles.circle,
        ring && styles.ring,
        { width: outer, height: outer, borderRadius: outer / 2 },
      ]}
    >
      <View style={[styles.inner, { width: size, height: size, borderRadius: size / 2 }]}>
        {uri && !failed ? (
          <Image source={{ uri }} style={{ width: size, height: size }} resizeMode="cover" onError={() => setFailed(true)} />
        ) : (
          <Text style={[styles.initial, { fontSize: size * 0.42 }]}>{initial}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
  ring: { borderWidth: 2, borderColor: THEME.colors.gold },
  inner: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: THEME.colors.primarySaffron },
  initial: { color: '#FFFFFF', fontWeight: '800' },
});
