import { useFocusEffect } from "@react-navigation/native";
import { Image } from 'expo-image';
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, StatusBar, StyleSheet, Text, View } from "react-native";
import { WeatherForecaster } from '../api/weather-forecast';
import { GradientButton } from "../components/gradient-button";
import { getDefaultPet } from '../data/pets';
import { GyroMode } from '../hooks/useGameSensors';
import { ScoreManager } from "../utils/score-manager";
import { StartScreenProps } from './vad-som-helst';

export default function StartScreen({ route, navigation }: StartScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [weatherCheckEnabled, setWeatherCheckEnabled] = useState(true);
  const [currentWeather, setCurrentWeather] = useState<string | null>(null);
  const selectedPet = route.params?.selectedPet || getDefaultPet();
  const petName = selectedPet.name || getDefaultPet().name;
  const petEmoji = selectedPet.emoji || getDefaultPet().emoji;
  const niceWeather = (currentWeather !== 'rain' && currentWeather !== 'rainshowers_day' && currentWeather !== 'thunderstorm');
  const [currentLevel, setCurrentLevel] = useState(1);

  // TODO TA BORT INNAN INLÄMNING, ENBART FÖR ATT RENSA SIMPLE-STORAGE
  // useEffect(() => {
  //   const clearData = async () => {
  //     await ScoreManager.clearAllData();
  //   };
  //   clearData();
  // }, []);
  
  useFocusEffect(
    useCallback(() => {
      if (route.params?.weatherCheckEnabled !== undefined) {
        setWeatherCheckEnabled(route.params.weatherCheckEnabled);
      }
    }, [route.params?.weatherCheckEnabled])
  );

  useEffect(() => {
  const loadStartLevel = async () => {
    const level = await ScoreManager.getStartLevel();
    setCurrentLevel(level);
  };
  loadStartLevel();
}, []);

  const handleStartGame = () => {
    if (weatherCheckEnabled && niceWeather) {
      Alert.alert(
        'Det är fint väder ute!',
        'Ut och lek med dig istället!',
        [
          { text: 'OK, du har rätt!' },
        ]
      );
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('Game', {
        selectedPet,
        gyroMode: route.params?.gyroMode || GyroMode.NORMAL,
        initialLevel: currentLevel,
      });
    }, 800);
  };

  const handleGoToSettings = () => {
    navigation.navigate('Settings', {
      weatherCheckEnabled,
      selectedPet,
      gyroMode: route.params?.gyroMode || GyroMode.NORMAL
    });
  };

  const handleWeatherUpdate = (symbolCode: string | null) => {
    setCurrentWeather(symbolCode);
  };
    
  return (
    <View style={styles.container}>

      <View style={styles.weather}>
        <WeatherForecaster onWeatherUpdate={handleWeatherUpdate} />
      </View>
      
      <Image style={styles.logo} source={require('../assets/images/gamelogo.png')}/>
      <Text style={styles.description}>
        Hjälp {petEmoji} ur labyrinten!
      </Text>
      <Text style={styles.instructions}>
        Luta din telefon i alla riktningar för att guida ditt husdjur mot friheten!
      </Text>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#45da9cff" style={styles.loadingIndicator} />
          <Text style={styles.loadingText}>Laddar spel...</Text>
        </View>
      ) : (
        <GradientButton 
          title="STARTA" 
          onPress={handleStartGame} 
          theme="green" 
          style={styles.startButton}
          textStyle={styles.startButtonText}
        />
      )}

      <GradientButton 
        title="INSTÄLLNINGAR" 
        onPress={handleGoToSettings} 
        theme="blue" 
        style={styles.settingsButton}
        textStyle={styles.settingsButtonText}
      />
      
      <StatusBar barStyle="default"/>
    </View>
  );
}

const styles = StyleSheet.create({
  weather: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  container: {
    flex: 1,
    backgroundColor: '#221c17ff',
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
    marginBottom: 5,
    paddingHorizontal: 20,
    width: '90%',
  },
  startButton: {
    paddingVertical: 20,
    borderRadius: 12,
    marginBottom: 2,
    marginTop: 2,
    width: '80%',
  },
  startButtonText: {
    color: '#ffffffff',
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  settingsButton: {
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 12,
    width: '80%',
  },
  settingsButtonText: {
    color: '#ffffffff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  loadingIndicator: {
    marginTop: 22,
  },
  loadingText: {
    color: '#fcfcfc',
    fontSize: 16,
    marginTop: 10,
    marginBottom: 22,
  },
  logo: {
    marginTop: -50,
    height: 320,
    resizeMode: 'contain',
    marginBottom: 20,
    width: '80%',
  },
});