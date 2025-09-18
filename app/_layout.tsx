import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import StartScreen from "./index";
import GameScreen from "./game/index";
// import SettingsScreen from "../settings/SettingsScreen";


const Stack = createNativeStackNavigator();

export default function RootLayout() {
  return (
    <>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Start" component={StartScreen} options={{ title: "Start", headerShown: false }} />
          <Stack.Screen name="Game" component={GameScreen} options={{ title: "Game", headerShown: false }} />
          {/* <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: "Game settings", headerShown: false }} /> */}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}