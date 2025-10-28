import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, Mask, Rect } from 'react-native-svg';

interface DarkMazeOverlayProps {
  mazeWidth: number;
  mazeHeight: number;
  ballX: number;
  ballY: number;
  ballSize: number;
  spotlightMultiplier?: number;
  borderRadius?: number;
  opacity?: number;
}

export const DarkMazeOverlay: React.FC<DarkMazeOverlayProps> = ({
  mazeWidth,
  mazeHeight,
  ballX,
  ballY,
  ballSize,
  spotlightMultiplier = 4,
  borderRadius = 5,
  opacity = 1,
}) => {
  const spotlightRadius = (ballSize * spotlightMultiplier) / 2;

  return (
    <View style={[styles.darkOverlay, { width: mazeWidth, height: mazeHeight }]} pointerEvents="none">
      <Svg width={mazeWidth -4} height={mazeHeight -4}>
        <Defs>
          <ClipPath id="rounded-corners">
            <Rect
              x="0"
              y="0"
              width={mazeWidth - 4}
              height={mazeHeight - 4}
              rx={borderRadius}
              ry={borderRadius}
            />
          </ClipPath>
          <Mask id="spotlight">
            <Rect x="0" y="0" width={mazeWidth} height={mazeHeight} fill="white" />
            <Circle
              cx={ballX}
              cy={ballY}
              r={spotlightRadius}
              fill="black"
            />
          </Mask>
        </Defs>
          <Rect
            x="0"
            y="0"
            width={mazeWidth -4}
            height={mazeHeight -4}
            fill={`rgba(0, 0, 0, ${opacity})`}
            mask="url(#spotlight)"
            clipPath="url(#rounded-corners)"
          />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  darkOverlay: {
    position: 'absolute',
    top: 2,
    left: 2,
    zIndex: 28,
  },
});