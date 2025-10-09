import { StatusBar } from "expo-status-bar"
import { NavigationContainer } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { Ionicons } from "@expo/vector-icons"

// Screens
import HomeScreen from "./src/screens/HomeScreen"
import MoviesScreen from "./src/screens/MoviesScreen"
import StatsScreen from "./src/screens/StatsScreen"
import ProfileScreen from "./src/screens/ProfileScreen"
import MovieDetailScreen from "./src/screens/MovieDetailScreen"
import MovieSearchScreen from "./src/screens/MovieSearchScreen"
import CollectionDetailScreen from "./src/screens/CollectionDetailScreen"

// Types
import type { RootStackParamList, TabParamList } from "./src/types"

// Colors
import { COLORS } from "./src/constants/colors"

const Tab = createBottomTabNavigator<TabParamList>()
const Stack = createNativeStackNavigator<RootStackParamList>()

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.deepGray,
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.gold,
        tabBarInactiveTintColor: COLORS.lightGray,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "홈",
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Movies"
        component={MoviesScreen}
        options={{
          tabBarLabel: "영화",
          tabBarIcon: ({ color, size }) => <Ionicons name="film" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          tabBarLabel: "통계",
          tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "프로필",
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.darkNavy,
          },
          headerTintColor: COLORS.white,
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        <Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="MovieDetail" component={MovieDetailScreen} options={{ title: "영화 상세" }} />
        <Stack.Screen
          name="MovieSearch"
          component={MovieSearchScreen}
          options={{
            headerShown: false,
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="CollectionDetail"
          component={CollectionDetailScreen}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
