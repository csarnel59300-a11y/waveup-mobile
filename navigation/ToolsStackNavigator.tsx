import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ToolsScreen from "@/screens/ToolsScreen";

export type ToolsStackParamList = {
  ToolsMain: undefined;
};

const Stack = createNativeStackNavigator<ToolsStackParamList>();

export default function ToolsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ToolsMain" component={ToolsScreen} />
    </Stack.Navigator>
  );
}
