import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Pet } from "../data/pets";
import { GyroMode } from "../hooks/useGameSensors";
import { initLanguage } from "../i18n/i18n";
import MazeStatisticsScreen from "./game-stats/[id]";
import GameScreen from "./game/index";
import StartScreen from "./index";
import SettingsScreen from "./settings/index";

type RootStackParamList = {
  Start: {
    selectedPet?: Pet;
    gyroMode?: GyroMode;
    invertedGameControls?: boolean;
  };
  Game: {
    gyroMode?: GyroMode;
    selectedPet?: Pet;
    initialLevel?: number;
    invertedGameControls?: boolean;
  };
  Settings: {
    selectedPet?: Pet;
    gyroMode?: GyroMode;
    invertedGameControls?: boolean;
  };
  GameStats: { 
    levelId: number;
    currentPet: Pet;
    gyroMode: GyroMode;
  };
}

export type StartScreenProps = NativeStackScreenProps<RootStackParamList, "Start">;
export type GameScreenProps = NativeStackScreenProps<RootStackParamList, "Game">;
export type SettingsScreenProps = NativeStackScreenProps<RootStackParamList, "Settings">;
export type GameStatsScreenProps = NativeStackScreenProps<RootStackParamList, "GameStats">;

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootLayout() {
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);

  useEffect(() => {
    initLanguage().then(() => {
      setIsI18nInitialized(true);
    });
  }, []);

  if (!isI18nInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#45da9cff" />
      </View>
    );
  }

  return (
    <>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Start" component={StartScreen} options={{ title: "Start", headerShown: false, animation:'slide_from_left'}} />
          <Stack.Screen name="Game" component={GameScreen} options={{ title: "Game", headerShown: false }} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: "Game settings", headerShown: false }} />
          <Stack.Screen name="GameStats" component={MazeStatisticsScreen} options={{ title: "Maze statistics", headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}