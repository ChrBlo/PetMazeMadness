import { Image } from 'react-native';
import { ImageSourcePropType } from 'react-native';

interface PetImageProps {
  source: ImageSourcePropType;
  size?: number;
  style?: any;
}

export const PetImage = ({ source, size = 28, style }: PetImageProps) => {
  return (
    <Image source={source} style={[{ width: size, height: size, resizeMode: 'contain',}, style, ]}/>
  );
};

export default PetImage;