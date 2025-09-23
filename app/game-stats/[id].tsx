import { useNavigation } from "@react-navigation/native";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MazeRenderer } from "../../components/maze-renderer";
import { getCurrentLevel } from '../../data/maze-layouts';

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

  return (
    <ScrollView style={styles.container}>

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
          <TouchableOpacity style={styles.goToStartMenuButton} onPress={() => navigation.goBack()}>
            <Text style={styles.goToStartMenuText}>Tillbaka till spelet</Text>
          </TouchableOpacity>
      </View>
      
      <View style={styles.level}>
        <Text style={styles.levelText}>Top 10</Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#221c17ff',
  },
  level: {
    alignItems: 'center',
    marginTop: 70,
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
    marginTop: 30,
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
});