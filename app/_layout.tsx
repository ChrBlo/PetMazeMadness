import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import StartScreen from "./index";
// import SettingsScreen from "../settings/SettingsScreen";
// import GameScreen from "../game/GameScreen";


const Stack = createNativeStackNavigator();

export default function RootLayout() {
  return (
    <>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Start" component={StartScreen} options={{ title: "Start", headerShown: false }} />
          {/* <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: "Game settings", headerShown: false }} /> */}
          {/* <Stack.Screen name="Game" component={GameScreen} options={{ headerShown: false }} /> */}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}