import { Image } from 'expo-image';
import React, { useState } from 'react';
import { StyleSheet, View } from "react-native";

const fruitImages = [
  require('../assets/images/snacks/fruit_melon.png'),
  require('../assets/images/snacks/fruit_cherry.png'),
  require('../assets/images/snacks/fruit_apple.png'),
  require('../assets/images/snacks/fruit_grapes.png'),
  require('../assets/images/snacks/fruit_banana.png'),
];

const wallImages = [
  require('../assets/images/walls/rock1.png'),
  require('../assets/images/walls/rock2.png'),
  require('../assets/images/walls/rock3.png'),
  require('../assets/images/walls/rock4.png'),
  require('../assets/images/walls/rock5.png'),
  require('../assets/images/walls/rock6.png'),
];

const getWallImage = (row: number, col: number): any => {
  const key = `wall-${row}-${col}`;
  const seed = simpleHash(key) % wallImages.length;
  return wallImages[seed];
};

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
  ghoulTrigger: number;
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
  ghoulTrigger,
}) => {

  const [fruitAssignments] = useState(() => new Map<string, number>());
  
  const SNACK_SIZE = Math.floor(cellSize * 0.75);
  const GOAL_SIZE = Math.floor(cellSize * 0.85);

  const walls = [];
  const goals = [];
  const explosiveWalls = [];
  const healthSnacks = [];
  const ghoulTriggers = [];
    
  for (let row = 0; row < mazeLayout.length; row++)
  {
    for (let col = 0; col < mazeLayout[row].length; col++)
    {
      const cell = mazeLayout[row][col];
      const key = `${row}-${col}`;
          
      if (cell === wallCell || cell === secretWallCell)
      {
        const wallImage = getWallImage(row, col);

        walls.push(
          <Image
            key={key}
            source={wallImage}
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
        const wallImage = getWallImage(row, col);

        walls.push(
          <Image
            key={key}
            source={wallImage}
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
          if (!fruitAssignments.has(snackKey)) {
            fruitAssignments.set(snackKey, Math.floor(Math.random() * fruitImages.length));
          }
          const fruitImage = fruitImages[fruitAssignments.get(snackKey)!];

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
              recyclingKey={`snack-${cellSize}`}
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
            recyclingKey={`goal-${cellSize}`}
            transition={0}
          />
        );
      }
      else if (cell === dangerCell)
      {
        explosiveWalls.push(
          <Image
            key={key}
            source={require('../assets/images/fire.png')}
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
          if (!fruitAssignments.has(snackKey)) {
            fruitAssignments.set(snackKey, Math.floor(Math.random() * fruitImages.length));
          }
          const fruitImage = fruitImages[fruitAssignments.get(snackKey)!];

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
              recyclingKey={`snack-${cellSize}`}
              transition={0}
            />
          );
        }
      }
      else if (cell === ghoulTrigger)
      {
        ghoulTriggers.push(
          <Image
            key={key}
            source={require('../assets/images/crack.png')}
            style={[
              styles.ghoulTrigger,
              {
                left: col * cellSize,
                top: row * cellSize,
                width: cellSize,
                height: cellSize,
              }
            ]}
            contentFit="cover"
            cachePolicy="memory-disk"
            recyclingKey={`ghoultrigger-${cellSize}`}
            transition={0}
          />
        );
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
      {ghoulTriggers}
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
    prevProps.ghoulTrigger === nextProps.ghoulTrigger &&
    prevProps.eatenSnacks.size === nextProps.eatenSnacks.size &&
    Array.from(prevProps.eatenSnacks).every(snack => nextProps.eatenSnacks.has(snack))
  );
});

const styles = StyleSheet.create({
  wall: {
    position: 'absolute',
  },
  ghoulTrigger: {
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