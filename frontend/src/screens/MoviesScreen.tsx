"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, FlatList } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"

const COLORS = {
  darkNavy: "#1a1d29",
  deepGray: "#2d2f3e",
  gold: "#d4af37",
  red: "#e74c3c",
  white: "#ffffff",
  lightGray: "#a0a0a0",
}

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
    { id: "all", label: "전체", icon: "apps" },
    { id: "watching", label: "보는 중", icon: "play-circle" },
    { id: "completed", label: "완료", icon: "checkmark-circle" },
    { id: "watchlist", label: "보고 싶은", icon: "bookmark" },
  ]

  const renderMovieCard = ({ item }) => (
    <TouchableOpacity style={styles.movieCard} onPress={() => navigation.navigate("MovieDetail", { id: item.id })}>
      <Image source={{ uri: item.poster }} style={styles.moviePoster} />
      <View style={styles.movieCardOverlay}>
        {item.rating > 0 && (
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color={COLORS.gold} />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        )}
      </View>
      <Text style={styles.movieCardTitle} numberOfLines={2}>
        {item.title}
      </Text>
    </TouchableOpacity>
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
          <TouchableOpacity
            key={filter.id}
            style={[styles.filterButton, selectedFilter === filter.id && styles.filterButtonActive]}
            onPress={() => setSelectedFilter(filter.id)}
          >
            <Ionicons
              name={filter.icon}
              size={18}
              color={selectedFilter === filter.id ? COLORS.darkNavy : COLORS.gold}
            />
            <Text style={[styles.filterText, selectedFilter === filter.id && styles.filterTextActive]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
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
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.deepGray,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: COLORS.gold,
  },
  filterText: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: "600",
  },
  filterTextActive: {
    color: COLORS.darkNavy,
  },
  moviesGrid: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  movieCard: {
    flex: 1,
    margin: 6,
    maxWidth: "48%",
  },
  moviePoster: {
    width: "100%",
    aspectRatio: 2 / 3,
    borderRadius: 12,
    marginBottom: 8,
  },
  movieCardOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(26, 29, 41, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  ratingText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  movieCardTitle: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: "500",
  },
})
