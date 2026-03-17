import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { View } from "react-native";
import { Home, Search, Library } from "lucide-react-native";
import MiniPlayer from "../components/MiniPlayer";

import HomeScreen from "../screens/HomeScreen";
import SearchScreen from "../screens/SearchScreen";
import LibraryScreen from "../screens/LibraryScreen";
import PlayerScreen from "../screens/PlayerScreen";
import SplashScreen from "../screens/SplashScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const COLORS = {
  primary: "#FF4500",
  inactive: "#555",
  tabBar: "#121212",
};

function Tabs({ navigation }) {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: COLORS.tabBar,
            borderTopColor: "#1A1A1A",
            height: 65,
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.inactive,
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color }) => <Home color={color} size={24} />,
          }}
        />
        <Tab.Screen
          name="Search"
          component={SearchScreen}
          options={{
            tabBarIcon: ({ color }) => <Search color={color} size={24} />,
          }}
        />
        <Tab.Screen
          name="Library"
          component={LibraryScreen}
          options={{
            tabBarIcon: ({ color }) => <Library color={color} size={24} />,
          }}
        />
      </Tab.Navigator>
      <MiniPlayer navigation={navigation} />
    </View>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0E0C0B" },
        }}
      >
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ animation: "none" }}
        />
        <Stack.Screen name="Main" component={Tabs} />
        <Stack.Screen
          name="Player"
          component={PlayerScreen}
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
