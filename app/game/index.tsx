import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const MAZE_SIZE = 300;
const BALL_SIZE = 20;
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
const startPosition = { x: 1, y: 1 };
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
                  width: CELL_SIZE + 1,
                  height: CELL_SIZE + 1,
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

  const getStartPosition = () => ({
    x: CELL_SIZE * (startPosition.x + 0.5),
    y: CELL_SIZE * (startPosition.y + 0.5)
  });

  const [ballPosition, setBallPosition] = useState(() => getStartPosition());

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Rädda husdjuret! 🐾</Text>
        <Text style={styles.instructions}>
          Luta din telefon i ALLA riktningar för att guida hem ditt husdjur!
        </Text>
      </View>
      <View style={styles.gameContainer}>
        <View style={styles.maze}>
          {renderMaze()}

          {/* Hamsterbollen */}
          <View
            style={[
              styles.ball,
              {
                left: ballPosition.x - BALL_SIZE / 2,
                top: ballPosition.y - BALL_SIZE / 2,
              }
            ]}
          >
            <Text style={styles.animalEmoji}>🐹</Text>
          </View>
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
    width: '80%',
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
    backgroundColor: '#45da9cff',
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
  ball: {
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: BALL_SIZE / 2,
    backgroundColor: '#fff56bff',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  animalEmoji: {
    fontSize: 12,
  },
});