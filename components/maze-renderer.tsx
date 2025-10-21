import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, View } from "react-native";

const fruitImages = [
  require('../assets/images/snacks/fruit_melon.png'),
  require('../assets/images/snacks/fruit_cherry.png'),
];

const simpleHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

const SNACK_SIZE = 24;
const GOAL_SIZE = 26;

interface MazeRendererProps { 
  mazeLayout: number[][];
  cellSize: number;
  wallCell: number;
  goalCell: number;
  dangerCell: number;
  snackCell?: number;
  eatenSnacks: Set<string>;
  secretWallCell: number;
  secretSnackCell: number;
}

export const MazeRenderer: React.FC<MazeRendererProps> = React.memo(({
  mazeLayout,
  cellSize,
  wallCell,
  goalCell,
  dangerCell,
  snackCell,
  eatenSnacks,
  secretWallCell,
  secretSnackCell,
}) => {
  const walls = [];
  const goals = [];
  const explosiveWalls = [];
  const healthSnacks = [];
    
  for (let row = 0; row < mazeLayout.length; row++)
  {
    for (let col = 0; col < mazeLayout[row].length; col++)
    {
      const cell = mazeLayout[row][col];
      const key = `${row}-${col}`;
          
      if (cell === wallCell || cell === secretWallCell)
      {
        walls.push(
          <Image
            key={key}
            source={require('../assets/images/pixelsten_removed_bg.png')}
            style={[
              styles.wall,
              {
                left: col * cellSize,
                top: row * cellSize,
                width: cellSize,
                height: cellSize,
                zIndex: 10,
              }
            ]}
            contentFit="cover"
            cachePolicy="memory-disk"
            recyclingKey={`wall-${cellSize}`}
            transition={0}
          />
        );
      }
      else if (cell === secretSnackCell)
      {
        walls.push(
          <Image
            key={key}
            source={require('../assets/images/pixelsten_removed_bg.png')}
            style={[
              styles.wall,
              {
                left: col * cellSize,
                top: row * cellSize,
                width: cellSize,
                height: cellSize,
                zIndex: 10,
              }
            ]}
            contentFit="cover"
            cachePolicy="memory-disk"
            recyclingKey={`wall-${cellSize}`}
            transition={0}
          />
        );
        
        const snackKey = `${row}-${col}`;
        if (!eatenSnacks.has(snackKey))
        {
          const seed = simpleHash(snackKey) % fruitImages.length;
          const fruitImage = fruitImages[seed];

          healthSnacks.push(
            <Image
              key={`snack-${key}`}
              source={fruitImage}
              style={[
                styles.healthSnack,
                {
                  left: col * cellSize + (cellSize - SNACK_SIZE) / 2,
                  top: row * cellSize + (cellSize - SNACK_SIZE) / 2,
                  width: SNACK_SIZE,
                  height: SNACK_SIZE,
                  zIndex: 5,
                }
              ]}
              contentFit="contain"
              cachePolicy="memory-disk"
              transition={0}
            />
          );
        }
      }
      else if (cell === goalCell)
      {
        goals.push(
          <Image
            key={key}
            source={require('../assets/images/home.png')}
            style={[
              styles.goal,
              {
                left: col * cellSize + (cellSize - GOAL_SIZE) / 2,
                top: row * cellSize + (cellSize - GOAL_SIZE) / 2,
                width: GOAL_SIZE,
                height: GOAL_SIZE,
              }
            ]}
            contentFit="cover"
            cachePolicy="memory-disk"
            recyclingKey={`wall-${cellSize}`}
            transition={0}
          />
        );
      }
      else if (cell === dangerCell)
      {
        explosiveWalls.push(
          <Image
            key={key}
            source={require('../assets/images/eld.png')}
            style={[
              styles.wall,
              {
                left: col * cellSize,
                top: row * cellSize,
                width: cellSize,
                height: cellSize,
              }
            ]}
            contentFit="cover"
            cachePolicy="memory-disk"
            recyclingKey={`danger-${cellSize}`}
            transition={0}
          />
        );
      }
      else if (cell === snackCell)
      {
        const snackKey = `${row}-${col}`;
        if (!eatenSnacks.has(snackKey))
        {
          const seed = simpleHash(snackKey) % fruitImages.length;
          const fruitImage = fruitImages[seed];

          healthSnacks.push(
            <Image
              key={`snack-${key}`}
              source={fruitImage}
              style={[
                styles.healthSnack,
                {
                  left: col * cellSize + (cellSize - SNACK_SIZE) / 2,
                  top: row * cellSize + (cellSize - SNACK_SIZE) / 2,
                  width: SNACK_SIZE,
                  height: SNACK_SIZE,
                  zIndex: 5,
                }
              ]}
              contentFit="contain"
              cachePolicy="memory-disk"
              transition={0}
            />
          );
        }
      }
    }
  }

  return (
    <View style={{ 
      width: mazeLayout[0].length * cellSize, 
      height: mazeLayout.length * cellSize, 
      position: 'relative' 
    }}>
      {walls}
      {goals}
      {explosiveWalls}
      {healthSnacks}
    </View>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.mazeLayout === nextProps.mazeLayout && 
    prevProps.cellSize === nextProps.cellSize &&
    prevProps.wallCell === nextProps.wallCell &&
    prevProps.goalCell === nextProps.goalCell &&
    prevProps.dangerCell === nextProps.dangerCell &&
    prevProps.snackCell === nextProps.snackCell &&
    prevProps.eatenSnacks.size === nextProps.eatenSnacks.size &&
    Array.from(prevProps.eatenSnacks).every(snack => nextProps.eatenSnacks.has(snack))
  );
});

const styles = StyleSheet.create({
  wall: {
    position: 'absolute',
  },
  goal: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  explosiveWall: {
    position: 'absolute',
  },
  healthSnack: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});