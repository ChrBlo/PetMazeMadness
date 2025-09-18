import { useNavigation } from "@react-navigation/native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const MAZE_SIZE = 300;
const WALL_THICKNESS = 10;

// Maze layout
// 0 = path
// 1 = wall
const MAZE_LAYOUT = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];
const CELL_SIZE = MAZE_SIZE / MAZE_LAYOUT.length;

  const renderMaze = () => {
    const walls = [];

    for (let row = 0; row < MAZE_LAYOUT.length; row++) {
      for (let col = 0; col < MAZE_LAYOUT[row].length; col++) {
        const cell = MAZE_LAYOUT[row][col];
        const key = `${row}-${col}`;
        
        if (cell === 1) {
          walls.push(
            <View
              key={key}
              style={[
                styles.wall,
                {
                  left: col * CELL_SIZE,
                  top: row * CELL_SIZE,
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                }
              ]}
            />
          );
        }
      }
    }
    return [...walls];
  };

export default function GameScreen() {
  
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Rädda husdjuret! 🐾</Text>
        <Text style={styles.instructions}>
          Luta din telefon i ALLA riktningar för att guida ditt husdjur ut ur laburinten!
        </Text>
      </View>
      <View style={styles.gameContainer}>
        <View style={styles.maze}>
          {renderMaze()}
        </View>
      </View>
      <View>
        <TouchableOpacity style={styles.goToStartMenuButton} onPress={() => navigation.goBack()}>
          <Text>Till menyn</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222120ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#eee',
    marginBottom: 10,
  },
  instructions: {
    fontSize: 16,
    color: '#bbb',
    textAlign: 'center',
    marginBottom: 20,
  },
  goToStartMenuButton: {
    backgroundColor: '#68d86cff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    width: '80%',
  },
  wall: {
    backgroundColor: '#3d3d3dff',
    position: 'absolute',
  },
  gameContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  maze: {
    width: MAZE_SIZE,
    height: MAZE_SIZE,
    backgroundColor: '#f0f0f0',
    position: 'relative',
    borderRadius: 5,
  },
});