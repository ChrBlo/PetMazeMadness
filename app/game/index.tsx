import { useNavigation } from "@react-navigation/native";
import { useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { Gyroscope } from 'expo-sensors';
import { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MazeRenderer } from "../../components/maze-renderer";
import { MAZE_LEVELS, MazeLevel, getCurrentLevel } from '../../data/maze-layouts';
import { DEATH_EMOJI, getDefaultPet, getPetById } from '../../data/pets';
import { getPosition } from "../../utils/game-helpers";

const MAZE_SIZE = 300;
const BALL_SIZE = 20;
const WALL_CELL = 1;
const GOAL_CELL = 2;
const DANGER_CELL = 3;
const SNACK_CELL = 4;

const explodingWallSound = require('../../assets/sounds/explosion.mp3');
const victorySound = require('../../assets/sounds/whopee.mp3');
const snackSound = require('../../assets/sounds/snackSound1.mp3');
const spawnSound = require('../../assets/sounds/plop.mp3');

export default function GameScreen({ route }: { route: any }) {
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
  const [extraLives, setExtraLives] = useState(0);
  const [eatenSnacks, setEatenSnacks] = useState<Set<string>>(new Set());
  //GAME LEVELS
  const [currentLevelId, setCurrentLevelId] = useState(1);
  const [currentLevel, setCurrentLevel] = useState<MazeLevel>(getCurrentLevel(1));
  const [completedLevels, setCompletedLevels] = useState<Set<number>>(new Set());
  // PET
  const selectedPetId = route.params?.selectedPetId || getDefaultPet().id;
  const petName = route.params?.petName || getDefaultPet().defaultName;
  const selectedPet = getPetById(selectedPetId);
  // MAZE AND POSITIONING
  const MAZE_LAYOUT = currentLevel.layout;
  const CELL_SIZE = MAZE_SIZE / MAZE_LAYOUT.length;
  const getStartPosition = () => getPosition(currentLevel, MAZE_SIZE);
  const [ballPosition, setBallPosition] = useState(() => getStartPosition());
  //SOUND EFFECTS
  const victory = useAudioPlayer(victorySound);
  const explosion = useAudioPlayer(explodingWallSound);
  const snack = useAudioPlayer(snackSound);
  const plop = useAudioPlayer(spawnSound);

  // GYRO
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

    // Check if reached snack
    if (getMazeCell(cellX, cellY) === SNACK_CELL)
    {
      const snackKey = `${cellY}-${cellX}`;

      if (!eatenSnacks.has(snackKey)) {
        setExtraLives(extraLives => extraLives + 1);
        setEatenSnacks(prev => new Set([...prev, snackKey]));
      
        snack.seekTo(0);
        snack.play();
      }
    }
    

    // Check if reached goal
    if (getMazeCell(cellX, cellY) === GOAL_CELL)
    {
      setIsGameWon(true);
      setCompletedLevels(prev => new Set([...prev, currentLevelId]))
    
      victory.seekTo(0);
      victory.play();

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); 
      
      Alert.alert('Grattis!', `${petName} flydde! 🌈⭐`, [
        { text: 'Spela nästa', onPress: nextLevel}
      ]);
    }

    return false;
  };

  // EXPLOSION ------------------
  const triggerExplosion = (x: number, y: number) => {
    if (extraLives > 0) {
      setExtraLives(extraLives => extraLives - 1);

      // calculate hamsters position when death occured
      const cellX = Math.floor(x / CELL_SIZE);
      const cellY = Math.floor(y / CELL_SIZE);
      
      // Center the hamster in that cell
      const centeredX = cellX * CELL_SIZE + CELL_SIZE / 2;
      const centeredY = cellY * CELL_SIZE + CELL_SIZE / 2;
      setBallPosition({ x: centeredX, y: centeredY });
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      
      plop.seekTo(0);
      plop.play();
    }
    else {
      setExplosionPosition({ x, y });
      setShowExplosion(true);
      setIsDead(true);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      explosion.seekTo(0);
      explosion.play();

      // Hide explosion after 1 second
      setTimeout(() => {
        setShowExplosion(false);
      }, 1000);
    }
  };

  // RESET GAME -----------------
  const resetGame = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); 
    setTryCount(tryCount => tryCount +1);
    setBallPosition(getStartPosition());
    setIsGameWon(false);
    setIsDead(false);
    setShowExplosion(false);
    setExtraLives(0);
    setEatenSnacks(new Set());
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // NEXT LEVEL -----------------
    const nextLevel = () => {
    const nextId = currentLevelId + 1;
    if (nextId <= MAZE_LEVELS.length) {
      setCurrentLevelId(nextId);
      const newLevel = getCurrentLevel(nextId);
      setCurrentLevel(newLevel);
      setBallPosition(getPosition(newLevel, MAZE_SIZE));
      setEatenSnacks(new Set());
      setTryCount(1);
      setIsGameWon(false);
      setIsDead(false);
      setShowExplosion(false);
    }
  };

  // PREVIOUS LEVEL -------------
  const previousLevel = () => {
    const prevId = currentLevelId - 1;
    if (prevId >= 1) {
      setCurrentLevelId(prevId);
      const prevLevel = getCurrentLevel(prevId);
      setCurrentLevel(prevLevel);
      setBallPosition(getPosition(prevLevel, MAZE_SIZE));
      setEatenSnacks(new Set());
      setTryCount(1);
      setIsGameWon(false);
      setIsDead(false);
      setShowExplosion(false);
    }
  };
  //-----------------------------

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.title}>Rädda {petName} {selectedPet.emoji}! 🐾</Text>
        <Text style={styles.instructions}>
          Luta din telefon i ALLA riktningar för att guida hem ditt husdjur!
        </Text>
      </View>

      <View style={styles.stats}>
        <Text style={styles.statsText}>
          Försök: {tryCount}
        </Text>
        <Text style={styles.separator}></Text>
        <Text style={styles.statsText}>
          {extraLives > 0 ? `${selectedPet.emoji}: ${extraLives}` : ''}
        </Text>
      </View>

      <View style={styles.gameContainer}>
        <View style={styles.maze}>
          <MazeRenderer
            mazeLayout={MAZE_LAYOUT}
            cellSize={CELL_SIZE}
            wallCell={WALL_CELL}
            goalCell={GOAL_CELL}
            dangerCell={DANGER_CELL}
            snackCell={SNACK_CELL}
            eatenSnacks={eatenSnacks}
        />

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
              {isDead ? DEATH_EMOJI : selectedPet.emoji}
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

      <View style={styles.controls}>
      
        <TouchableOpacity 
          style={[styles.levelButton, currentLevelId <= 1 && styles.disabledButton]} 
          onPress={previousLevel}
          disabled={currentLevelId <= 1}
        >
          <Text style={styles.levelButtonText}>← Förra</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.levelButton, !completedLevels.has(currentLevelId) && styles.disabledButton]}
          onPress={nextLevel}
          disabled={!completedLevels.has(currentLevelId)}
        >
          <Text style={styles.levelButtonText}>Nästa →</Text>
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
    alignItems: 'center',
    flexDirection: 'row',
    gap: 15,
    width: '76%',
  },
  statsText: {
    fontSize: 16,
    color: '#bbb',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  separator: {
    flex: 1,
  },
  levelButton: {
    backgroundColor: '#3d3d3dff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
  },
  levelButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#666',
    opacity: 0.5,
  },
});