import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function StartScreen() {

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🐹 Djur på rymmen</Text>
      <Text style={styles.description}>
        Hjälp ditt husdjur ur laburinten!
      </Text>
      <Text style={styles.instructions}>
        Luta din telefon i alla riktningar för att guida ditt husdjur mot friheten!
      </Text>
      <TouchableOpacity style={styles.startButton}>
        <Text style={styles.startButtonText}>STARTA</Text>
      </TouchableOpacity>
      <StatusBar barStyle="default"/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222120ff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  title: {
    color: '#fcfcfc',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 140,
    textAlign: 'center',
  },
  description: {
    color: '#fcfcfc',
    fontSize: 22,
    marginBottom: 35,
    textAlign: 'center',
  },
  instructions: {
    fontSize: 18,
    color: '#919191ff',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
    width: '90%',
  },
  startButton: {
    backgroundColor: '#68d86cff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    width: '80%',
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});