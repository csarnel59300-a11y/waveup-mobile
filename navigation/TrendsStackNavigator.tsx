import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DailyPlanScreen from "@/screens/DailyPlanScreen";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

export type TrendsStackParamList = {
  DailyPlan: undefined;
};

const Stack = createNativeStackNavigator<TrendsStackParamList>();

export default function TrendsStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Stack.Screen
        name="DailyPlan"
        component={DailyPlanScreen}
        options={{
          headerTitle: "Plan du jour - 3 vidéos",
        }}
      />
    </Stack.Navigator>
  );
}
