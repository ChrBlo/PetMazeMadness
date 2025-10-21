import { useFocusEffect } from "@react-navigation/native";
import { Image } from 'expo-image';
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, StatusBar, StyleSheet, Text, View } from "react-native";
import { GradientButton } from "../components/gradient-button";
import { getDefaultPet } from '../data/pets';
import { GyroMode } from '../hooks/useGameSensors';
import { CRUDManager } from "../utils/CRUD-manager";
import { ScoreManager } from "../utils/score-manager";
import { StartScreenProps } from './root-layout';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../components/language-switcher';

export default function StartScreen({ route, navigation }: StartScreenProps) {
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(false);
  const [savedPet, setSavedPet] = useState(getDefaultPet());
  const selectedPet = route.params?.selectedPet || savedPet;
  const petEmoji = selectedPet.emoji || getDefaultPet().emoji;
  const [currentLevel, setCurrentLevel] = useState(1);
  const [invertedGameControls, setInvertedGameControls] = useState(false);

  // TA FRAM FÖR ATT RENSA SIMPLE STORAGE
  // useEffect(() => {
  //   const clearData = async () => {
  //     await ScoreManager.clearAllData();
  //   };
  //   clearData();
  // }, []);
  
  useFocusEffect(
    useCallback(() => {
      if (route.params?.invertedGameControls !== undefined) {
        setInvertedGameControls(route.params.invertedGameControls);
      }
    }, [route.params?.invertedGameControls])
  );
  
  useEffect(() => {
    const loadSavedPet = async () => {
      const pet = await CRUDManager.getSelectedPet();
      if (pet) {
        setSavedPet(pet);
      }
    };
    loadSavedPet();
  }, []);

  useEffect(() => {
    const loadStartLevel = async () => {
      const level = await ScoreManager.getStartLevel();
      setCurrentLevel(level);
    };
    loadStartLevel();
  }, []);

  const handleStartGame = () => {
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('Game', {
        selectedPet,
        gyroMode: route.params?.gyroMode || GyroMode.NORMAL,
        initialLevel: currentLevel,
        invertedGameControls: invertedGameControls,
      });
    }, 600);
  };

  const handleGoToSettings = () => {
    navigation.navigate('Settings', {
      selectedPet,
      gyroMode: route.params?.gyroMode || GyroMode.NORMAL,
      invertedGameControls
    });
  };

  const handleGoToMazeStats = () => {
    navigation.navigate('GameStats', {
      levelId: currentLevel || 1,
      currentPet: selectedPet,
      gyroMode: route.params?.gyroMode || GyroMode.NORMAL,
    });
  };
    
  return (
    <View style={styles.container}>

      <View style={styles.languageSwitchContainer}>
        <LanguageSwitcher />
      </View>
      
      <Image style={styles.logo} source={require('../assets/images/gamelogo.png')}/>
      <Text style={styles.description}>
        {t('start.description')}
      </Text>
      <Text style={styles.instructions}>
        {t('start.instructions')}
      </Text>
      
      <GradientButton 
        titleKey="start.settingsButtonLabel"
        onPress={handleGoToSettings} 
        theme="blue" 
        style={styles.settingsButton}
        textStyle={styles.settingsButtonText}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#45da9cff" style={styles.loadingIndicator} />
          <Text style={styles.loadingText}>{t('start.loadingText')}</Text>
        </View>
      ) : (
        <GradientButton 
        titleKey="start.starButtonLabel"
        onPress={handleStartGame} 
        theme="green" 
        style={styles.startButton}
        textStyle={styles.startButtonText}
        />
      )}
      <View style={styles.statsButton}>
        <GradientButton
          theme="beige"
          onPress={handleGoToMazeStats}
          iconName="stats-chart-outline"
        />
      </View>

      <StatusBar barStyle="default"/>
    </View>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: 20,
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
    paddingVertical: 15,
    borderRadius: 12,
    width: '80%',
  },
  startButtonText: {
    color: '#ffffffff',
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  settingsButton: {
    paddingVertical: 12,
    borderRadius: 12,
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
  },
  loadingIndicator: {
    marginTop: 8,
  },
  loadingText: {
    color: '#fcfcfc',
    fontSize: 16,
    marginTop: 8,
    marginBottom: 10,
  },
  logo: {
    marginTop: -50,
    height: 320,
    resizeMode: 'contain',
    width: '80%',
  },
  statsButton: {
    alignSelf: 'flex-start',
    marginLeft: '10%',
    marginTop: 10,
  },
  languageSwitchContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    alignItems: 'center',
    backgroundColor: '#221c17ff',
    zIndex: 1000,
    elevation: 10,
  },
});