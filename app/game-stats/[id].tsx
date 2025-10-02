import { Ionicons } from "@expo/vector-icons";
import { BlurView } from 'expo-blur';
import { useEffect, useState } from "react";
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GradientButton } from "../../components/gradient-button";
import { MazeRenderer } from "../../components/maze-renderer";
import { getCurrentLevel, MAZE_LEVELS } from "../../data/maze-layouts";
import { getDefaultPet } from '../../data/pets';
import { GyroMode } from "../../hooks/useGameSensors";
import { formatTime } from "../../utils/game-helpers";
import { CompletionRecord, ScoreManager } from "../../utils/score-manager";
import { GameStatsScreenProps } from "../root-layout";

const MAZE_SIZE = 300;
const WALL_CELL = 1;
const GOAL_CELL = 2;
const DANGER_CELL = 3;
const SNACK_CELL = 4;
const BALL_SIZE = 20;

export default function MazeStatisticsScreen({ route, navigation }: GameStatsScreenProps) {
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
      const gamProgress = await ScoreManager.getGameProgress();
      setCompletedLevels(new Set(gamProgress.completedLevels));
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
        <Text style={styles.noResults}>Inga resultat än</Text>
      )}
    </View>
  );

const nextLevel = () => {
  if (currentLevelId < maxLevel) {
    setCurrentLevelId(currentLevelId + 1);
  }
};

const previousLevel = () => {
  setCurrentLevelId(currentLevelId - 1);
};
  
  const renderLeaderboardItem = ({ item, index }: { item: CompletionRecord, index: number }) => (
    <View style={styles.leaderboardItem}>
      <Text style={styles.rank}>#{index + 1}</Text>
      <Text style={styles.petInfo}>{item.petEmoji} {item.petName}</Text>
      <Text style={styles.extraLives}>
        {item.extraLivesUsed > 0 ? `${item.petEmoji}: ${item.extraLivesUsed}  ` : ``}
      </Text>      
      <Text style={styles.time}>    {formatTime(item.completionTime)}</Text>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={true}
    >
      <View style={styles.level}>
        <Text style={styles.levelText}>{currentLevel.name}</Text>
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
          />

          {!completedLevels.has(currentLevelId) && currentLevelId > 1 && (
            <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill}>
              <View style={styles.lockedOverlay}>
                <Text style={styles.lockedText}>
                  Du har inte klarat denna labyrint ännu!
                </Text>
              </View>
            </BlurView>
          )}
        </View>
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

        <TouchableOpacity
          style={[styles.levelButton, currentLevelId >= maxLevel && styles.disabledButton]}
          onPress={nextLevel}
          disabled={currentLevelId >= maxLevel}
          >
          <Text style={styles.levelButtonText}>
            Nästa  <Ionicons name="arrow-forward" size={18} color="white"/>
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.buttonContainer}>
        <GradientButton
          title="TILLBAKA"
          onPress={() => navigation.goBack()}
          theme="green"
          style={styles.goToGameButton}
          textStyle={styles.goToStartMenuText}
          />
      </View>
          
      {renderLeaderboard(normalResults, "Topp 10 - Normal", currentGyroMode === GyroMode.NORMAL)}
      {renderLeaderboard(chaosResults, "Topp 10 - Kaos", currentGyroMode === GyroMode.CHAOS)}
      
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
    marginBottom: 10,
  },
  levelText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#eee',
  },
  gameContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  goToGameButton: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    width: '100%',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  goToStartMenuText: {
    color: '#ffffffff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  leaderboardContainer: {
    marginTop: 30,
    padding: 15,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
  },
  leaderboardTitle: {
    fontSize: 18,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5da6d6ff',
    width: 30,
  },
  petInfo: {
    fontSize: 14,
    color: '#eee',
    flex: 1,
  },
  time: {
    fontSize: 14,
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
    fontSize: 12,
    color: '#ff6b6b',
    fontWeight: 'bold',
    width: 40,
    textAlign: 'center',
  },
  controls: {
    marginTop: 5,
    justifyContent: 'center',
    flexDirection: 'row',
    width: '80%',
  },
  separator: {
    flex:1,
  },
  levelButton: {
    backgroundColor: '#3d3d3dff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 10,
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
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
