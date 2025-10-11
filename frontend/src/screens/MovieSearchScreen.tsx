import { useState, useMemo } from "react"
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { COLORS } from "../constants/colors"
import type { RootStackParamList } from "../types"

type MovieSearchScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>

export default function MovieSearchScreen() {
  const navigation = useNavigation<MovieSearchScreenNavigationProp>()
  const [searchQuery, setSearchQuery] = useState("")

  // Mock movie search results
  const allMovies = [
    {
      id: 1,
      title: "오펜하이머",
      originalTitle: "Oppenheimer",
      year: 2023,
      genre: "드라마, 역사",
      director: "크리스토퍼 놀란",
      poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    },
    {
      id: 2,
      title: "기생충",
      originalTitle: "Parasite",
      year: 2019,
      genre: "드라마, 스릴러",
      director: "봉준호",
      poster: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    },
    {
      id: 3,
      title: "인터스텔라",
      originalTitle: "Interstellar",
      year: 2014,
      genre: "SF, 드라마",
      director: "크리스토퍼 놀란",
      poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    },
    {
      id: 4,
      title: "타이타닉",
      originalTitle: "Titanic",
      year: 1997,
      genre: "로맨스, 드라마",
      director: "제임스 카메론",
      poster: "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
    },
    {
      id: 5,
      title: "라라랜드",
      originalTitle: "La La Land",
      year: 2016,
      genre: "로맨스, 뮤지컬",
      director: "데이미언 셔젤",
      poster: "https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg",
    },
    {
      id: 6,
      title: "듄: 파트2",
      originalTitle: "Dune: Part Two",
      year: 2024,
      genre: "SF, 액션",
      director: "드니 빌뇌브",
      poster: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    },
    {
      id: 7,
      title: "어바웃 타임",
      originalTitle: "About Time",
      year: 2013,
      genre: "로맨스, 드라마",
      director: "리처드 커티스",
      poster: "https://image.tmdb.org/t/p/w500/4eJeDeT5G3N3hT2pZ2hY6pAg6qW.jpg",
    },
    {
      id: 8,
      title: "인셉션",
      originalTitle: "Inception",
      year: 2010,
      genre: "SF, 액션",
      director: "크리스토퍼 놀란",
      poster: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    },
  ]

  // Filter movies based on search query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return []
    }

    const query = searchQuery.toLowerCase().trim()
    return allMovies.filter(
      (movie) =>
        movie.title.toLowerCase().includes(query) ||
        movie.originalTitle.toLowerCase().includes(query) ||
        movie.director.toLowerCase().includes(query)
    )
  }, [searchQuery])

  const renderMovieItem = ({ item }: { item: typeof allMovies[0] }) => (
    <TouchableOpacity
      style={styles.movieItem}
      onPress={() => {
        // TODO: Navigate to MovieDetail screen
        navigation.navigate("MovieDetail", { id: item.id })
      }}
    >
      <Image source={{ uri: item.poster }} style={styles.poster} />
      <View style={styles.movieInfo}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.originalTitle} numberOfLines={1}>
          {item.originalTitle}
        </Text>
        <View style={styles.metadata}>
          <Text style={styles.metadataText}>
            {item.year} · {item.genre}
          </Text>
          <Text style={styles.metadataText}>{item.director}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.lightGray} />
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>영화 검색</Text>
        <View style={styles.backButton} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.lightGray} />
        <TextInput
          style={styles.searchInput}
          placeholder="영화 제목, 감독 검색..."
          placeholderTextColor={COLORS.lightGray}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color={COLORS.lightGray} />
          </TouchableOpacity>
        )}
      </View>

      {/* Search Results */}
      {searchQuery.trim() === "" ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={64} color={COLORS.lightGray} />
          <Text style={styles.emptyTitle}>영화를 검색해보세요</Text>
          <Text style={styles.emptySubtitle}>제목, 원제목, 감독으로 검색할 수 있습니다</Text>
        </View>
      ) : searchResults.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="film-outline" size={64} color={COLORS.lightGray} />
          <Text style={styles.emptyTitle}>검색 결과가 없습니다</Text>
          <Text style={styles.emptySubtitle}>다른 검색어를 시도해보세요</Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderMovieItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  backButton: {
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.white,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.deepGray,
    marginHorizontal: 20,
    marginBottom: 20,
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  resultsList: {
    paddingHorizontal: 20,
  },
  movieItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.deepGray,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 12,
  },
  poster: {
    width: 60,
    height: 90,
    borderRadius: 8,
  },
  movieInfo: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
    marginBottom: 4,
  },
  originalTitle: {
    fontSize: 13,
    color: COLORS.lightGray,
    marginBottom: 6,
  },
  metadata: {
    gap: 2,
  },
  metadataText: {
    fontSize: 12,
    color: COLORS.lightGray,
  },
})
