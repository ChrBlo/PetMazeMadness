import React from 'react';
import { StyleSheet, Text, View } from "react-native";
import { Image } from 'expo-image';

interface MazeRendererProps { 
  mazeLayout: number[][];
  cellSize: number;
  wallCell: number;
  goalCell: number;
  dangerCell: number;
  snackCell?: number;
  eatenSnacks: Set<string>;
}

export const MazeRenderer: React.FC<MazeRendererProps> = React.memo(({
  mazeLayout,
  cellSize,
  wallCell,
  goalCell,
  dangerCell,
  snackCell,
  eatenSnacks                      
}) => {
  const walls = [];
  const goals = [];
  const explosiveWalls = [];
  const healthSnacks = [];
    
  for (let row = 0; row < mazeLayout.length; row++) {
    for (let col = 0; col < mazeLayout[row].length; col++) {
      const cell = mazeLayout[row][col];
      const key = `${row}-${col}`;
          
      if (cell === wallCell) {
        walls.push(
          <Image
            key={key}
            source={require('../assets/images/pixelsten.png')}
            style={[
              styles.wall,
              {
                left: col * cellSize,
                top: row * cellSize,
                width: cellSize + 1,
                height: cellSize + 1,
              }
            ]}
            contentFit="cover"
            cachePolicy="memory-disk"
            recyclingKey={`wall-${cellSize}`}
            transition={0}
          />
        );
      }
      else if (cell === goalCell) {
        goals.push(
          <View
            key={key}
            style={[
              styles.goal,
              {
                left: col * cellSize,
                top: row * cellSize,
                width: cellSize,
                height: cellSize,
              }
            ]}
          >
            <Text style={styles.goalText}>🏠</Text>
          </View>
        );
      }
      else if (cell === dangerCell) {
        explosiveWalls.push(
          <Image
            key={key}
            source={require('../assets/images/eld.png')}
            style={[
              styles.wall,
              {
                left: col * cellSize,
                top: row * cellSize,
                width: cellSize + 1,
                height: cellSize + 1,
              }
            ]}
            contentFit="cover"
            cachePolicy="memory-disk"
            recyclingKey={`danger-${cellSize}`}
            transition={0}
          />
        );
      }
      else if (cell === snackCell) {
        const snackKey = `${row}-${col}`;
        if (!eatenSnacks.has(snackKey)) {
          const fruits = ['🍎', '🍉', '🍌', '🍇', '🍓', '🍒'];
          const seed = (row * 100 + col) % fruits.length;
          const fruit = fruits[seed];

          healthSnacks.push(
            <View
              key={key}
              style={[
                styles.healthSnack,
                {
                  left: col * cellSize,
                  top: row * cellSize,
                  width: cellSize,
                  height: cellSize,
                }
              ]}
            >
              <Text style={styles.healthSnackText}>{fruit}</Text>
            </View>
          );
        }
      }
    }
  }

  return (
    <View style={{ width: mazeLayout[0].length * cellSize, height: mazeLayout.length * cellSize, position: 'relative' }}>
      {walls}
      {goals}
      {explosiveWalls}
      {healthSnacks}
    </View>
  );
}, (prevProps, nextProps) => {
  // Only re-render if these specific props change
  return (
    prevProps.mazeLayout === nextProps.mazeLayout && 
    prevProps.cellSize === nextProps.cellSize &&
    prevProps.wallCell === nextProps.wallCell &&
    prevProps.goalCell === nextProps.goalCell &&
    prevProps.dangerCell === nextProps.dangerCell &&
    prevProps.snackCell === nextProps.snackCell &&
    prevProps.eatenSnacks.size === nextProps.eatenSnacks.size &&
    // Check if the actual snacks are the same
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
  goalText: {
    fontSize: 22,
  },
  explosiveWall: {
    position: 'absolute',
  },
  healthSnack: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthSnackText: {
    fontSize: 15,
  },
});