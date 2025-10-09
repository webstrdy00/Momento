import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { LinearGradient } from "expo-linear-gradient"
import { COLORS } from "../constants/colors"
import MovieCard from "../components/MovieCard"
import StatCard from "../components/StatCard"
import type { RootStackParamList } from "../types"

const { width } = Dimensions.get("window")

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>()

  const currentMovie = {
    id: 1,
    title: "오펜하이머",
    poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    progress: 0,
    totalPages: 180,
  }

  const watchlistMovies = [
    { id: 2, title: "기생충", poster: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg" },
    { id: 3, title: "인터스텔라", poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg" },
    { id: 4, title: "타이타닉", poster: "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg" },
  ]

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>어서오세요 :)</Text>
          <Text style={styles.subtitle}>오늘은 무슨 영화를 보셨나요?</Text>
        </View>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color={COLORS.lightGray} />
        </TouchableOpacity>
      </View>

      {/* Current Movie Card */}
      <TouchableOpacity
        style={styles.currentMovieCard}
        onPress={() => navigation.navigate("MovieDetail", { id: currentMovie.id })}
      >
        <LinearGradient colors={[COLORS.deepGray, COLORS.darkNavy]} style={styles.currentMovieGradient}>
          <View style={styles.currentMovieContent}>
            <Image source={{ uri: currentMovie.poster }} style={styles.currentMoviePoster} />
            <View style={styles.currentMovieInfo}>
              <Text style={styles.currentMovieLabel}>현재 보고 있는 영화</Text>
              <Text style={styles.currentMovieTitle}>{currentMovie.title}</Text>
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                  {currentMovie.progress}분 / {currentMovie.totalPages}분
                </Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${(currentMovie.progress / currentMovie.totalPages) * 100}%` },
                    ]}
                  />
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <StatCard
          title="연속 기록"
          value="22일째"
          icon="calendar-outline"
          color={COLORS.gold}
        />
        <StatCard
          title="이번 달"
          value="12편"
          icon="film-outline"
          color={COLORS.gold}
        />
        <StatCard
          title="평균 별점"
          value="4.2"
          icon="star-outline"
          color={COLORS.gold}
        />
      </View>

      {/* Watchlist Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>보고 싶은 영화</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>더 보기</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.movieList}>
          {watchlistMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={{ ...movie, status: "wishlist" as const }}
              onPress={() => navigation.navigate("MovieDetail", { id: movie.id })}
            />
          ))}
        </ScrollView>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>빠른 액션</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="add-circle-outline" size={32} color={COLORS.gold} />
            <Text style={styles.actionText}>영화 추가</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="search-outline" size={32} color={COLORS.gold} />
            <Text style={styles.actionText}>영화 검색</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.darkNavy,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.lightGray,
  },
  settingsButton: {
    padding: 8,
  },
  currentMovieCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    overflow: "hidden",
  },
  currentMovieGradient: {
    padding: 20,
  },
  currentMovieContent: {
    flexDirection: "row",
  },
  currentMoviePoster: {
    width: 80,
    height: 120,
    borderRadius: 8,
  },
  currentMovieInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: "center",
  },
  currentMovieLabel: {
    fontSize: 12,
    color: COLORS.gold,
    marginBottom: 4,
    fontWeight: "600",
  },
  currentMovieTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 12,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.lightGray,
    marginBottom: 6,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.darkNavy,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.gold,
  },
  statsSection: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.white,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.gold,
  },
  movieList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.deepGray,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  actionText: {
    fontSize: 14,
    color: COLORS.white,
    marginTop: 8,
    fontWeight: "500",
  },
  bottomPadding: {
    height: 20,
  },
})
