import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from '@react-navigation/native';
import { useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useAtom, useSetAtom } from 'jotai';
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { isDeadAtom, isGameWonAtom, recordDeathAtom, recordWinAtom, resetGameStateAtom } from '../../atoms/gameAtoms';
import { CountdownAnimation } from '../../components/countdown-animation';
import { GradientButton } from "../../components/gradient-button";
import { MazeRenderer } from "../../components/maze-renderer";
import { MAZE_LEVELS, MazeLevel, getCurrentLevel } from '../../data/maze-layouts';
import { DEATH_EMOJI, getDefaultPet } from '../../data/pets';
import { useGamePhysics } from '../../hooks/useGamePhysics';
import { GyroMode, useGameSensors } from '../../hooks/useGameSensors';
import { useGameTimer } from '../../hooks/useGameTimer';
import { findNearestSafeCell, getMazeCell, getPosition } from "../../utils/game-helpers";
import { LevelStats, ScoreManager } from '../../utils/score-manager';
import { GameScreenProps } from "../root-layout";

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

export default function GameScreen({ route, navigation }: GameScreenProps) {
  // JOTAI STATE HANDLING
  const [isGameWon] = useAtom(isGameWonAtom);
  const [isDead] = useAtom(isDeadAtom);
  const recordWin = useSetAtom(recordWinAtom);
  const recordDeath = useSetAtom(recordDeathAtom);
  const resetGameState = useSetAtom(resetGameStateAtom);
  // GYRO
  const [gyroMode] = useState<GyroMode>(route.params?.gyroMode || GyroMode.NORMAL);
  const invertedGameControls = route.params?.invertedGameControls ?? false;
  //GAME FEATURES & EFFECTS
  const [showExplosion, setShowExplosion] = useState(false);
  const [explosionPosition, setExplosionPosition] = useState({ x: 0, y: 0 });
  const [extraLives, setExtraLives] = useState(0);
  const [eatenSnacks, setEatenSnacks] = useState<Set<string>>(new Set());
  const [showCountdown, setShowCountdown] = useState(false);
  const [isCountdownComplete, setIsCountdownComplete] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const eatenSnacksRef = useRef<Set<string>>(new Set());
  // SCORE AND ATTEMPTS
  const [levelStats, setLevelStats] = useState<LevelStats | null>(null);
  const [currentAttempt, setCurrentAttempt] = useState(1);
  const [extraLivesUsed, setExtraLivesUsed] = useState(0);
  const [isGamePaused, setIsGamePaused] = useState(false);
  //GAME LEVELS
  const [currentLevelId, setCurrentLevelId] = useState(route.params?.initialLevel || 1);
  const [currentLevel, setCurrentLevel] = useState<MazeLevel>(getCurrentLevel(route.params?.initialLevel || 1));
  const [completedLevels, setCompletedLevels] = useState<Set<number>>(new Set());
  // PET
  const selectedPet = route.params?.selectedPet || getDefaultPet();
  const petName = selectedPet?.name || getDefaultPet().name;
  // MAZE AND POSITIONING
  const MAZE_LAYOUT = currentLevel.layout;
  const CELL_SIZE = MAZE_SIZE / MAZE_LAYOUT.length;
  const getStartPosition = () => getPosition(currentLevel, MAZE_SIZE);
  //SOUND EFFECTS
  const victory = useAudioPlayer(victorySound);
  const explosion = useAudioPlayer(explodingWallSound);
  const snack = useAudioPlayer(snackSound);
  const plop = useAudioPlayer(spawnSound);
  
  useEffect(() => {
    const loadInitialData = async () => {
      resetGameState();
      
      const progress = await ScoreManager.getGameProgress();
      setCompletedLevels(new Set(progress.completedLevels));
    };
    loadInitialData();
  }, []);
  
  useEffect(() => {
    const loadStats = async () => {
      const stats = await ScoreManager.getLevelStats(currentLevelId);
      setLevelStats(stats);
      setCurrentAttempt(stats.totalAttempts + 1);
    };
    loadStats();
  }, [currentLevelId]);

  useEffect(() => {
    if (isReady) {
      setShowCountdown(true);
    }
  }, [isReady]);
  
  useEffect(() => {
    if (isCountdownComplete) {
      startTimer();
    }
  }, [isCountdownComplete]);
  
  useEffect(() => {
    eatenSnacksRef.current = eatenSnacks;
  }, [eatenSnacks]);

  useFocusEffect(
    useCallback(() => {
      setIsGamePaused(false);
      return () => {
        setIsGamePaused(true);
      };
    }, [])
);

  const handleCountdownComplete = () => {
    setShowCountdown(false);
    setIsCountdownComplete(true);
    setIsReady(false);
  };
  
  const handleGoToMazeStats = () => {
    navigation.navigate('GameStats', {
      levelId: currentLevelId,
      currentPet: selectedPet,
      gyroMode: gyroMode
    });
  };
  
  // CHECK WALL COLLISION
  const checkCollision = (newX: number, newY: number) => {
    const ballRadius = BALL_SIZE / 2;
    
    if (newX - ballRadius < 0 || newX + ballRadius > MAZE_SIZE ||
      newY - ballRadius < 0 || newY + ballRadius > MAZE_SIZE) {
      return true;
    }

    const cellX = Math.floor(newX / CELL_SIZE);
    const cellY = Math.floor(newY / CELL_SIZE);
    
    // check 16 points around ball to make it rounder
    const checkPoints = [];
    for (let i = 0; i < 16; i++)
    {
      const angle = (i * Math.PI * 2) / 16;
      checkPoints.push({
        x: newX + Math.cos(angle) * ballRadius,
        y: newY + Math.sin(angle) * ballRadius,
      });
    }

    for (let point of checkPoints) {
      const pCellX = Math.floor(point.x / CELL_SIZE);
      const pCellY = Math.floor(point.y / CELL_SIZE);
      
      // check if DANGER_CELL first
      if (getMazeCell(pCellX, pCellY, MAZE_LAYOUT) === DANGER_CELL)
      {
        if (extraLives > 0)
        {
          triggerRespawn(pCellX, pCellY);
          return false;
        }
        else
        {
          setExplosionPosition({ x: newX, y: newY });
          setShowExplosion(true);
          
          // Record death - Jotai
          recordDeath(currentLevelId).then((updatedStats) => {
            if (updatedStats) {
              setLevelStats(updatedStats);
            }
          });
          
          explosion.seekTo(0);
          explosion.play();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          
          setTimeout(() => setShowExplosion(false), 1000);
          return true;
        }
      }

      // check if WALL_CELL
      if (getMazeCell(pCellX, pCellY, MAZE_LAYOUT) === WALL_CELL) {
        return true;
      }
    }

    // check if SNACK_CELL
    if (getMazeCell(cellX, cellY, MAZE_LAYOUT) === SNACK_CELL) {
      const snackKey = `${cellY}-${cellX}`;

      if (!eatenSnacksRef.current.has(snackKey)) {
        eatenSnacksRef.current.add(snackKey);
        setEatenSnacks(new Set(eatenSnacksRef.current));
        setExtraLives(lives => lives + 1);

        snack.seekTo(0);
        snack.play();
      }
    }
    
    // Check if GOAL_CELL
    if (getMazeCell(cellX, cellY, MAZE_LAYOUT) === GOAL_CELL) {
      const completionTime = stopTimer();
      setCompletedLevels(prev => new Set([...prev, currentLevelId]));
      
      victory.seekTo(0);
      victory.play();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Record win - Jotai
      recordWin({
        currentLevelId,
        completionTime,
        selectedPet,
        currentAttempt,
        totalDeaths: levelStats?.totalDeaths || 0,
        extraLivesUsed,
        gyroMode: gyroMode.toString()
      }).then((result) => {
        if (result?.isNewRecord)
        {
          Alert.alert('Grattis!', `${petName} flydde! 🌈⭐\nNYTT REKORD: ${formatTime(completionTime)}!`, [
            { text: 'Spela nästa', onPress: nextLevel }
          ]);
        }
        else
        {
          Alert.alert('Grattis!', `${petName} flydde! 🌈⭐`, [
            { text: 'Spela nästa', onPress: nextLevel }
          ]);
        }
      });
    }
    
    return false;
  };

  // RESPAWN LOGIC --------------
  const triggerRespawn = (cellX: number, cellY: number) => {
    setExtraLives(prev => prev - 1);
    setExtraLivesUsed(prev => prev + 1);
  
    const safeCell = findNearestSafeCell(cellX, cellY, MAZE_LAYOUT);
    
    if (safeCell) {
      const centeredX = safeCell.x * CELL_SIZE + CELL_SIZE / 2;
      const centeredY = safeCell.y * CELL_SIZE + CELL_SIZE / 2;
      setBallPosition({ x: centeredX, y: centeredY });
    }
    
    plop.seekTo(0);
    plop.play();

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  // RESET GAME -----------------
  const resetGame = async () => {
    resetGameState();
    resetTimer();

    resetPosition();
    setShowExplosion(false);
    setExtraLives(0);
    setEatenSnacks(new Set());
    setVelocity({ x: 0, y: 0 });
    setExtraLivesUsed(0);
    
    const updatedStats = await ScoreManager.recordAttempt(currentLevelId);
    setLevelStats(updatedStats);
    setCurrentAttempt(updatedStats.totalAttempts);

    setIsCountdownComplete(false);
    setIsReady(true);
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // NEXT LEVEL -----------------
    const nextLevel = () => {
    const nextId = currentLevelId + 1;
    if (nextId <= MAZE_LEVELS.length)
    {
      resetGameState(); // Jotai - reset atoms
      resetTimer();
      
      setCurrentLevelId(nextId);
      const newLevel = getCurrentLevel(nextId);
      setCurrentLevel(newLevel);
      setBallPosition(getPosition(newLevel, MAZE_SIZE));
      setEatenSnacks(new Set());
      setShowExplosion(false);
      setVelocity({ x: 0, y: 0 });

      ScoreManager.recordAttempt(nextId);

      setIsReady(false);
      setIsCountdownComplete(false);
    }
  };

  // PREVIOUS LEVEL -------------
  const previousLevel = () => {
    const prevId = currentLevelId - 1;
    if (prevId >= 1)
    {
      resetGameState();
      resetTimer();

      setCurrentLevelId(prevId);
      const prevLevel = getCurrentLevel(prevId);
      setCurrentLevel(prevLevel);
      setBallPosition(getPosition(prevLevel, MAZE_SIZE));
      setEatenSnacks(new Set());
      setShowExplosion(false);
      setVelocity({ x: 0, y: 0 });

      ScoreManager.recordAttempt(prevId);

      setIsReady(false);
      setIsCountdownComplete(false);
    }
  };

  // CUSTOM HOOKS ----------------
  const { accelData, gyroData } = useGameSensors(gyroMode);
  
  const { gameTime, startTimer, stopTimer, resetTimer } = useGameTimer(!isGameWon && !isDead && !isGamePaused && isCountdownComplete);

  const { ballPosition, setBallPosition, velocity, setVelocity, resetPosition } = useGamePhysics({
    gyroMode,
    accelData,
    gyroData,
    checkCollision,
    isGameWon,
    isDead: isDead || isGamePaused || !isCountdownComplete, // Pause & countdown treates as death in gamePhysics
    initialPosition: getStartPosition(),
    inverted: invertedGameControls
  });
  //-----------------------------

  const formatTime = (timeMs: number) => `${(timeMs / 1000).toFixed(1)}s`;

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.title}>Rädda {petName}! {selectedPet.emoji}</Text>
        <Text style={styles.instructions}>
          Luta din telefon i ALLA riktningar för att guida hem ditt husdjur!
        </Text>
      </View>

      <View style={styles.level}>
        <Text style={styles.levelText}>{currentLevel.name}</Text>
      </View>
      
      <View style={styles.stats}>
        <Text style={styles.statsText}>
          Försök: {levelStats?.totalAttempts || 0}
        </Text>
        <View style={styles.separator} />
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

      <View style={styles.gameTimer}>
        <Text style={styles.gameTimerText}>
          Tid: {`${(gameTime / 1000).toFixed(2)}s`}
        </Text>
        <View style={styles.separator} />
        {levelStats?.bestTime && (
          <Text style={styles.gameTimerText}>
            Bästa tid: {formatTime(levelStats.bestTime)}
          </Text>
        )}
      </View>
      
      {/* BUTTONS */}
      <View style={styles.controls}>
        <GradientButton 
          title="Till menyn" 
          onPress={() => navigation.goBack()} 
          theme="blue" 
          style={styles.goBackButton}
          textStyle={styles.goBackButtonText}
        />
        <GradientButton 
          title={isCountdownComplete ? "Starta om" : "REDO!"} 
          onPress={resetGame} 
          theme="green" 
          style={styles.playButton}
          textStyle={styles.playButtonText}
        />
      </View>
      <View style={styles.controls}>
        <TouchableOpacity 
          style={[styles.levelButton, currentLevelId <= 1 && styles.disabledButton]} 
          onPress={previousLevel}
          disabled={currentLevelId <= 1}
        >
          <Text style={styles.levelButtonText}>
            <Ionicons name="arrow-back" size={18} color="white" />  Förra
          </Text>
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity style={styles.statsButton} onPress={handleGoToMazeStats}>
          <Ionicons name="stats-chart-outline" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity
          style={[styles.levelButton, !completedLevels.has(currentLevelId) && styles.disabledButton]}
          onPress={nextLevel}
          disabled={!completedLevels.has(currentLevelId)}
        >
          <Text style={styles.levelButtonText}>
            Nästa  <Ionicons name="arrow-forward" size={18} color="white"/>
          </Text>
        </TouchableOpacity>
      </View>

      <CountdownAnimation 
        isVisible={showCountdown} 
        onComplete={handleCountdownComplete}
        volume={0.1}
      />
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
  gameContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  maze: {
    width: MAZE_SIZE,
    height: MAZE_SIZE,
    backgroundColor: '#f0f0f0ff',
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
    marginTop: 5,
    justifyContent: 'center',
    flexDirection: 'row',
    width: '77%',
  },
  playButton: {
    marginTop: 5,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    width: 170,
    alignItems: 'center',
  },
  playButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  goBackButton: {
    marginTop: 5,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    width: 170,
  },
  goBackButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stats: {
    marginTop: 30,
    alignItems: 'center',
    flexDirection: 'row',
    width: '76%',
  },
  statsText: {
    fontSize: 16,
    color: '#bbb',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  gameTimer: {
    marginTop: 6,
    alignItems: 'center',
    flexDirection: 'row',
    width: '76%',
  },
  gameTimerText: {
    fontSize: 16,
    color: '#bbb',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  separator: {
    flex:1,
  },
  levelButton: {
    backgroundColor: '#3d3d3dff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 5,
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
  level: {
    marginTop: 10,
    alignItems: 'center',
  },
  levelText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#eee',
    marginBottom: -30,
  },
  statsButton: {
    backgroundColor: '#3894d1ff',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 12,
  },
});