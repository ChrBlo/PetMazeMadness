import { Feather, Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from '@react-navigation/native';
import { useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useAtom, useSetAtom } from 'jotai';
import LottieView from "lottie-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from 'react-i18next';
import { Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { isDeadAtom, isGameWonAtom, recordDeathAtom, recordWinAtom, resetGameStateAtom } from '../../atoms/gameAtoms';
import { CountdownAnimation } from '../../components/countdown-animation';
import { GradientButton } from "../../components/gradient-button";
import { LevelStarsAndBadgeDisplay } from "../../components/level-stars-and-badge-display";
import { MazeRenderer } from "../../components/maze-renderer";
import PetImage from "../../components/pet-image";
import { MAZE_LEVELS, MazeLevel, getCurrentLevel } from '../../data/maze-layouts';
import { DeathIcon, getDefaultPet, getDisplayName } from '../../data/pets';
import { useEnemyMovement } from "../../hooks/useEnemyMovement";
import { useGamePhysics } from '../../hooks/useGamePhysics';
import { GyroMode, useGameSensors } from '../../hooks/useGameSensors';
import { useGameTimer } from '../../hooks/useGameTimer';
import { useLevelData } from "../../hooks/useLevelData";
import { useRespawnLogic } from "../../hooks/useRespawnLogic";
import { CRUDManager } from "../../utils/CRUD-manager";
import { findNearestSafeCell, getMazeCell, getPosition } from "../../utils/game-helpers";
import { LevelStars, ScoreManager } from '../../utils/score-manager';
import { typography } from "../../utils/typography";
import { GameScreenProps } from "../root-layout";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const getResponsiveMazeSize = (layoutSize: number) => {

  const smallestDimension = Math.min(screenWidth, screenHeight);
  const baseSize = Math.floor(smallestDimension * 0.8);

  const multiplier = layoutSize > 10 ? 1.2 : 1;
  const mazeSize = Math.floor(baseSize * multiplier);

  const MIN_SIZE = 300;
  const MAX_SIZE = layoutSize > 10 ? 720 : 600;
  
  return Math.max(MIN_SIZE, Math.min(MAX_SIZE, mazeSize));
};

const WALL_CELL = 1;
const GOAL_CELL = 2;
const DANGER_CELL = 3;
const SNACK_CELL = 4;
const SECRET_WALL_CELL = 5;
const SECRET_SNACK_CELL = 6;

const explodingWallSound = require('../../assets/sounds/explosion.mp3');
const victorySound = require('../../assets/sounds/whopee.mp3');
const snackSound = require('../../assets/sounds/snackSound1.mp3');
const spawnSound = require('../../assets/sounds/plop.mp3');

export default function GameScreen({ route, navigation }: GameScreenProps) {
  const { t } = useTranslation();

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
  const [showCountdown, setShowCountdown] = useState(false);
  const [isCountdownComplete, setIsCountdownComplete] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [showVictoryAnimation, setShowVictoryAnimation] = useState(false);
  const [showGameCompletedAnimation, setShowGameCompletedAnimation] = useState(false);
  const [victoryData, setVictoryData] = useState<{ completionTime: number; isNewRecord: boolean;} | null>(null);
// SCORE AND ATTEMPTS
  const [currentAttempt, setCurrentAttempt] = useState(1);
  const [extraLives, setExtraLives] = useState(0);
  const [extraLivesUsed, setExtraLivesUsed] = useState(0);
  const [isGamePaused, setIsGamePaused] = useState(false);
  const [isRespawning, setIsRespawning] = useState(false);
  const [hasStartedTimer, setHasStartedTimer] = useState(false);
  const isProcessingWin = useRef(false);
  //GAME LEVELS AND POSITIONING
  const [currentLevelId, setCurrentLevelId] = useState(route.params?.initialLevel || 1);
  const [currentLevel, setCurrentLevel] = useState<MazeLevel>(getCurrentLevel(route.params?.initialLevel || 1));
  const [completedLevels, setCompletedLevels] = useState<Set<number>>(new Set());
  const getStartPosition = () => getPosition(currentLevel, MAZE_SIZE);
  // PET
  const selectedPet = route.params?.selectedPet || getDefaultPet();
  const defaultPet = getDefaultPet();
  const petName = getDisplayName(selectedPet) || getDisplayName(defaultPet);
  //SOUND EFFECTS
  const victory = useAudioPlayer(victorySound);
  const explosion = useAudioPlayer(explodingWallSound);
  const snack = useAudioPlayer(snackSound);
  const plop = useAudioPlayer(spawnSound);
  
  const MAZE_SIZE = useMemo(() => getResponsiveMazeSize(currentLevel.layout.length), [currentLevel]);
  const MAZE_LAYOUT = useMemo(() => currentLevel.layout, [currentLevel]);
  const CELL_SIZE = useMemo(() => MAZE_SIZE / MAZE_LAYOUT.length, [MAZE_SIZE, MAZE_LAYOUT]);
  
  // Sizes that depend on MAZE_SIZE
  const BALL_SIZE = useMemo(() => Math.floor(MAZE_SIZE / 15), [MAZE_SIZE]);
  const DEATH_ICON_SIZE = useMemo(() => Math.floor(BALL_SIZE * 0.8), [BALL_SIZE]);
  const ENEMY_SIZE = useMemo(() => Math.floor(BALL_SIZE * 1.2), [BALL_SIZE]);
  const PET_ICON_SIZE = useMemo(() => Math.floor(BALL_SIZE * 0.9), [BALL_SIZE]);
  const HEADER_PET_SIZE = useMemo(() => Math.floor(MAZE_SIZE / 5), [MAZE_SIZE]);
  const LOGO_SCALE_FACTOR = 0.3;
  const LOGO_HEIGHT = useMemo(() => Math.floor(MAZE_SIZE * LOGO_SCALE_FACTOR), [MAZE_SIZE]);
    
  useEffect(() => {
    const loadInitialData = async () => {
      resetGameState();
      
      const progress = await ScoreManager.getGameProgress();
      setCompletedLevels(new Set(progress.completedLevels));
      
      const savedLives = await CRUDManager.getExtraLives();
      setExtraLives(savedLives);
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (isReady)
    {
      setShowCountdown(true);
    }
  }, [isReady]);
  
  useEffect(() => {
    if (isCountdownComplete && !isRespawning && !hasStartedTimer)
    {
      startTimer();
      setHasStartedTimer(true);
    }
  }, [isCountdownComplete]);

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

    if (isRespawning)
    {
      resumeTimer();
      setIsRespawning(false);
      setHasStartedTimer(true);
    }
  };
  
  const handleGoToMazeStats = () => {
    navigation.navigate('GameStats', {
      levelId: currentLevelId,
      currentPet: selectedPet,
      gyroMode: gyroMode
    });
  };

  const checkAndSaveStars = async (completionTime: number) => {
    const totalSnacks = MAZE_LAYOUT.flat().filter(cell => cell === SNACK_CELL).length;
    
    const newStars: LevelStars['stars'] = {
      completedNormalMode: gyroMode === GyroMode.NORMAL,
      completedChaosMode: gyroMode === GyroMode.CHAOS,
      allSnacksEaten: eatenSnacks.size === totalSnacks && totalSnacks > 0,
      underMazeTimeLimit: currentLevel.timeLimit ? completionTime <= currentLevel.timeLimit : false,
      noExtraLivesUsed: extraLivesUsed === 0,
    };
    
  const existingStars = await CRUDManager.getLevelStars(currentLevelId);
    const mergedStars = {
      completedNormalMode: existingStars?.completedNormalMode || newStars.completedNormalMode,
      completedChaosMode: existingStars?.completedChaosMode || newStars.completedChaosMode,
      allSnacksEaten: existingStars?.allSnacksEaten || newStars.allSnacksEaten,
      underMazeTimeLimit: existingStars?.underMazeTimeLimit || newStars.underMazeTimeLimit,
      noExtraLivesUsed: existingStars?.noExtraLivesUsed || newStars.noExtraLivesUsed,
    };
    
    await CRUDManager.saveLevelStars(currentLevelId, mergedStars);
    
    setLevelStarsData(mergedStars);
  };
  
  // CHECK WALL COLLISION
  const checkCollision = (newX: number, newY: number) => {
    const ballRadius = BALL_SIZE / 2;
    
    if (newX - ballRadius < 0 || newX + ballRadius > MAZE_SIZE ||
        newY - ballRadius < 0 || newY + ballRadius > MAZE_SIZE)
    {
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

    for (let point of checkPoints)
    {
      const pCellX = Math.floor(point.x / CELL_SIZE);
      const pCellY = Math.floor(point.y / CELL_SIZE);

      // check if WALL_CELL
      if (getMazeCell(pCellX, pCellY, MAZE_LAYOUT) === WALL_CELL)
      {
        return true;
      }

      // check if DANGER_CELL
      if (getMazeCell(pCellX, pCellY, MAZE_LAYOUT) === DANGER_CELL)
      {
        if (extraLives > 0) {
          setIsRespawning(true);
          triggerRespawn(pCellX, pCellY);

          return false;
        }
        else
        {
          setExplosionPosition({ x: newX, y: newY });
          setShowExplosion(true);
          
          // Record death - Jotai
          recordDeath(currentLevelId).then((updatedStats) => {
            if (updatedStats)
            {
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
    }

    // ENEMY-logic
    for (const enemy of enemyPositions)
    {
      const dx = newX - enemy.x;
      const dy = newY - enemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
        
      if (distance < ballRadius * 2)
      {
        if (extraLives > 0)
        {
            setIsRespawning(true);
            triggerRespawn(cellX, cellY);
            return false;
        }
        else
        {
          setExplosionPosition({ x: newX, y: newY });
          setShowExplosion(true);
          
          recordDeath(currentLevelId).then((updatedStats) => {
            if (updatedStats)
            {
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
    }      

    // check if SNACK_CELL
    if (getMazeCell(cellX, cellY, MAZE_LAYOUT) === SNACK_CELL ||
        getMazeCell(cellX, cellY, MAZE_LAYOUT) === SECRET_SNACK_CELL)
    {
      const snackKey = `${cellY}-${cellX}`;
      const currentEatenSnacks = eatenSnacks;

      if (!currentEatenSnacks.has(snackKey))
      {
        setEatenSnacks(prevEatenSnacks => {
          const newSet = new Set(prevEatenSnacks);
          newSet.add(snackKey);

          CRUDManager.saveEatenSnacks(currentLevelId, Array.from(newSet));

          return newSet;
        });
  
        const newLives = extraLives + 1;
        setExtraLives(newLives);
        CRUDManager.saveExtraLives(newLives);

        snack.seekTo(0);
        snack.play();
      }
    }
    
    // Check if GOAL_CELL
    if (getMazeCell(cellX, cellY, MAZE_LAYOUT) === GOAL_CELL)
    {
      if (isProcessingWin.current) { 
        return false;
      }
      isProcessingWin.current = true;

      const completionTime = stopTimer();
      setCompletedLevels(prev => new Set([...prev, currentLevelId]));

      checkAndSaveStars(completionTime);

      const isLastLevel = currentLevelId === MAZE_LEVELS.length;

      if (isLastLevel)
      {
        setShowGameCompletedAnimation(true);
      }
      else
      {
        setShowVictoryAnimation(true);
      }
      
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
        setVictoryData({
          completionTime,
          isNewRecord: result?.isNewRecord || false
        });
        
        setTimeout(() => {
          setShowVictoryAnimation(false);
          setShowGameCompletedAnimation(false);
      
          ScoreManager.getTopCompletions(currentLevelId, 100).then(completions => {
            const hasNormalComplete = completions.some(c => c.gyroMode === GyroMode.NORMAL.toString());
            const hasKaosComplete = completions.some(c => c.gyroMode === GyroMode.CHAOS.toString());
            setNormalModeCompleted(hasNormalComplete);
            setChaosModeCompleted(hasKaosComplete);
          });
  
          if (isLastLevel) {
            Alert.alert(
              t('gameAlerts.mazeCompleteTitle'),
              t('gameAlerts.gameCompleteMessage', { petName: petName }),
              [{
                text: t('gameAlerts.gameCompleteButtonText'),
                onPress: () => {
                  resetGameState();
                  resetTimer();
                  setCurrentLevelId(1);
                  const level1 = getCurrentLevel(1);
                  setCurrentLevel(level1);
                  setBallPosition(getPosition(level1, MAZE_SIZE));
                  setShowExplosion(false);
                  setVelocity({ x: 0, y: 0 });
                  setExtraLivesUsed(0);
                  setIsReady(false);
                  setIsCountdownComplete(false);
                  setHasStartedTimer(false);
                }
              }]
            );
          }

          else if (result?.isNewRecord) {
            const formattedTime = formatTime(completionTime);
            Alert.alert(
              t('gameAlerts.mazeCompleteTitle'),
              t('gameAlerts.mazeCompleteNewRecordMessage', { time: formattedTime }),
              [
                { text: t('gameAlerts.mazeCompleteButtonCancel'), style: 'cancel' },
                { text: t('gameAlerts.mazeCompleteButtonText'), onPress: nextLevel }
              ]
            );
          }
          else
          {
            Alert.alert(
              t('gameAlerts.mazeCompleteTitle'),
              t('gameAlerts.mazeCompleteMessage', { petName: petName }),
              [
                { text: t('gameAlerts.mazeCompleteButtonCancel'), style: 'cancel' },
                { text: t('gameAlerts.mazeCompleteButtonText'), onPress: nextLevel }
              ]
            );
          }
      
          setVictoryData(null);
        }, 1700);
      });
    }

    return false;
  }

  // POSITION ENEMIES -----------
  const enemyPositions = useEnemyMovement(
    currentLevel.enemies,
    CELL_SIZE,
    !isDead && !isGameWon && isCountdownComplete && !isRespawning
  );

  // RESPAWN LOGIC --------------
  const triggerRespawn = (cellX: number, cellY: number) => {
    const respawnPosition = findSafeRespawnPosition(cellX, cellY, enemyPositions);
    
    if (respawnPosition) {
      setBallPosition({ x: respawnPosition.x, y: respawnPosition.y });
    } else {
      // Fallback to nearest safe cell
      const safeCell = findNearestSafeCell(cellX, cellY, MAZE_LAYOUT);
      if (safeCell) {
        const centeredX = safeCell.x * CELL_SIZE + CELL_SIZE / 2;
        const centeredY = safeCell.y * CELL_SIZE + CELL_SIZE / 2;
        setBallPosition({ x: centeredX, y: centeredY });
      }
    }
    
    resetGameState();
    
    const newLives = extraLives - 1;
    setExtraLives(newLives);
    setExtraLivesUsed(prev => prev + 1);
    CRUDManager.saveExtraLives(newLives);

    pauseTimer();
    
    plop.seekTo(0);
    plop.play();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  // RESET GAME -----------------
  const resetGame = async () => {

    isProcessingWin.current = false;
    
    if (isRespawning)
    {
      resetGameState();
      setIsCountdownComplete(false);
      setIsReady(true);

      return;
    }
    else
    {
      resetGameState();
      resetTimer();
      resetPosition();
      setShowExplosion(false);
      setVelocity({ x: 0, y: 0 });
      setExtraLivesUsed(0);

      clearHistory();
      
      if (extraLives === 0) {
        setEatenSnacks(new Set());
      }
      else
      {
        const savedSnacks = await CRUDManager.getEatenSnacks(currentLevelId);
        setEatenSnacks(new Set(savedSnacks));
      }

      const updatedStats = await ScoreManager.recordAttempt(currentLevelId);
      setLevelStats(updatedStats);
      setCurrentAttempt(updatedStats.totalAttempts + 1);
      
      setIsCountdownComplete(false);
      setIsReady(true);
      setHasStartedTimer(false);
    
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const navigateToLevel = (newLevelId: number) => {
    isProcessingWin.current = false;

    resetGameState();
    resetTimer();
    setShowVictoryAnimation(false);
    
    setCurrentLevelId(newLevelId);
    const newLevel = getCurrentLevel(newLevelId);
    setCurrentLevel(newLevel);
    setBallPosition(getPosition(newLevel, MAZE_SIZE));

    setShowExplosion(false);
    setVelocity({ x: 0, y: 0 });
    setExtraLivesUsed(0);

    clearHistory();

    setIsReady(false);
    setIsCountdownComplete(false);
  };

  // NEXT LEVEL
  const nextLevel = () => {
    const maxLevel = MAZE_LEVELS.length;
    const allCompleted = completedLevels.has(maxLevel);
    
    let nextId;
    if (currentLevelId >= maxLevel)
    {
      nextId = allCompleted ? 1 : maxLevel;
    }
    else
    {
      nextId = currentLevelId + 1;
    }
    
    navigateToLevel(nextId);
  };

  // PREVIOUS LEVEL
  const previousLevel = () => {
    const maxLevel = MAZE_LEVELS.length;
    const allCompleted = completedLevels.has(maxLevel);
    
    let prevId;
    if (currentLevelId <= 1) {

      prevId = allCompleted ? maxLevel : 1;
    } else {
      prevId = currentLevelId - 1;
    }
    
    navigateToLevel(prevId);
  };

  // JUMP 10 FORWARD - stop at max accessible
  const jump10Forward = () => {
    const maxLevel = MAZE_LEVELS.length;
    const newLevelId = Math.min(currentLevelId + 10, maxLevel);
    navigateToLevel(newLevelId);
  };

  // JUMP 10 BACKWARD - stop at level 1
  const jump10Backward = () => {
    const newLevelId = Math.max(currentLevelId - 10, 1);
    navigateToLevel(newLevelId);
  };
  
  // CUSTOM HOOKS ----------------
  const { accelData, gyroData } = useGameSensors(gyroMode);
  
  const { gameTime, startTimer, pauseTimer, resumeTimer, stopTimer, resetTimer } = useGameTimer(!isGameWon && !isDead && !isGamePaused && isCountdownComplete && !isRespawning);

  const { ballPosition, setBallPosition, velocity, setVelocity, resetPosition } = useGamePhysics({
    gyroMode,
    accelData,
    gyroData,
    checkCollision,
    isGameWon,
    isDead: isDead || isGamePaused || !isCountdownComplete || isRespawning, // Pause, countdown & respawn treates as death in gamePhysics
    initialPosition: getStartPosition(),
    inverted: invertedGameControls
  });

  const {
    levelStats,
    levelStarsData,
    eatenSnacks,
    normalModeCompleted,
    chaosModeCompleted,
    setLevelStats,
    setEatenSnacks,
    setLevelStarsData,
    setNormalModeCompleted,
    setChaosModeCompleted } = useLevelData(currentLevelId);
  
  const { 
    recordPosition, 
    findSafeRespawnPosition, 
    clearHistory 
  } = useRespawnLogic(CELL_SIZE, BALL_SIZE);
  //-----------------------------

  useEffect(() => {
    if (isCountdownComplete && !isDead && !isGameWon && !isRespawning) {
      recordPosition(ballPosition.x, ballPosition.y, CELL_SIZE);
    }
  }, [ballPosition, isCountdownComplete, isDead, isGameWon, isRespawning, CELL_SIZE, recordPosition]);
  
  const earnedStars = useMemo(() => {
    if (!levelStarsData) return 0;
    return ScoreManager.countEarnedStars(levelStarsData);
  }, [levelStarsData]);

  const formatTime = (timeMs: number) => `${(timeMs / 1000).toFixed(2)}${t('game.gameTimeUnit')}`;

  const getButtonTitle = () => {
    if (isRespawning) return t('game.gameButtonContinue');
    if (isDead) return t('game.gameButtonRestart');
    if (isCountdownComplete) return t('game.gameButtonRestart');
    return t('game.gameButtonReady');
  };

  const BallComponent = useMemo(() => (
    <View
      style={[
        styles.ball,
        {
          left: ballPosition.x - BALL_SIZE / 2,
          top: ballPosition.y - BALL_SIZE / 2,
          width: BALL_SIZE,
          height: BALL_SIZE,
          borderRadius: BALL_SIZE / 2,
        }
      ]}
    >
      {isDead ? (
        <DeathIcon size={DEATH_ICON_SIZE} />
      ) : (
        <PetImage source={selectedPet.emoji} size={PET_ICON_SIZE} />
      )}
    </View>
  ), [ballPosition.x, ballPosition.y, BALL_SIZE, isDead, DEATH_ICON_SIZE, selectedPet.emoji, PET_ICON_SIZE]);

  const EnemyComponents = useMemo(() => 
    enemyPositions.map(enemy => (
      <View
        key={enemy.id}
        style={[
          styles.enemy,
          {
            left: enemy.x - BALL_SIZE / 2,
            top: enemy.y - BALL_SIZE / 2,
          }
        ]}
      >
        <PetImage 
          source={selectedPet.enemyEmoji || getDefaultPet().enemyEmoji} 
          size={ENEMY_SIZE} 
          style={{ zIndex: 19 }} 
        />
      </View>
    ))
  , [enemyPositions, BALL_SIZE, ENEMY_SIZE, selectedPet.enemyEmoji]);

  const maxLevel = MAZE_LEVELS.length;
  const allCompleted = completedLevels.has(maxLevel);

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <View style={styles.headerImage}>
          <Image 
            style={[styles.logo, { height: LOGO_HEIGHT, maxHeight: 140 }]}
            source={require('../../assets/images/gamelogo.png')} 
          />
        </View>
        
        <View style={styles.headerContent}>
          {!normalModeCompleted && !chaosModeCompleted && earnedStars === 0 ? (
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{t('game.mazeFirstTryTitle', { petName: petName })}</Text>
              <PetImage source={selectedPet.emoji} size={HEADER_PET_SIZE} style={{ marginRight: 7, textAlign: 'center' }} />
            </View>
            ) : (
              <LevelStarsAndBadgeDisplay 
                earnedStars={earnedStars}
                normalModeCompleted={normalModeCompleted}
                chaosModeCompleted={chaosModeCompleted}
              />
          )}
        </View>
      </View>
      
      <View style={styles.stats}>
        <Text style={styles.statsText}>
          {t('game.tryCount')}{levelStats?.totalAttempts || 0}
        </Text>

        <View style={styles.wideSeparator} />

        <View style={styles.level}>
          <Text style={styles.levelText}>{t('game.level')}{currentLevel.name}</Text>
        </View>

        <View style={styles.wideSeparator} />

        <Text style={styles.statsText}>
          {extraLives > 0 && (
            <>
              <PetImage source={selectedPet.emoji} size={typography.h4} style={{ paddingBottom: -6 }} />
              <Text style={styles.statsText}>  : {extraLives}</Text>
            </>
          )}
        </Text>
      </View>
      <View style={styles.gameContainer}>
        <View style={[styles.maze, { width: MAZE_SIZE, height: MAZE_SIZE }]}>
          {/* PET BALL */}
          {BallComponent}

          <MazeRenderer
            mazeLayout={MAZE_LAYOUT}
            cellSize={CELL_SIZE}
            wallCell={WALL_CELL}
            goalCell={GOAL_CELL}
            dangerCell={DANGER_CELL}
            snackCell={SNACK_CELL}
            eatenSnacks={eatenSnacks}
            secretWallCell={SECRET_WALL_CELL}
            secretSnackCell={SECRET_SNACK_CELL}
          />

          {/* ENEMIES */}
          {EnemyComponents}

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
              <Image style={styles.explosionImage} source={require('../../assets/images/explosion.png')} />
            </View>
          )}
        </View>
      </View>

      <View style={styles.gameTimer}>
        <Text style={styles.gameTimerText}>
          {t('game.time')}{`${(gameTime / 1000).toFixed(2)}${t('game.gameTimeUnit')}`}
        </Text>
        <View style={styles.wideSeparator} />
        {levelStats?.bestTime && (
          <Text style={styles.gameTimerText}>
            {t('game.bestTime')}{formatTime(levelStats.bestTime)}
          </Text>
        )}
      </View>

      <View style={styles.controls}>

        <View style={styles.flexButtonWrapper}>
          <GradientButton 
            titleKey="game.gameButtonToMenu"
            onPress={() => navigation.goBack()} 
            theme="darkBlue" 
            style={styles.goBackButton}
            textStyle={styles.goBackButtonText}
          />
        </View>

        <View style={styles.separator} />

        <GradientButton
          theme="darkBeige"
          onPress={handleGoToMazeStats}
          iconName="stats-chart-outline"
          style={styles.statsButton}
        />

        <View style={styles.separator} />
        
        <View style={styles.flexButtonWrapper}>
          <GradientButton 
            title={getButtonTitle()}
            onPress={resetGame} 
            theme="darkGreen" 
            style={styles.playButton}
            textStyle={styles.playButtonText}
          />
        </View>
      </View>

      <View style={styles.navControls}>

        {/* JUMP 1 LEVEL BACK */}
        <TouchableOpacity 
          style={[styles.levelButton, (currentLevelId <= 1 && !allCompleted) && styles.disabledButton]}
          onPress={previousLevel}
          disabled={currentLevelId <= 1 && !allCompleted}
        >
          <View style={styles.buttonContent}>
            <Ionicons name="chevron-back" size={typography.h3} color="white" />
            <Text style={styles.levelButtonText} numberOfLines={1}>{t('game.previousButtonText')}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.separator} />

        {/* JUMP 10 LEVELS BACK */}
        <TouchableOpacity 
          style={[styles.jumpButton, (currentLevelId <= 1 && !allCompleted) && styles.disabledButton]}
          onPress={jump10Backward}
           disabled={currentLevelId <= 1 && !allCompleted}
        >
          <View style={styles.buttonContent}>
            <Feather name="chevrons-left" size={typography.h4} color="white"/>
            <Text style={styles.jumpButtonText}>10 </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.separator} />

        {/* JUMP 10 LEVELS FORWARD */}
        <TouchableOpacity
          style={[styles.jumpButton, (currentLevelId >= maxLevel && !allCompleted) && styles.disabledButton]}
          onPress={jump10Forward}
          disabled={currentLevelId >= maxLevel && !allCompleted}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.jumpButtonText}> 10</Text>
            <Feather name="chevrons-right" size={typography.h4} color="white"/>
          </View>
        </TouchableOpacity>

        <View style={styles.separator} />

        {/* JUMP 1 LEVEL FORWARD */}
        <TouchableOpacity
          style={[styles.levelButton, (currentLevelId >= maxLevel && !allCompleted) && styles.disabledButton]}
          onPress={nextLevel}
          disabled={currentLevelId >= maxLevel && !allCompleted}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.levelButtonText} numberOfLines={1}>{t('game.nextButtonText')}</Text>
            <Ionicons name="chevron-forward" size={typography.h3} color="white"/>
          </View>
        </TouchableOpacity>
      </View>
      
      {/* Confetti animation */}
      {showVictoryAnimation && !showGameCompletedAnimation && (
        <>
          <View style={styles.lottieContainer}>
            <LottieView
              source={require("../../assets/animations/success_confetti.json")}
              autoPlay
              loop={false}
              style={styles.lottieWin}
            />
            <View style={styles.overlay} />
          </View>
        </>
      )}

      {/* Whole game won animation */}
      {showGameCompletedAnimation && (
        <>
          <View style={styles.lottieContainer}>
            <LottieView
              source={require("../../assets/animations/trophy.json")}
              autoPlay
              loop={false}
              style={styles.gameCompleted}
            />
            <View style={styles.overlay} />
          </View>
        </>
      )}

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
    zIndex: -1,
  },
  header: {
    alignItems: 'center',
    width: '80%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  headerImage: {
    width: '40%',
    alignItems: 'flex-start',
    marginLeft: -14,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 25,
    marginBottom: 10,
  },
  logo: {
    resizeMode: 'contain',
    width: '100%',
    transform: [{ rotate: '-15deg' }],
  },
  titleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.h3,
    fontWeight: 'bold',
    color: '#eee',
    textAlign: 'center',
  },
  gameContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  maze: {
    backgroundColor: '#f0f0f0ff',
    position: 'relative',
    borderRadius: 5,
  },
  ball: {
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
    zIndex: 1,
  },
  explosion: {
    position: 'absolute',
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  explosionImage: {
    width: 30,
    height: 30,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
    width: '90%',
    alignItems: 'center',
  },
  navControls: {
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
    width: '90%',
    alignItems: 'center',
  },
  playButton: {
    marginVertical: 5,
    // paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  playButtonText: {
    color: 'white',
    fontSize: typography.h5,
    fontWeight: 'bold',
  },
  statsButton: {
    marginVertical: 5,
    borderRadius: 12,
    alignItems: 'center',
  },
  goBackButton: {
    marginVertical: 5,
    // paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  goBackButtonText: {
    color: 'white',
    fontSize: typography.h5,
    fontWeight: 'bold',
  },
  flexButtonWrapper: {
    flex: 1,
  },
  stats: {
    marginTop: 5,
    alignItems: 'center',
    flexDirection: 'row',
    width: '76%',
  },
  statsText: {
    fontSize: typography.body,
    color: '#bbb',
    fontWeight: 'bold',
    textAlign: 'center',
    // marginBottom: 4,
  },
  gameTimer: {
    marginTop: 4,
    alignItems: 'center',
    flexDirection: 'row',
    width: '76%',
  },
  gameTimerText: {
    fontSize: typography.body,
    color: '#bbb',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  separator: {
    width: 5,
  },
  wideSeparator: {
    flex: 1,
  },
  levelButton: {
    backgroundColor: '#3d3d3dff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  levelButtonText: {
    color: 'white',
    fontSize: typography.body,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#666',
    opacity: 0.5,
  },
  level: {
    // marginTop: 10,
    alignItems: 'center',
  },
  levelText: {
    fontSize: typography.h3,
    fontWeight: 'bold',
    color: '#eee',
    marginBottom: 4,
  },
  lottieContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'auto',
  },
  lottieWin: {
    width: 400,
    height: 400,
    zIndex: 30,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 28,
  },
  gameCompleted: {
    width: 400,
    height: 400,
    zIndex: 30,
  },
  enemy: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  jumpButton: {
    backgroundColor: '#3d3d3dff',
    paddingHorizontal: 2,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jumpButtonText: {
    color: 'white',
    fontSize: typography.body,
    fontWeight: 'bold',
  },
});
