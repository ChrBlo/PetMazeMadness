import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { ActivityIndicator, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function StartScreen() {
  
  const navigation = useNavigation<any>();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartGame = () => {
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('Game');
    }, 800);
  };

  const handleGoToSettings = () => {
    navigation.navigate('Settings');
  };
    
  return (
    <View style={styles.container}>

      <Image style={styles.logo} source={require('../assets/images/gamelogo.png')}/>
      <Text style={styles.description}>
        Hjälp ditt husdjur 🐹 ur laburinten!
      </Text>
      <Text style={styles.instructions}>
        Luta din telefon i alla riktningar för att guida ditt husdjur mot friheten!
      </Text>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#45da9cff" />
          <Text style={styles.loadingText}>Laddar spel...</Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.startButton} onPress={handleStartGame}>
          <Text style={styles.startButtonText}>STARTA</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.settingsButton} onPress={handleGoToSettings}>
        <Ionicons name="settings-outline" size={24} color="white" />
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
    marginBottom: 60,
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
    backgroundColor: '#45da9cff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 12,
    marginTop: 12,
    width: '80%',
  },
  startButtonText: {
    color: '#ffffffff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  settingsButton: {
    backgroundColor: '#4b4b4bff',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 12,
    position: 'absolute',
    bottom: '10%',
    left: '10%',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 0,
  },
  loadingText: {
    color: '#fcfcfc',
    fontSize: 16,
    marginTop: 12,
  },
  logo: {
    marginTop: -50,
    height: 320,
    resizeMode: 'contain',
    marginBottom: 20,
  },
});