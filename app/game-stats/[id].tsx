import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MazeRenderer } from "../../components/maze-renderer";
import { getCurrentLevel } from '../../data/maze-layouts';
import { CompletionRecord, ScoreManager } from "../../utils/score-manager";

const MAZE_SIZE = 300;
const WALL_CELL = 1;
const GOAL_CELL = 2;
const DANGER_CELL = 3;
const SNACK_CELL = 4;

export default function MazeStatisticsScreen({ route }: { route: any }) {
  const navigation = useNavigation<any>();
  const levelId = route.params?.levelId || 1;
  const currentLevel = getCurrentLevel(levelId);
  const MAZE_LAYOUT = currentLevel.layout;
  const CELL_SIZE = MAZE_SIZE / MAZE_LAYOUT.length;
  const eatenSnacks = new Set<string>();
  const [topResults, setTopResults] = useState<CompletionRecord[]>([]);
  
   useEffect(() => {
    const loadLeaderboard = async () => {
      const results = await ScoreManager.getTopCompletions(levelId, 10);
      setTopResults(results);
    };
    loadLeaderboard();
   }, [levelId]);
  
  const totalDeaths = topResults.reduce((sum, result) => sum + result.deaths, 0);
  const totalCompletions = topResults.length;
  const totalAttempts = topResults.reduce((sum, result) => sum + result.attempts, 0);
  
  const renderLeaderboardItem = ({ item, index }: { item: CompletionRecord, index: number }) => (
    <View style={styles.leaderboardItem}>
      <Text style={styles.rank}>#{index + 1}</Text>
      <Text style={styles.petInfo}>{item.petName} {item.petEmoji}</Text>
      <Text style={styles.time}>{formatTime(item.completionTime)}</Text>
    </View>
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

        <View style={styles.totals}>
          <Text style={styles.totalStats}>
            Totalt  👑:{totalCompletions}  |  💀:{totalDeaths}  |  💪: {totalAttempts}
          </Text>
        </View>
        
        <View style={styles.leaderboardContainer}>
        <Text style={styles.leaderboardTitle}>Topp 10</Text>
        {topResults.length > 0 ? (
          <FlatList
            data={topResults}
            renderItem={renderLeaderboardItem}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
          />
        ) : (
          <Text style={styles.noResults}>Inga resultat än</Text>
        )}

      </View>
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
    paddingBottom: 50,
    
  },
  level: {
    alignItems: 'center',
    marginTop: 80,
    marginBottom: 20,
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
    marginBottom: 12,
    width: '76%',
  },
  goToStartMenuText: {
    color: '#ffffffff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  leaderboardContainer: {
    margin: 20,
    padding: 15,
    borderRadius: 10,
    width: '87%',
    alignItems: 'center',
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#45da9cff',
    textAlign: 'center',
    marginBottom: 15,
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
    color: '#45da9cff',
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
    color: '#45da9cff',
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
});