import { useEffect, useState } from "react";
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MazeRenderer } from "../../components/maze-renderer";
import { getCurrentLevel } from "../../data/maze-layouts";
import { getDefaultPet } from '../../data/pets';
import { GyroMode } from "../../hooks/useGameSensors";
import { CompletionRecord, ScoreManager } from "../../utils/score-manager";
import { GameStatsScreenProps } from "../_layout";

const MAZE_SIZE = 300;
const WALL_CELL = 1;
const GOAL_CELL = 2;
const DANGER_CELL = 3;
const SNACK_CELL = 4;

export default function MazeStatisticsScreen({ route, navigation }: GameStatsScreenProps) {
  const eatenSnacks = new Set<string>();
  const currentPet = route.params?.currentPet || getDefaultPet();
  const levelId = route.params?.levelId || 1;
  const currentLevel = getCurrentLevel(levelId);
  const currentGyroMode = route.params?.gyroMode || GyroMode.NORMAL;
  const MAZE_LAYOUT = currentLevel.layout;
  const CELL_SIZE = MAZE_SIZE / MAZE_LAYOUT.length;
  
  const [normalResults, setNormalResults] = useState<CompletionRecord[]>([]);
  const [chaosResults, setChaosResults] = useState<CompletionRecord[]>([]);
  const [currentPetNormalResults, setCurrentPetNormalResults] = useState<CompletionRecord[]>([]);
  const [currentPetChaosResults, setCurrentPetChaosResults] = useState<CompletionRecord[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const normalTop = await ScoreManager.getTopCompletions(levelId, 10, 'normal');
      const chaosTop = await ScoreManager.getTopCompletions(levelId, 10, 'chaos');
      const petNormal = await ScoreManager.getPetCompletions(levelId, currentPet.id, 'normal');
      const petChaos = await ScoreManager.getPetCompletions(levelId, currentPet.id, 'chaos');
      
      setNormalResults(normalTop);
      setChaosResults(chaosTop);
      setCurrentPetNormalResults(petNormal);
      setCurrentPetChaosResults(petChaos);
    };
    loadData();
  }, [levelId, currentPet.id]);
  
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
  
  const renderLeaderboardItem = ({ item, index }: { item: CompletionRecord, index: number }) => (
    <View style={styles.leaderboardItem}>
      <Text style={styles.rank}>#{index + 1}</Text>
      <Text style={styles.petInfo}>{item.petName} {item.petEmoji}</Text>
      <Text style={styles.time}>{formatTime(item.completionTime)}</Text>
    </View>
  );

  const renderPetStats = (mode: GyroMode, results: CompletionRecord[], label: string) => (
  <Text style={styles.totalStats}>
    {currentGyroMode === mode && currentPet.emoji} {label}: 👑{results.length} 💀{results.reduce((sum, r) => sum + r.deaths, 0)}
  </Text>
);

  const formatTime = (timeValue: number): string => {
    const seconds = timeValue > 1000 ? timeValue / 1000 : timeValue;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const hundredths = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}:${hundredths.toString().padStart(2, '0')}`;
  };

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
        </View>
      </View>

      <View style={styles.statsTable}>
        <View style={styles.statsHeader}>
          <Text style={styles.statsEmojiHeader}></Text>
          <Text style={styles.statsGyroHeaderText}>   Gyro</Text>
          <Text style={styles.statsHeaderText}>👑</Text>
          <Text style={styles.statsHeaderText}>💀</Text>
        </View>
        
        <View style={styles.statsRow}>
          <Text style={styles.statsEmojiText}>
            {currentGyroMode === GyroMode.NORMAL ? currentPet.emoji : ''}
          </Text>
          <Text style={styles.statsModeText}>Normal</Text>
          <Text style={styles.statsValueText}>
            {currentPetNormalResults.length}
          </Text>
          <Text style={styles.statsValueText}>
            {currentPetNormalResults.reduce((sum, r) => sum + r.deaths, 0)}
          </Text>
        </View>
        
        <View style={styles.statsRow}>
          <Text style={styles.statsEmojiText}>
            {currentGyroMode === GyroMode.CHAOS ? currentPet.emoji : ''}
          </Text>
          <Text style={styles.statsModeText}>Kaos</Text>
          <Text style={styles.statsValueText}>
            {currentPetChaosResults.length}
          </Text>
          <Text style={styles.statsValueText}>
            {currentPetChaosResults.reduce((sum, r) => sum + r.deaths, 0)}
          </Text>
        </View>
      </View>
      
      {renderLeaderboard(normalResults, "Topp 10 - Normal", currentGyroMode === GyroMode.NORMAL)}
      {renderLeaderboard(chaosResults, "Topp 10 - Kaos", currentGyroMode === GyroMode.CHAOS)}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.goToStartMenuButton} onPress={() => navigation.goBack()}>
          <Text style={styles.goToStartMenuText}>Tillbaka till spelet</Text>
        </TouchableOpacity>
      </View>
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
  maze: {
    width: MAZE_SIZE,
    height: MAZE_SIZE,
    backgroundColor: '#f0f0f0',
    position: 'relative',
    borderRadius: 5,
  },
  goToStartMenuButton: {
    backgroundColor: '#45da9cff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    width: '90%',
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
    padding: 15,
    borderRadius: 10,
    width: '87%',
    alignItems: 'center',
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3894d1ff',
    textAlign: 'center',
    marginBottom: 10,
  },
  leaderboardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#3a3a3a',
    borderRadius: 5,
    marginBottom: 5,
    width: '100%',
  },
  rank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3894d1ff',
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
    color: '#3894d1ff',
  },
  stats: {
    fontSize: 12,
    color: '#bbb',
    width: 100,
    textAlign: 'right',
  },
  noResults: {
    textAlign: 'center',
    color: '#bbb',
    fontStyle: 'italic',
  },
  totals: {
    alignItems: 'center',
    marginVertical: 15,
  },
  totalStats: {
    fontSize: 16,
    color: '#eee',
    fontWeight: 'bold',
  },
    currentModeContainer: {
    borderWidth: 2,
    borderColor: '#45da9cff',
  },
  currentModeTitle: {
    color: '#45da9cff',
  },
  statsTable: {
  borderRadius: 8,
  margin: 15,
  padding: 10,
  width: '87%',
  alignSelf: 'center',
  },
  statsHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#45da9cff',
    paddingBottom: 8,
    marginBottom: 8,
  },
  statsHeaderText: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#45da9cff',
    textAlign: 'center',
  },
    statsGyroHeaderText: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#45da9cff',
    textAlign: 'left',
  },
  statsRow: {
    flexDirection: 'row',
    paddingVertical: 6,
  },
  statsEmojiText: {
    width: 30,
    fontSize: 16,
    textAlign: 'center',
  },
  statsModeText: {
    flex: 1,
    fontSize: 16,
    color: '#eee',
    textAlign: 'left',
    paddingLeft: 10,
  },
  statsValueText: {
    flex: 1,
    fontSize: 16,
    color: '#eee',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  statsEmojiHeader: {
    width: 30,
    fontSize: 14,
    textAlign: 'center',
  },
});