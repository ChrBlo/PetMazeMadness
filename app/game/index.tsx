import { Text, View, StyleSheet } from "react-native";

export default function GameScreen() {

  return (
    <View style={styles.container}>
      <Text>
        HÄR KOMMER SPELET!
      </Text>
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
});