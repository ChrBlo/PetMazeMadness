import Feather from '@expo/vector-icons/Feather';
import { BlurView } from 'expo-blur';
import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GradientButton } from "../../components/gradient-button";
import { MazeRenderer } from "../../components/maze-renderer";
import PetImage from "../../components/pet-image";
import { getCurrentLevel, MAZE_LEVELS } from "../../data/maze-layouts";
import { getDefaultPet, getPetById } from '../../data/pets';
import { GyroMode } from "../../hooks/useGameSensors";
import { formatTime } from "../../utils/game-helpers";
import { CompletionRecord, ScoreManager } from "../../utils/score-manager";
import { typography } from "../../utils/typography";
import { GameStatsScreenProps } from "../root-layout";
import { DarkMazeOverlay } from '../../components/dark-maze-overlay';

const WALL_CELL = 1;
const GOAL_CELL = 2;
const DANGER_CELL = 3;
const SNACK_CELL = 4;
const SECRET_WALL_CELL = 5;
const SECRET_SNACK_CELL = 6;
const GHOUL_TRIGGER = 7;
const MAZE_SIZE = 300;
const BALL_SIZE = 20;

export default function MazeStatisticsScreen({ route, navigation }: GameStatsScreenProps) {
  const { t } = useTranslation();

  const eatenSnacks = new Set<string>();
  const currentPet = route.params?.currentPet || getDefaultPet();
  const levelId = route.params?.levelId || 1;
  const currentGyroMode = route.params?.gyroMode || GyroMode.NORMAL;
  
  const [normalResults, setNormalResults] = useState<CompletionRecord[]>([]);
  const [chaosResults, setChaosResults] = useState<CompletionRecord[]>([]);
  const [currentPetNormalResults, setCurrentPetNormalResults] = useState<CompletionRecord[]>([]);
  const [currentPetChaosResults, setCurrentPetChaosResults] = useState<CompletionRecord[]>([]);
  const [currentLevelId, setCurrentLevelId] = useState(levelId);
  const maxLevel = MAZE_LEVELS.length;

  const currentLevel = getCurrentLevel(currentLevelId);
  const MAZE_LAYOUT = currentLevel.layout;
  const CELL_SIZE = MAZE_SIZE / MAZE_LAYOUT.length;
  const [completedLevels, setCompletedLevels] = useState<Set<number>>(new Set());

  // const enemyPositions = currentLevel.enemies?.map(enemy => ({
  //   id: enemy.id,
  //   x: enemy.path[0].x * CELL_SIZE + CELL_SIZE / 2,
  //   y: enemy.path[0].y * CELL_SIZE + CELL_SIZE / 2
  // })) || [];

  useEffect(() => {
    const loadData = async () => {
      const normalTop = await ScoreManager.getTopCompletions(currentLevelId, 10, 'normal');
      const chaosTop = await ScoreManager.getTopCompletions(currentLevelId, 10, 'chaos');
      const petNormal = await ScoreManager.getPetCompletions(currentLevelId, currentPet.id, 'normal');
      const petChaos = await ScoreManager.getPetCompletions(currentLevelId, currentPet.id, 'chaos');

      setNormalResults(normalTop);
      setChaosResults(chaosTop);
      setCurrentPetNormalResults(petNormal);
      setCurrentPetChaosResults(petChaos);
    };
    loadData();
  }, [currentLevelId, currentPet.id]);

  useEffect(() => {
    const loadCompletedLevels = async () => {
      const gameProgress = await ScoreManager.getGameProgress();
      setCompletedLevels(new Set(gameProgress.completedLevels));
    };
    loadCompletedLevels();
  }, []);
  
  const renderLeaderboard = (results: CompletionRecord[], title: string, isCurrentMode: boolean) => (
    <View style={[styles.leaderboardContainer, isCurrentMode && styles.currentModeContainer]}>
      <Text style={[styles.leaderboardTitle, isCurrentMode && styles.currentModeTitle]}>
        {title}
      </Text>
      {results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderLeaderboardItem}
          keyExtractor={(item, index) => `${title}-${index}`}
          scrollEnabled={false}
        />
      ) : (
        <Text style={styles.noResults}>{t('statistics.noResults')}</Text>
      )}
    </View>
  );

  const navigateToLevel = (newLevelId: number) => {
    setCurrentLevelId(newLevelId);
  };

  const nextLevel = () => {
    const nextId = Math.min(currentLevelId + 1, maxLevel);
    navigateToLevel(nextId);
  };

  const previousLevel = () => {
    const prevId = Math.max(currentLevelId - 1, 1);
    navigateToLevel(prevId);
  };

  const jump10Forward = () => {
    const newLevelId = Math.min(currentLevelId + 10, maxLevel);
    navigateToLevel(newLevelId);
  };

  const jump10Backward = () => {
    const newLevelId = Math.max(currentLevelId - 10, 1);
    navigateToLevel(newLevelId);
  };
  
  const renderLeaderboardItem = ({ item, index }: { item: CompletionRecord, index: number }) => {
    const pet = getPetById(item.petId);
  
    return (
      <View style={styles.leaderboardItem}>
        <Text style={styles.rank}>#{index + 1}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 8 }}>
          <PetImage source={pet.emoji} size={typography.h4} />
          <Text style={styles.petInfo}>{item.petName}</Text>
        </View>
        {item.extraLivesUsed > 0 && (
          <View style={styles.extraLives}>
            <PetImage source={pet.emoji} size={typography.body} />
            <Text style={styles.extraLivesText}>: {item.extraLivesUsed}</Text>
          </View>
        )}
        <Text style={styles.time}>    {formatTime(item.completionTime)}</Text>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={true}
    >
      <View style={styles.level}>
        <Text style={styles.levelText}>{t('statistics.level')}{currentLevel.name}</Text>
      </View>
            
      <View style={styles.gameContainer}>
        <View style={styles.mazeContainer}>
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
            ghoulTrigger={GHOUL_TRIGGER}
          />

          {/* ENEMIES */}
          {currentLevel.enemies?.map(enemy => (
            <View
              key={enemy.id}
              style={{
                position: 'absolute',
                left: enemy.path[0].x * CELL_SIZE + CELL_SIZE / 2 - BALL_SIZE / 2,
                top: enemy.path[0].y * CELL_SIZE + CELL_SIZE / 2 - BALL_SIZE / 2,
                width: BALL_SIZE,
                height: BALL_SIZE,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PetImage source={currentPet.enemyEmoji} size={20} style={{ marginRight: 4 }} />
            </View>
          ))}

          {/* PET BALL */}
          <View
            style={[
              styles.ball,
              {
                left: currentLevel.startPosition.x * CELL_SIZE + CELL_SIZE / 2 - BALL_SIZE / 2,
                top: currentLevel.startPosition.y * CELL_SIZE + CELL_SIZE / 2 - BALL_SIZE / 2,
              }
            ]}
          >
            <PetImage source={currentPet.emoji} size={16} />
          </View>

          {!completedLevels.has(currentLevelId) && currentLevelId > 1 && (
            <BlurView intensity={90} tint="dark" style={[StyleSheet.absoluteFill, {zIndex:150}]}>
              <View style={styles.lockedOverlay}>
                <Text style={styles.lockedText}>
                  {t('statistics.notCompletedMaze')}
                </Text>
              </View>
            </BlurView>
          )}
              
          {currentLevel.isDark && (
            <DarkMazeOverlay
              mazeWidth={MAZE_SIZE}
              mazeHeight={MAZE_SIZE}
              ballX={currentLevel.startPosition.x * CELL_SIZE + CELL_SIZE / 2}
              ballY={currentLevel.startPosition.y * CELL_SIZE + CELL_SIZE / 2}
              ballSize={BALL_SIZE}
              spotlightMultiplier={4}
              opacity={completedLevels.has(currentLevelId) ? 0.70 : 0.90}
            />
          )}
        </View>
      </View>

      <View style={styles.controls}>

        {/* JUMP 1 LEVEL BACK */}
        <TouchableOpacity 
          style={[styles.levelButton, currentLevelId <= 1 && styles.disabledButton]} 
          onPress={previousLevel}
          disabled={currentLevelId <= 1}
        >
          <View style={styles.buttonContent}>
            <Feather name="chevron-left" size={typography.h3} color="white" />
            <Text style={styles.levelButtonText} numberOfLines={1}>{t('statistics.previousButtonText')} </Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.separator} />

        {/* JUMP 10 LEVELS BACK */}
          <TouchableOpacity 
            style={[styles.jumpButton, currentLevelId <= 1 && styles.disabledButton]} 
            onPress={jump10Backward}
            disabled={currentLevelId <= 1}
          >
            <View style={styles.buttonContent}>
              <Feather name="chevrons-left" size={typography.h4} color="white" />
              <Text style={styles.jumpButtonText}>10 </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.separator} />

          {/* JUMP 10 LEVELS FORWARD */}
          <TouchableOpacity
            style={[styles.jumpButton, currentLevelId >= maxLevel && styles.disabledButton]}
            onPress={jump10Forward}
            disabled={currentLevelId >= maxLevel}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.jumpButtonText}> 10</Text>
              <Feather name="chevrons-right" size={typography.h4} color="white"/>
            </View>
          </TouchableOpacity>
        
        <View style={styles.separator} />

        {/* JUMP 1 LEVEL FORWARD */}
        <TouchableOpacity
          style={[styles.levelButton, currentLevelId >= maxLevel && styles.disabledButton]}
          onPress={nextLevel}
          disabled={currentLevelId >= maxLevel}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.levelButtonText} numberOfLines={1}>{t('statistics.nextButtonText')}</Text>
            <Feather name="chevron-right" size={typography.h3} color="white"/>
          </View>
        </TouchableOpacity>
      </View>
      
      {/* GO BACK BUTTON */}
      <View style={styles.buttonContainer}>
        <GradientButton
          titleKey="statistics.goBackButton"
          onPress={() => navigation.goBack()}
          theme="green"
          style={styles.goToGameButton}
          textStyle={styles.goToStartMenuText}
          />
      </View>
      
      {renderLeaderboard(normalResults, t('statistics.top10NormalLabel'),  currentGyroMode === GyroMode.NORMAL)}
      {renderLeaderboard(chaosResults,  t('statistics.top10ChaosLabel'),  currentGyroMode === GyroMode.CHAOS)}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#221c17ff',
  },
  scrollContent: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  level: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 0,
  },
  levelText: {
    fontSize: typography.h3,
    fontWeight: 'bold',
    color: '#eee',
  },
  gameContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  goToGameButton: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 12,
    width: '90%',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  goToStartMenuText: {
    color: '#ffffffff',
    fontSize: typography.h4,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  leaderboardContainer: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
  },
  leaderboardTitle: {
    fontSize: typography.h5,
    fontWeight: 'bold',
    color: '#5da6d6ff',
    textAlign: 'center',
    marginBottom: 10,
  },
  leaderboardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: '#3a3a3a',
    borderRadius: 5,
    marginBottom: 5,
    width: '100%',
  },
  rank: {
    fontSize: typography.body,
    fontWeight: 'bold',
    color: '#5da6d6ff',
    width: 30,
  },
  petInfo: {
    fontSize: typography.small,
    color: '#eee',
  },
  time: {
    fontSize: typography.small,
    fontWeight: 'bold',
    color: '#5da6d6ff',
  },
  noResults: {
    textAlign: 'center',
    color: '#bbb',
    fontStyle: 'italic',
  },
  currentModeContainer: {
    borderWidth: 2,
    borderColor: '#5ccf9fff',
  },
  currentModeTitle: {
    color: '#5ccf9fff',
  },
  extraLives: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: 50,
  },
  extraLivesText: {
    fontSize: typography.tiny,
    color: '#ff6b6b',
    fontWeight: 'bold',
  },
  controls: {
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
    width: '90%',
  },
  separator: {
    width: 5,
  },
  levelButton: {
    backgroundColor: '#3d3d3dff',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  levelButtonText: {
    color: 'white',
    fontSize: typography.h5,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#666',
    opacity: 0.5,
  },
  mazeContainer: {
    backgroundColor: '#f0f0f0',
    width: MAZE_SIZE,
    height: MAZE_SIZE,
    position: 'relative',
    marginVertical: 20,
  },
  lockedOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  lockedText: {
    color: '#fff',
    fontSize: typography.h4,
    fontWeight: 'bold',
    textAlign: 'center',
    zIndex: 200,
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
  jumpButton: {
    backgroundColor: '#3d3d3dff',
    paddingHorizontal: 2,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  jumpButtonText: {
    color: 'white',
    fontSize: typography.body,
    fontWeight: 'bold',
  },
    buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
