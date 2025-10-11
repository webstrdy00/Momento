import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import { COLORS } from "../constants/colors"
import type { RootStackParamList } from "../types"

type MovieDetailScreenProps = NativeStackScreenProps<RootStackParamList, "MovieDetail">

export default function MovieDetailScreen({ route }: MovieDetailScreenProps) {
  const [rating, setRating] = useState(4)
  const [review, setReview] = useState("")
  const { id } = route.params // TypeScript now knows this is { id: number }

  // TODO: Fetch movie data by id from API
  const movie = {
    title: "오펜하이머",
    originalTitle: "Oppenheimer",
    director: "크리스토퍼 놀란",
    year: 2023,
    runtime: 180,
    genre: "드라마, 역사",
    poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    backdrop: "https://image.tmdb.org/t/p/w500/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
    synopsis:
      "제2차 세계대전 당시 미국의 원자폭탄 개발 프로젝트인 맨해튼 프로젝트를 주도한 물리학자 로버트 오펜하이머의 이야기를 다룬 영화",
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Backdrop Image */}
      <View style={styles.backdropContainer}>
        <Image source={{ uri: movie.backdrop }} style={styles.backdrop} />
        <View style={styles.backdropOverlay} />
      </View>

      {/* Movie Info */}
      <View style={styles.content}>
        <View style={styles.movieHeader}>
          <Image source={{ uri: movie.poster }} style={styles.poster} />
          <View style={styles.movieInfo}>
            <Text style={styles.title}>{movie.title}</Text>
            <Text style={styles.originalTitle}>{movie.originalTitle}</Text>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={14} color={COLORS.lightGray} />
              <Text style={styles.infoText}>{movie.year}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={14} color={COLORS.lightGray} />
              <Text style={styles.infoText}>{movie.runtime}분</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="film-outline" size={14} color={COLORS.lightGray} />
              <Text style={styles.infoText}>{movie.genre}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={14} color={COLORS.lightGray} />
              <Text style={styles.infoText}>{movie.director}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.primaryButton}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
            <Text style={styles.primaryButtonText}>시청 완료</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton}>
            <Ionicons name="heart-outline" size={20} color={COLORS.gold} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton}>
            <Ionicons name="share-outline" size={20} color={COLORS.gold} />
          </TouchableOpacity>
        </View>

        {/* Synopsis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>줄거리</Text>
          <Text style={styles.synopsis}>{movie.synopsis}</Text>
        </View>

        {/* Rating */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>별점</Text>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Ionicons
                  name={star <= rating ? "star" : "star-outline"}
                  size={32}
                  color={COLORS.gold}
                  style={styles.star}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Review */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>감상평</Text>
          <TextInput
            style={styles.reviewInput}
            placeholder="이 영화에 대한 생각을 남겨보세요..."
            placeholderTextColor={COLORS.lightGray}
            multiline
            numberOfLines={4}
            value={review}
            onChangeText={setReview}
          />
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>태그</Text>
          <View style={styles.tagsContainer}>
            <TouchableOpacity style={styles.tag}>
              <Text style={styles.tagText}>#드라마</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tag}>
              <Text style={styles.tagText}>#역사</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tag}>
              <Text style={styles.tagText}>#전기영화</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addTagButton}>
              <Ionicons name="add" size={16} color={COLORS.gold} />
              <Text style={styles.addTagText}>태그 추가</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Watch Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>관람 정보</Text>
          <TouchableOpacity style={styles.dateButton}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.gold} />
            <Text style={styles.dateButtonText}>관람일 선택</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.darkNavy,
  },
  backdropContainer: {
    height: 250,
    position: "relative",
  },
  backdrop: {
    width: "100%",
    height: "100%",
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(26, 29, 41, 0.6)",
  },
  content: {
    marginTop: -50,
    paddingHorizontal: 20,
  },
  movieHeader: {
    flexDirection: "row",
    marginBottom: 20,
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: COLORS.gold,
  },
  movieInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 4,
  },
  originalTitle: {
    fontSize: 14,
    color: COLORS.lightGray,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.lightGray,
    marginLeft: 6,
  },
  actionButtons: {
    flexDirection: "row",
    marginBottom: 24,
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: COLORS.gold,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryButtonText: {
    color: COLORS.darkNavy,
    fontSize: 15,
    fontWeight: "bold",
  },
  secondaryButton: {
    width: 50,
    height: 50,
    backgroundColor: COLORS.deepGray,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 12,
  },
  synopsis: {
    fontSize: 14,
    color: COLORS.lightGray,
    lineHeight: 22,
  },
  ratingContainer: {
    flexDirection: "row",
    gap: 8,
  },
  star: {
    marginRight: 4,
  },
  reviewInput: {
    backgroundColor: COLORS.deepGray,
    borderRadius: 12,
    padding: 16,
    color: COLORS.white,
    fontSize: 14,
    minHeight: 120,
    textAlignVertical: "top",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: COLORS.deepGray,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagText: {
    color: COLORS.gold,
    fontSize: 13,
    fontWeight: "500",
  },
  addTagButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.deepGray,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  addTagText: {
    color: COLORS.gold,
    fontSize: 13,
    fontWeight: "500",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.deepGray,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  dateButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "500",
  },
  bottomPadding: {
    height: 40,
  },
})
