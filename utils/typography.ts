import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const getScale = () => {
  if (width >= 1024) return 1.5;      // Stora tablets
  if (width >= 768) return 1.25;      // Tablets
  if (width >= 414) return 1.1;       // Stora mobiler
  return 1;                           // Normala mobiler
};

const SCALE = getScale();

export const typography = {
  huge: 120 * SCALE,
  h1: 32 * SCALE,
  h2: 28 * SCALE,
  h3: 24 * SCALE,
  h35: 22 * SCALE,
  h4: 20 * SCALE,
  h5: 18 * SCALE,
  body: 16 * SCALE,
  small: 14 * SCALE,
  tiny: 12 * SCALE,
};

export const spacing = {
  xs: 4 * SCALE,
  sm: 8 * SCALE,
  md: 16 * SCALE,
  lg: 24 * SCALE,
  xl: 32 * SCALE,
};