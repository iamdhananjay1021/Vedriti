import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, MessageCircle } from 'lucide-react-native';
import { THEME } from '../../constants/theme';

interface ChatFloatingButtonProps {
  onPress: () => void;
}

export const ChatFloatingButton: React.FC<ChatFloatingButtonProps> = ({ onPress }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <Animated.View style={[styles.fabContainer, { transform: [{ scale: pulseAnim }] }]}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.88}
        style={styles.touchable}
        accessibilityLabel="Ask Vedic AI Rishi or Acharya"
      >
        <LinearGradient
          colors={THEME.gradients.vermilionSunset}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          <Sparkles size={14} color="#F7E7B4" />
          <Text style={styles.btnText}>Vedic AI</Text>
          <View style={styles.onlineDot} />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: 74,
    right: 16,
    zIndex: 99,
  },
  touchable: {
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#F7E7B4',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7.5,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 5,
    letterSpacing: 0.2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ADE80',
    marginLeft: 6,
  },
});
