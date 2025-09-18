import { useNavigation } from "@react-navigation/native";
import { Gyroscope } from 'expo-sensors';
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const MAZE_SIZE = 300;
const BALL_SIZE = 20;

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
  //SCREEN NAV
  const navigation = useNavigation<any>();
  // GYRO
  const [subscription, setSubscription] = useState<any>(null);
  const [gyroscopeData, setGyroscopeData] = useState({ x: 0, y: 0, z: 0 });
  const animationRef = useRef<number | null>(null);

  const getStartPosition = () => ({
    x: CELL_SIZE * (startPosition.x + 0.5),
    y: CELL_SIZE * (startPosition.y + 0.5)
  });

  const [ballPosition, setBallPosition] = useState(() => getStartPosition());

  // THIS IS FOR THE GYRO TO WORK
    const _subscribe = () => {
    setSubscription(
      Gyroscope.addListener(gyroscopeData => {
        setGyroscopeData(gyroscopeData);
      })
    );
  };

  const _unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  useEffect(() => {
    _subscribe();
    return () => _unsubscribe();
  }, []);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(updateBallPosition);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gyroscopeData, ballPosition]);
  // ----------------------------

  // UPDATE BALL POSITION -------
  const updateBallPosition = () => {
    setBallPosition(prevPosition => {
      // Use gyroscope data to simulate gravity
      const gravity = 0.6;
      const friction = 0.80;
      
      // Calculate new velocity based on gyroscope
      let velX = gyroscopeData.y * gravity;
      let velY = gyroscopeData.x * gravity;
      
      // Apply friction
      velX *= friction;
      velY *= friction;
      
      // Calculate new position
      const newX = prevPosition.x + velX;
      const newY = prevPosition.y + velY;
      
      // Check for collisions
      if (!checkCollision(newX, newY)) {
        return { x: newX, y: newY };
      } else if (!checkCollision(newX, prevPosition.y)) {
        return { x: newX, y: prevPosition.y };
      } else if (!checkCollision(prevPosition.x, newY)) {
        return { x: prevPosition.x, y: newY };
      }
      
      return prevPosition;
    });
  };
  // ----------------------------

  // CHECK WALL COLLISION
  const checkCollision = (newX: number, newY: number) => {
    const ballRadius = BALL_SIZE / 2;
    
    // Check bounds
    if (newX - ballRadius < 0 || newX + ballRadius > MAZE_SIZE ||
        newY - ballRadius < 0 || newY + ballRadius > MAZE_SIZE) {
      return true;
    }

    // Check maze walls
    const cellX = Math.floor(newX / CELL_SIZE);
    const cellY = Math.floor(newY / CELL_SIZE);
    
    // Check multiple points around the ball
    const checkPoints = [
      { x: newX - ballRadius, y: newY - ballRadius },
      { x: newX + ballRadius, y: newY - ballRadius },
      { x: newX - ballRadius, y: newY + ballRadius },
      { x: newX + ballRadius, y: newY + ballRadius },
    ];

    for (let point of checkPoints)
    {
      const pCellX = Math.floor(point.x / CELL_SIZE);
      const pCellY = Math.floor(point.y / CELL_SIZE);
      
      if (pCellX >= 0 && pCellX < MAZE_LAYOUT[0].length &&
        pCellY >= 0 && pCellY < MAZE_LAYOUT.length) {
                              
        if (MAZE_LAYOUT[pCellY][pCellX] === 1)
        {
          return true;
        }
      }
    }

    return false;
  };
  // ----------------------------

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

          {/* PET BALL */}
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
          <Text style={ styles.goToStartMenuText}>Till menyn</Text>
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
    marginTop: 30,
    backgroundColor: '#3d3d3dff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  goToStartMenuText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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