import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, TextInput, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRoute, useNavigation } from "@react-navigation/native"
import type { RouteProp } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { COLORS } from "../constants/colors"
import MovieCard from "../components/MovieCard"
import type { RootStackParamList, Movie } from "../types"

type CollectionDetailRouteProp = RouteProp<RootStackParamList, "CollectionDetail">
type CollectionDetailNavigationProp = NativeStackNavigationProp<RootStackParamList>

export default function CollectionDetailScreen() {
  const route = useRoute<CollectionDetailRouteProp>()
  const navigation = useNavigation<CollectionDetailNavigationProp>()
  const { id } = route.params

  const [isEditMode, setIsEditMode] = useState(false)
  const [collectionName, setCollectionName] = useState("")
  const [collectionDescription, setCollectionDescription] = useState("")

  // Mock 데이터 - 실제로는 API에서 가져옴
  const mockCollections = [
    {
      id: 1,
      name: "크리스토퍼 놀란 영화",
      description: "놀란 감독의 걸작들",
      movieCount: 5,
      isAuto: false,
      movies: [
        {
          id: 3,
          title: "인터스텔라",
          poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
          rating: 4.8,
          status: "completed" as const,
        },
        {
          id: 1,
          title: "오펜하이머",
          poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
          rating: 4.5,
          status: "completed" as const,
        },
        {
          id: 8,
          title: "인셉션",
          poster: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
          rating: 4.7,
          status: "completed" as const,
        },
        {
          id: 12,
          title: "덩케르크",
          poster: "https://image.tmdb.org/t/p/w500/cUqEgoP6kj8ykfNjJx3Tl5zHCcN.jpg",
          rating: 4.3,
          status: "completed" as const,
        },
        {
          id: 15,
          title: "테넷",
          poster: "https://image.tmdb.org/t/p/w500/k68nPLbIST6NP96JmTxmZijEvCA.jpg",
          rating: 4.0,
          status: "completed" as const,
        },
      ],
    },
    {
      id: 2,
      name: "액션 명작",
      description: "최고의 액션 영화 모음",
      movieCount: 12,
      isAuto: false,
      movies: [],
    },
    {
      id: 3,
      name: "2024년 본 영화",
      description: "자동 생성된 컬렉션",
      movieCount: 8,
      isAuto: true,
      movies: [],
    },
  ]

  const collection = mockCollections.find((c) => c.id === id) || mockCollections[0]

  // 편집 모드 초기화
  useState(() => {
    setCollectionName(collection.name)
    setCollectionDescription(collection.description || "")
  })

  const handleSave = () => {
    // TODO: API 호출로 컬렉션 정보 업데이트
    Alert.alert("저장 완료", `컬렉션 "${collectionName}"이(가) 업데이트되었습니다.`)
    setIsEditMode(false)
  }

  const handleDelete = () => {
    Alert.alert("컬렉션 삭제", `"${collection.name}" 컬렉션을 삭제하시겠습니까?`, [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          // TODO: API 호출로 컬렉션 삭제
          navigation.goBack()
        },
      },
    ])
  }

  const handleRemoveMovie = (movieId: number) => {
    Alert.alert("영화 제거", "이 영화를 컬렉션에서 제거하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "제거",
        style: "destructive",
        onPress: () => {
          // TODO: API 호출로 영화 제거
          Alert.alert("제거 완료", "영화가 컬렉션에서 제거되었습니다.")
        },
      },
    ])
  }

  const handleAddMovie = () => {
    // TODO: 영화 검색 또는 선택 화면으로 이동
    navigation.navigate("MovieSearch")
  }

  const renderMovieCard = ({ item }: { item: Movie }) => (
    <View style={styles.movieCardWrapper}>
      <MovieCard movie={item} onPress={() => navigation.navigate("MovieDetail", { id: item.id })} showRating={true} />

      {/* 편집 모드: 제거 버튼 */}
      {isEditMode && !collection.isAuto && (
        <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveMovie(item.id)}>
          <Ionicons name="close-circle" size={24} color={COLORS.red} />
        </TouchableOpacity>
      )}
    </View>
  )

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={COLORS.white} />
          </TouchableOpacity>

          {!isEditMode ? (
            <>
              <Text style={styles.headerTitle}>{collection.name}</Text>
              {!collection.isAuto && (
                <TouchableOpacity onPress={() => setIsEditMode(true)}>
                  <Ionicons name="create-outline" size={24} color={COLORS.gold} />
                </TouchableOpacity>
              )}
            </>
          ) : (
            <>
              <TouchableOpacity onPress={() => setIsEditMode(false)} style={styles.cancelButton}>
                <Text style={styles.cancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                <Text style={styles.saveText}>저장</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* 컬렉션 정보 */}
        <View style={styles.infoSection}>
          {!isEditMode ? (
            <>
              {collection.description && <Text style={styles.description}>{collection.description}</Text>}
              <View style={styles.metaRow}>
                <Ionicons name="film-outline" size={16} color={COLORS.lightGray} />
                <Text style={styles.metaText}>{collection.movieCount}편의 영화</Text>
                {collection.isAuto && (
                  <>
                    <Ionicons name="sparkles" size={16} color={COLORS.gold} style={styles.metaIcon} />
                    <Text style={[styles.metaText, { color: COLORS.gold }]}>자동 컬렉션</Text>
                  </>
                )}
              </View>
            </>
          ) : (
            <View style={styles.editForm}>
              <Text style={styles.label}>컬렉션 이름</Text>
              <TextInput
                style={styles.input}
                value={collectionName}
                onChangeText={setCollectionName}
                placeholder="컬렉션 이름 입력"
                placeholderTextColor={COLORS.lightGray}
              />

              <Text style={styles.label}>설명 (선택)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={collectionDescription}
                onChangeText={setCollectionDescription}
                placeholder="컬렉션 설명 입력"
                placeholderTextColor={COLORS.lightGray}
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={20} color={COLORS.red} />
                <Text style={styles.deleteButtonText}>컬렉션 삭제</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 영화 목록 */}
        <View style={styles.moviesSection}>
          <FlatList
            data={collection.movies}
            renderItem={renderMovieCard}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            contentContainerStyle={styles.moviesGrid}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="film-outline" size={64} color={COLORS.lightGray} />
                <Text style={styles.emptyTitle}>영화가 없습니다</Text>
                <Text style={styles.emptySubtitle}>아래 버튼을 눌러 영화를 추가해보세요</Text>
              </View>
            }
          />

          {/* 영화 추가 버튼 */}
          {!collection.isAuto && (
            <TouchableOpacity style={styles.addMovieButton} onPress={handleAddMovie}>
              <Ionicons name="add-circle-outline" size={24} color={COLORS.gold} />
              <Text style={styles.addMovieText}>영화 추가</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.white,
  },
  cancelButton: {
    marginLeft: "auto",
    marginRight: 12,
  },
  cancelText: {
    fontSize: 16,
    color: COLORS.lightGray,
  },
  saveButton: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.darkNavy,
  },
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  description: {
    fontSize: 15,
    color: COLORS.lightGray,
    marginBottom: 12,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    fontSize: 14,
    color: COLORS.lightGray,
    marginLeft: 6,
  },
  metaIcon: {
    marginLeft: 16,
  },
  editForm: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.white,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.deepGray,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.white,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(231, 76, 60, 0.1)",
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 8,
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.red,
  },
  moviesSection: {
    paddingHorizontal: 20,
  },
  moviesGrid: {
    paddingBottom: 16,
  },
  movieCardWrapper: {
    flex: 1,
    margin: 6,
    maxWidth: "48%",
    position: "relative",
  },
  removeButton: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: "rgba(26, 29, 41, 0.9)",
    borderRadius: 12,
    padding: 2,
  },
  addMovieButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.deepGray,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 16,
    gap: 8,
  },
  addMovieText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.gold,
  },
  emptyContainer: {
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
  bottomPadding: {
    height: 40,
  },
})
