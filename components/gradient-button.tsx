import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const GradientThemes = {
  green: ['#5ccf9fff', '#42a079ff'],
  blue: ['#5da6d6ff', '#45799cff'],
  beige: ['#eeb867ff', '#c99951ff'],
  darkGreen: ['#44d397ff', '#2d8b64ff'],
  darkBlue: ['#459edaff', '#3678a5ff'],
  darkBeige: ['#f0b153ff', '#b38137ff'],
} as const;

type GradientTheme = keyof typeof GradientThemes;

interface GradientButtonProps {
  title?: string;
  onPress: () => void;
  theme: GradientTheme;
  style?: ViewStyle;
  textStyle?: TextStyle;
  iconName?: keyof typeof Ionicons.glyphMap; // icon support
  iconSize?: number;
  iconColor?: string;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  theme,
  style,
  textStyle,
  iconName,
  iconSize = 20,
  iconColor = 'white',
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={style}>
      <LinearGradient
        colors={GradientThemes[theme]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[
          style,
          {
            width: '100%',
            borderRadius: 12,
            paddingVertical: 10,
            paddingHorizontal: 16,
          },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          {iconName && (
            <Ionicons
              name={iconName}
              size={iconSize}
              color={iconColor}
              style={{ marginRight: title ? 8 : 0 }}
            />
          )}
          {title && <Text style={[{ color: 'white', fontWeight: '600' }, textStyle]}>{title}</Text>}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};
