import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { Pet } from "../data/pets";
import { GyroMode } from "../hooks/useGameSensors";
import MazeStatisticsScreen from "./game-stats/[id]";
import GameScreen from "./game/index";
import StartScreen from "./index";
import SettingsScreen from "./settings/index";

type RootStackParamList = {
  Start: {
    weatherCheckEnabled?: boolean;
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
    weatherCheckEnabled?: boolean;
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