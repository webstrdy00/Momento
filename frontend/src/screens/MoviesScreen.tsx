import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { COLORS } from "../constants/colors"
import MovieCard from "../components/MovieCard"
import FilterChip from "../components/FilterChip"

export default function MoviesScreen() {
  const navigation = useNavigation()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")

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

  const renderMovieCard = ({ item }) => (
    <View style={styles.movieCardWrapper}>
      <MovieCard
        movie={item}
        onPress={() => navigation.navigate("MovieDetail", { id: item.id })}
        showRating={true}
      />
    </View>
  )

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>내 영화</Text>
        <TouchableOpacity>
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
        data={movies}
        renderItem={renderMovieCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.moviesGrid}
        showsVerticalScrollIndicator={false}
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
})
