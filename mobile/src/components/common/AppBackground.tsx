import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';

interface AppBackgroundProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'light' | 'golden' | 'sanctum';
  overlayOpacity?: number;
}

export const AppBackground: React.FC<AppBackgroundProps> = ({
  children,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#FAF7F2',
  },
});

