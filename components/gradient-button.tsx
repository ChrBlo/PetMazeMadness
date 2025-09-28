import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';

const GradientThemes = {
  green: ['#45da9cff', '#31996eff'],
  blue: ['#3894d1ff', '#296b97ff'],
  beige: ['#eeb867ff', '#c99951ff'],
} as const;

type GradientTheme = keyof typeof GradientThemes;

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  theme: GradientTheme;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const GradientButton: React.FC<GradientButtonProps> = ({title, onPress, theme, style, textStyle,}) => {
  return (
    <TouchableOpacity onPress={onPress} style={style}>
      <LinearGradient
        colors={GradientThemes[theme]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[style, { width: '100%' }]}
      >
      <View>
        <Text style={textStyle}>{title}</Text>
      </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};