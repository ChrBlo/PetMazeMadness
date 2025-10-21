import { useAudioPlayer } from 'expo-audio';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { typography } from '../utils/typography';

interface CountdownOverlayProps {
  isVisible: boolean;
  onComplete: () => void;
  volume?: number;
}
const countdownSound = require('../assets/sounds/countdown.wav');

export const CountdownAnimation: React.FC<CountdownOverlayProps> = ({  isVisible, onComplete, volume = 0.1 }) => {
  const [currentNumber, setCurrentNumber] = React.useState(3);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const countdown = useAudioPlayer(countdownSound);
  
  useEffect(() => {
    if (!isVisible) return;

    setCurrentNumber(3);

    countdown.volume = volume;
    countdown.seekTo(0);
    countdown.play();
    
    startCountdown(3);
  }, [isVisible]);

  const startCountdown = (num: number) => {
    if (num < 1)
    {
      onComplete();
      return;
    }

    scaleAnim.setValue(1.5);
    opacityAnim.setValue(1);

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.5,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      const nextNum = num - 1;
      if (nextNum >= 1) {
        setCurrentNumber(nextNum);
        startCountdown(nextNum);
      } else {
        onComplete();
      }
    });
  };

  if (!isVisible) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[
          styles.countdownContainer,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <Text style={styles.countdownText}>{currentNumber}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  countdownContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownText: {
    fontSize: typography.huge,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
});