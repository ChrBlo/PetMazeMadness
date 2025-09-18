import { useNavigation } from "@react-navigation/native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function GameScreen() {
  
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <View >
        <Text>
          HÄR KOMMER SPELET!
        </Text>
      </View>
      <View>
        <TouchableOpacity style={styles.goToStartMenuButton} onPress={() => navigation.goBack()}>
          <Text>Till menyn</Text>
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
  goToStartMenuButton: {
    backgroundColor: '#68d86cff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    width: '80%',
  },
});