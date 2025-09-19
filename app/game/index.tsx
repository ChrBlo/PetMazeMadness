import { useNavigation } from "@react-navigation/native";
import { useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { Gyroscope } from 'expo-sensors';
import { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const MAZE_SIZE = 300;
const BALL_SIZE = 20;
const WALL_CELL = 1;
const GOAL_CELL = 2;
const DANGER_CELL = 3;

const explodingWallSound = require('../../assets/sounds/explosion.mp3');
const victorySound = require('../../assets/sounds/whopee.mp3');

// Maze layout
// 0 = path
// 1 = wall
// 2 = goal
// 3 = danger
const MAZE_LAYOUT = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [3, 0, 1, 0, 1, 0, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 2, 1, 1, 1, 1],
];
const startPosition = { x: 1, y: 1 };
const CELL_SIZE = MAZE_SIZE / MAZE_LAYOUT.length;

  const renderMaze = () => {
    const walls = [];
    const goals = [];
    const explosiveWalls = [];

    for (let row = 0; row < MAZE_LAYOUT.length; row++) {
      for (let col = 0; col < MAZE_LAYOUT[row].length; col++) {
        const cell = MAZE_LAYOUT[row][col];
        const key = `${row}-${col}`;
        
        if (cell === WALL_CELL)
        {
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
        else if (cell === GOAL_CELL)
        {
          goals.push(
            <View
              key={key}
              style={[
                styles.goal,
                {
                  left: col * CELL_SIZE,
                  top: row * CELL_SIZE,
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                }
              ]}
            >
              <Text style={styles.goalText}>🏠</Text>
            </View>
          );
        }
        else if (cell === DANGER_CELL)
        {
          explosiveWalls.push(
            <View
              key={key}
              style={[
                styles.explosiveWall,
                {
                  left: col * CELL_SIZE,
                  top: row * CELL_SIZE,
                  width: CELL_SIZE + 0.5,
                  height: CELL_SIZE + 0.5,
                }
              ]}
            />
          );
        }
      }
    }
    return [...walls, ...goals, ...explosiveWalls];
  };

export default function GameScreen() {
  //SCREEN NAV
  const navigation = useNavigation<any>();
  // GYRO
  const [subscription, setSubscription] = useState<any>(null);
  const [gyroscopeData, setGyroscopeData] = useState({ x: 0, y: 0, z: 0 });
  const animationRef = useRef<number | null>(null);
  //GAME FEATURES
  const [isGameWon, setIsGameWon] = useState(false);

  const [isDead, setIsDead] = useState(false);
  const [showExplosion, setShowExplosion] = useState(false);
  const [explosionPosition, setExplosionPosition] = useState({ x: 0, y: 0 });

  const [tryCount, setTryCount] = useState(1);

  const victory = useAudioPlayer(victorySound);
  const explosion = useAudioPlayer(explodingWallSound);

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
      Gyroscope.setUpdateInterval(16); //ca 60fps
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
    if (!isGameWon && !isDead) {
      animationRef.current = requestAnimationFrame(updateBallPosition);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gyroscopeData, ballPosition, isGameWon, isDead]);
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

    const isPositionWithinMazeBounds = (x: number, y: number) => {
      return x >= 0 && x < MAZE_LAYOUT[0].length && y >= 0 && y < MAZE_LAYOUT.length;
    };

    const getMazeCell = (x: number, y: number) => {
      return isPositionWithinMazeBounds(x, y) ? MAZE_LAYOUT[y][x] : null;
    };

    for (let point of checkPoints)
    {
      const pCellX = Math.floor(point.x / CELL_SIZE);
      const pCellY = Math.floor(point.y / CELL_SIZE);
      
      // Check for explosive wall collision FIRST
      if (getMazeCell(pCellX, pCellY) === DANGER_CELL)
      {
        triggerExplosion(newX, newY);
        return true;
      }

      // Check for regular walls
      if (getMazeCell(pCellX, pCellY) === WALL_CELL)
      {
        return true;
      }
    }

    // Check if reached goal
    if (getMazeCell(cellX, cellY) === GOAL_CELL)
    {
      setIsGameWon(true);
    
      victory.seekTo(0);
      victory.play();

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); 
      
      Alert.alert('Grattis!', 'Den lille råttan flydde! 🌈⭐', [
        { text: 'Testa igen' }
      ]);
    }

    return false;
  };
  // ----------------------------

  // EXPLOSION ------------------
  const triggerExplosion = (x: number, y: number) => {
    setExplosionPosition({ x, y });
    setShowExplosion(true);
    setIsDead(true);

    explosion.seekTo(0);
    explosion.play();

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); 

    // Hide explosion after 1 second
    setTimeout(() => {
      setShowExplosion(false);
    }, 1000);
  };
  //-----------------------------

  // RESET GAME -----------------
  const resetGame = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); 
    setTryCount(tryCount => tryCount +1);
    setBallPosition(getStartPosition());
    setIsGameWon(false);
    setIsDead(false);
    setShowExplosion(false);
  };

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.title}>Rädda husdjuret! 🐾</Text>
        <Text style={styles.instructions}>
          Luta din telefon i ALLA riktningar för att guida hem ditt husdjur!
        </Text>
      </View>

      <View style={styles.stats}>
        <Text style={styles.statsText}>
          Försök: {tryCount}
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
            <Text style={styles.animalEmoji}>
              {isDead ? '💀' : '🐹'}
            </Text>
          </View>

          {/* EXPLOSION */}
          {showExplosion && (
            <View
              style={[
                styles.explosion,
                {
                  left: explosionPosition.x - 15,
                  top: explosionPosition.y - 15,
                }
              ]}
            >
              <Text style={styles.explosionText}>💥</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
          <Text style={styles.resetButtonText}>Starta om</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.goToStartMenuButton} onPress={() => navigation.goBack()}>
          <Text style={styles.goToStartMenuText}>Till menyn</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#221c17ff',
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
  explosion: {
    position: 'absolute',
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  explosionText: {
    fontSize: 28,
  },
  controls: {
    marginTop: 30,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 15,
  },
  resetButton: {
    marginTop: 30,
    backgroundColor: '#45da9cff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stats: {
    marginTop: 30,
  },
  statsText: {
    fontSize: 16,
    color: '#bbb',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
});