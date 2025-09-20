import { StyleSheet, Text, View } from "react-native";

interface MazeRendererProps { 
  mazeLayout: number[][];
  cellSize: number;
  wallCell: number;
  goalCell: number;
  dangerCell: number;
}

export const MazeRenderer: React.FC<MazeRendererProps> = ({
  mazeLayout,
  cellSize,
  wallCell,
  goalCell,
  dangerCell
}) => {
  const walls = [];
  const goals = [];
  const explosiveWalls = [];
    
  for (let row = 0; row < mazeLayout.length; row++) {
    for (let col = 0; col < mazeLayout[row].length; col++) {
      const cell = mazeLayout[row][col];
      const key = `${row}-${col}`;
          
      if (cell === wallCell) {
        walls.push(
          <View
            key={key}
            style={[
              styles.wall,
              {
                left: col * cellSize,
                top: row * cellSize,
                width: cellSize + 1,
                height: cellSize + 1,
              }
            ]}
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
          <View
            key={key}
            style={[
              styles.explosiveWall,
              {
                left: col * cellSize,
                top: row * cellSize,
                width: cellSize + 0.5,
                height: cellSize + 0.5,
              }
            ]}
          />
        );
      }
    }
  }
  return [...walls, ...goals, ...explosiveWalls];
};

const styles = StyleSheet.create({
  wall: {
    backgroundColor: '#3d3d3dff',
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
    backgroundColor: '#ff4639ff',
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#ff4639ff',
  },
});