import { StyleSheet, Text, View } from "react-native";

interface MazeRendererProps { 
  mazeLayout: number[][];
  cellSize: number;
  wallCell: number;
  goalCell: number;
  dangerCell: number;
  snackCell: number;
  eatenSnacks: Set<string>;
}

export const MazeRenderer: React.FC<MazeRendererProps> = ({
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
          
      if (cell === wallCell)
      {
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
      else if (cell === goalCell)
      {
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
      else if (cell === dangerCell)
      {
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
      else if (cell === snackCell)
      {
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
  return [...walls, ...goals, ...explosiveWalls, ...healthSnacks];
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
  healthSnack: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthSnackText: {
    fontSize: 15,
  },
});