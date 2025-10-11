import { useState, useMemo, useCallback, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { COLORS } from "../constants/colors"
import MovieCard from "../components/MovieCard"
import FilterChip from "../components/FilterChip"
import type { RootStackParamList, MovieStatus } from "../types"

type MoviesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>

export default function MoviesScreen() {
  const navigation = useNavigation<MoviesScreenNavigationProp>()
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<"all" | MovieStatus>("all")

  // Debounce search query (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const movies = [
    {
      id: 1,
      title: "오펜하이머",
      poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
      rating: 4.5,
      status: "watching",
    },
    {
      id: 2,
      title: "기생충",
      poster: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
      rating: 5,
      status: "completed",
    },
    {
      id: 3,
      title: "인터스텔라",
      poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
      rating: 4.8,
      status: "completed",
    },
    {
      id: 4,
      title: "타이타닉",
      poster: "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
      rating: 4.2,
      status: "watchlist",
    },
    {
      id: 5,
      title: "라라랜드",
      poster: "https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg",
      rating: 4.6,
      status: "completed",
    },
    {
      id: 6,
      title: "듄: 파트2",
      poster: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
      rating: 0,
      status: "watchlist",
    },
  ]

  const filters = [
    { id: "all", label: "전체" },
    { id: "watching", label: "보는 중" },
    { id: "completed", label: "완료" },
    { id: "watchlist", label: "보고 싶은" },
  ]

  // Filter and search logic
  const filteredMovies = useMemo(() => {
    let result = movies

    // Apply status filter
    if (selectedFilter !== "all") {
      result = result.filter((movie) => movie.status === selectedFilter)
    }

    // Apply search filter (debounced)
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase().trim()
      result = result.filter((movie) => movie.title.toLowerCase().includes(query))
    }

    return result
  }, [movies, selectedFilter, debouncedSearchQuery])

  const renderMovieCard = useCallback(
    ({ item }: { item: typeof movies[0] }) => (
      <View style={styles.movieCardWrapper}>
        <MovieCard
          movie={item}
          onPress={() => navigation.navigate("MovieDetail", { id: item.id })}
          showRating={true}
        />
      </View>
    ),
    [navigation]
  )

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>내 영화</Text>
        <TouchableOpacity onPress={() => navigation.navigate("MovieSearch")}>
          <Ionicons name="add-circle" size={28} color={COLORS.gold} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.lightGray} />
        <TextInput
          style={styles.searchInput}
          placeholder="영화 검색..."
          placeholderTextColor={COLORS.lightGray}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContainer}>
        {filters.map((filter) => (
          <FilterChip
            key={filter.id}
            label={filter.label}
            isActive={selectedFilter === filter.id}
            onPress={() => setSelectedFilter(filter.id)}
          />
        ))}
      </ScrollView>

      {/* Movies Grid */}
      <FlatList
        data={filteredMovies}
        renderItem={renderMovieCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.moviesGrid}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="film-outline" size={64} color={COLORS.lightGray} />
            <Text style={styles.emptyTitle}>영화를 찾을 수 없습니다</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? "다른 검색어를 시도해보세요" : "필터를 변경해보세요"}
            </Text>
          </View>
        }
      />
    </View>
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
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.white,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.deepGray,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    color: COLORS.white,
    fontSize: 15,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  moviesGrid: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  movieCardWrapper: {
    flex: 1,
    margin: 6,
    maxWidth: "48%",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.white,
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.lightGray,
    textAlign: "center",
  },
})
