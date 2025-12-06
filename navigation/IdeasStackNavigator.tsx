import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import IdeasScreen from "@/screens/IdeasScreen";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

export type IdeasStackParamList = {
  Ideas: undefined;
};

const Stack = createNativeStackNavigator<IdeasStackParamList>();

export default function IdeasStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Stack.Screen
        name="Ideas"
        component={IdeasScreen}
        options={{
          headerTitle: "Idées de Contenu",
        }}
      />
    </Stack.Navigator>
  );
}
