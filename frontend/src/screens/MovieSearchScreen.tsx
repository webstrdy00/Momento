import { useCallback, useEffect, useRef, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native"
import { useAlert } from "../components/CustomAlert"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"

import { COLORS } from "../constants/colors"
import type { RootStackParamList } from "../types"
import {
  searchMovies,
  addMovie,
  createMovieFromMetadata,
  getMovies,
  mergeMovieMetadata,
  type MovieMetadata,
} from "../services/movieService"
import { addTagToMovie, getTags, type Tag } from "../services/tagService"

type MovieSearchScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>

interface MovieSearchItem {
  title: string
  original_title?: string | null
  content_type?: "movie" | "series"
  release_channel?: "theatrical" | "ott_original" | "tv" | "unknown"
  director?: string | null
  year?: number | null
  runtime?: number | null
  total_episodes?: number | null
  genre?: string | null
  poster_url?: string | null
  backdrop_url?: string | null
  synopsis?: string | null
  kobis_code?: string | null
  tmdb_id?: number | null
  kmdb_id?: string | null
  source: string
}

interface LibraryMovieIdentity {
  title?: string | null
  original_title?: string | null
  content_type?: "movie" | "series"
  year?: number | null
  kobis_code?: string | null
  tmdb_id?: number | null
  kmdb_id?: string | null
}

interface MovieDraft {
  title: string
  original_title: string
  content_type: "movie" | "series"
  release_channel: "theatrical" | "ott_original" | "tv" | "unknown"
  director: string
  year: string
  runtime: string
  total_episodes: string
  genre: string
  synopsis: string
  poster_url: string
  backdrop_url: string
  kobis_code: string
  tmdb_id?: number | null
  kmdb_id: string
  source: string
}

const normalizeSearchText = (value?: string | null) =>
  (value || "")
    .normalize("NFKC")
    .toLowerCase()
    .trim()
    .replace(/[\p{P}\p{S}\s_]+/gu, "")

const buildFallbackKey = (movie: Partial<MovieSearchItem>) =>
  `${movie.content_type ?? "movie"}::${normalizeSearchText(movie.title)}::${normalizeSearchText(movie.original_title)}::${movie.year ?? "na"}`

const getMovieIdentityKeys = (movie: Partial<MovieSearchItem>) => {
  const keys: string[] = []

  if (movie.tmdb_id) keys.push(`tmdb:${movie.content_type ?? "movie"}:${movie.tmdb_id}`)
  if (movie.kobis_code) keys.push(`kobis:${movie.kobis_code}`)
  if (movie.kmdb_id) keys.push(`kmdb:${movie.kmdb_id}`)
  keys.push(`fallback:${buildFallbackKey(movie)}`)

  return keys
}

const getPrimaryMovieIdentityKey = (movie: Partial<MovieSearchItem>) =>
  getMovieIdentityKeys(movie)[0] ?? `fallback:${buildFallbackKey(movie)}`

const isMovieAddedWithLookup = (movie: Partial<MovieSearchItem>, lookup: Record<string, boolean>) =>
  getMovieIdentityKeys(movie).some((key) => lookup[key])

const sortResultsByAdded = (results: MovieSearchItem[], lookup: Record<string, boolean>) =>
  [...results].sort((a, b) => {
    const aAdded = isMovieAddedWithLookup(a, lookup)
    const bAdded = isMovieAddedWithLookup(b, lookup)
    if (aAdded === bAdded) return 0
    return aAdded ? -1 : 1
  })

const toOptionalString = (value: string) => {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

const parseOptionalInt = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  const parsed = parseInt(trimmed, 10)
  return Number.isFinite(parsed) ? parsed : undefined
}

const CONTENT_TYPE_OPTIONS = [
  { value: "movie" as const, label: "영화" },
  { value: "series" as const, label: "시리즈" },
]

const RELEASE_CHANNEL_OPTIONS = [
  { value: "theatrical" as const, label: "극장 개봉" },
  { value: "ott_original" as const, label: "OTT 오리지널" },
  { value: "tv" as const, label: "TV/방송" },
  { value: "unknown" as const, label: "알 수 없음" },
]

const getContentTypeLabel = (value?: string | null) =>
  value === "series" ? "시리즈" : "영화"

const getReleaseChannelLabel = (value?: string | null) =>
  RELEASE_CHANNEL_OPTIONS.find((option) => option.value === value)?.label ?? "알 수 없음"

const getDisplayImageUrl = (item: { poster_url?: string | null; backdrop_url?: string | null }) =>
  item.poster_url || item.backdrop_url || null

const createDraftFromItem = (movie: MovieSearchItem): MovieDraft => ({
  title: movie.title ?? "",
  original_title: movie.original_title ?? "",
  content_type: movie.content_type ?? "movie",
  release_channel: movie.release_channel ?? "unknown",
  director: movie.director ?? "",
  year: movie.year ? String(movie.year) : "",
  runtime: movie.runtime ? String(movie.runtime) : "",
  total_episodes: movie.total_episodes ? String(movie.total_episodes) : "",
  genre: movie.genre ?? "",
  synopsis: movie.synopsis ?? "",
  poster_url: movie.poster_url ?? "",
  backdrop_url: movie.backdrop_url ?? "",
  kobis_code: movie.kobis_code ?? "",
  tmdb_id: movie.tmdb_id ?? null,
  kmdb_id: movie.kmdb_id ?? "",
  source: movie.source ?? "unknown",
})

const mergeMovieItemWithMetadata = (movie: MovieSearchItem, metadata: MovieMetadata): MovieSearchItem => ({
  ...movie,
  title: metadata.title ?? movie.title,
  original_title: metadata.original_title ?? movie.original_title,
  content_type: metadata.content_type ?? movie.content_type ?? "movie",
  release_channel: metadata.release_channel ?? movie.release_channel ?? "unknown",
  director: metadata.director ?? movie.director,
  year: metadata.year ?? movie.year,
  runtime: metadata.runtime ?? movie.runtime,
  total_episodes: metadata.total_episodes ?? movie.total_episodes,
  genre: metadata.genre ?? movie.genre,
  poster_url: metadata.poster_url ?? movie.poster_url,
  backdrop_url: metadata.backdrop_url ?? movie.backdrop_url,
  synopsis: metadata.synopsis ?? movie.synopsis,
  kobis_code: metadata.kobis_code ?? movie.kobis_code,
  tmdb_id: metadata.tmdb_id ?? movie.tmdb_id,
  kmdb_id: metadata.kmdb_id ?? movie.kmdb_id,
})

export default function MovieSearchScreen() {
  const navigation = useNavigation<MovieSearchScreenNavigationProp>()
  const insets = useSafeAreaInsets()
  const { showAlert } = useAlert()

  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<MovieSearchItem[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const [selectedMovie, setSelectedMovie] = useState<MovieSearchItem | null>(null)
  const [draft, setDraft] = useState<MovieDraft | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [preparingMovieKey, setPreparingMovieKey] = useState<string | null>(null)

  const [allTags, setAllTags] = useState<Tag[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [loadingTags, setLoadingTags] = useState(false)

  const [addedKeys, setAddedKeys] = useState<Record<string, boolean>>({})
  const [toastMessage, setToastMessage] = useState("")
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current)
      }
    }
  }, [])

  const hydrateAddedKeysFromLibrary = useCallback(async () => {
    try {
      const libraryMovies = (await getMovies()) as LibraryMovieIdentity[]
      setAddedKeys((prev) => {
        const next = { ...prev }
        let changed = false

        libraryMovies.forEach((movie) => {
          const identityCandidate: Partial<MovieSearchItem> = {
            title: movie.title ?? undefined,
            original_title: movie.original_title ?? undefined,
            content_type: movie.content_type ?? "movie",
            year: movie.year ?? undefined,
            kobis_code: movie.kobis_code ?? undefined,
            tmdb_id: movie.tmdb_id ?? undefined,
            kmdb_id: movie.kmdb_id ?? undefined,
          }

          getMovieIdentityKeys(identityCandidate).forEach((key) => {
            if (!next[key]) {
              next[key] = true
              changed = true
            }
          })
        })

        if (changed) {
          setSearchResults((current) => sortResultsByAdded(current, next))
          return next
        }
        return prev
      })
    } catch (error) {
      console.error("Failed to preload added movies:", error)
    }
  }, [])

  useEffect(() => {
    void hydrateAddedKeysFromLibrary()
  }, [hydrateAddedKeysFromLibrary])

  const performSearch = async (query: string) => {
    try {
      setLoading(true)
      const results = (await searchMovies(query)) as MovieSearchItem[]
      setSearchResults(sortResultsByAdded(results, addedKeys))
    } catch (error) {
      console.error("영화 검색 실패:", error)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const markMovieAsAdded = useCallback((movie: Partial<MovieSearchItem>) => {
    setAddedKeys((prev) => {
      const next = { ...prev }
      getMovieIdentityKeys(movie).forEach((key) => {
        next[key] = true
      })
      setSearchResults((current) => sortResultsByAdded(current, next))
      return next
    })
  }, [])

  const isMovieAdded = useCallback(
    (movie: Partial<MovieSearchItem>) => isMovieAddedWithLookup(movie, addedKeys),
    [addedKeys]
  )

  const showToast = useCallback((message: string) => {
    setToastMessage(message)
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current)
    }
    toastTimerRef.current = setTimeout(() => {
      setToastMessage("")
      toastTimerRef.current = null
    }, 1800)
  }, [])

  const showAlreadyAddedNotice = useCallback(() => {
    showToast("보관함에 있는 작품이에요.")
  }, [showToast])

  const loadTags = useCallback(async () => {
    if (allTags.length > 0) return
    try {
      setLoadingTags(true)
      const tags = await getTags()
      setAllTags(tags)
    } catch (error) {
      console.error("태그 목록 조회 실패:", error)
      showAlert("안내", "태그 목록을 불러오지 못했어요. 태그 없이 추가는 가능합니다.")
    } finally {
      setLoadingTags(false)
    }
  }, [allTags.length])

  const handleSearch = async () => {
    const query = searchQuery.trim()
    if (!query) {
      setHasSearched(false)
      setSearchResults([])
      return
    }

    setHasSearched(true)
    await performSearch(query)
  }

  const handleSelectMovie = async (movie: MovieSearchItem) => {
    const movieKey = getPrimaryMovieIdentityKey(movie)
    if (preparingMovieKey) return

    setPreparingMovieKey(movieKey)
    setSelectedTagIds([])
    void loadTags()

    try {
      const mergedMetadata = await mergeMovieMetadata(movie)
      const mergedMovie = mergeMovieItemWithMetadata(movie, mergedMetadata)
      setSelectedMovie(mergedMovie)
      setDraft(createDraftFromItem(mergedMovie))
    } catch (error) {
      console.error("영화 메타데이터 병합 실패:", error)
      setSelectedMovie(movie)
      setDraft(createDraftFromItem(movie))
      showAlert("안내", "상세 정보를 모두 불러오지 못해 현재 검색 결과로 등록 화면을 열었어요.")
    } finally {
      setPreparingMovieKey(null)
    }
  }

  const handleBackFromEditor = (force: boolean = false) => {
    if ((isSaving || preparingMovieKey) && !force) return
    setSelectedMovie(null)
    setDraft(null)
    setSelectedTagIds([])
  }

  const updateDraftField = <K extends keyof MovieDraft>(field: K, value: MovieDraft[K]) => {
    setDraft((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  const handleToggleTag = (tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    )
  }

  const handleSaveMovie = async () => {
    if (!draft) return

    const title = draft.title.trim()
    if (!title) {
      showAlert("입력 확인", "작품 제목을 입력해 주세요.")
      return
    }

    const duplicateCandidate: Partial<MovieSearchItem> = {
      title,
      original_title: toOptionalString(draft.original_title),
      content_type: draft.content_type,
      year: parseOptionalInt(draft.year),
      kobis_code: toOptionalString(draft.kobis_code),
      tmdb_id: draft.tmdb_id ?? undefined,
      kmdb_id: toOptionalString(draft.kmdb_id),
    }
    if (isMovieAdded(duplicateCandidate)) {
      handleBackFromEditor(true)
      showAlreadyAddedNotice()
      return
    }

    try {
      setIsSaving(true)

      const metadataPayload: Partial<MovieSearchItem> = {
        title,
        original_title: toOptionalString(draft.original_title),
        content_type: draft.content_type,
        release_channel: draft.release_channel,
        director: toOptionalString(draft.director),
        year: parseOptionalInt(draft.year),
        runtime: parseOptionalInt(draft.runtime),
        total_episodes: draft.content_type === "series" ? parseOptionalInt(draft.total_episodes) : undefined,
        genre: toOptionalString(draft.genre),
        synopsis: toOptionalString(draft.synopsis),
        poster_url: toOptionalString(draft.poster_url),
        backdrop_url: toOptionalString(draft.backdrop_url),
        kobis_code: toOptionalString(draft.kobis_code),
        tmdb_id: draft.tmdb_id ?? undefined,
        kmdb_id: toOptionalString(draft.kmdb_id),
        source: draft.source,
      }

      const createdMovie = await createMovieFromMetadata(metadataPayload)
      const addedMovie = await addMovie({
        movie_id: createdMovie.id,
        status: "watchlist",
      })

      let failedTagCount = 0
      if (selectedTagIds.length > 0) {
        const settled = await Promise.allSettled(
          selectedTagIds.map((tagId) => addTagToMovie(addedMovie.id, tagId))
        )
        failedTagCount = settled.filter((result) => result.status === "rejected").length
      }

      markMovieAsAdded(metadataPayload)
      handleBackFromEditor(true)

      if (failedTagCount > 0) {
        showAlert("일부 저장됨", `작품은 추가했지만 태그 ${failedTagCount}개 추가에 실패했어요.`)
      } else {
        showAlert("추가 완료", "보고 싶은 작품에 추가했어요.")
      }
    } catch (error: any) {
      console.error("영화 추가 실패:", error)
      if (error.response?.status === 400 || error.response?.status === 409) {
        if (selectedMovie) {
          markMovieAsAdded(selectedMovie)
        }
        handleBackFromEditor(true)
        showAlreadyAddedNotice()
      } else {
        showAlert("오류", "작품 추가에 실패했습니다.")
      }
    } finally {
      setIsSaving(false)
    }
  }

  const renderMovieItem = ({ item }: { item: MovieSearchItem }) => {
    const alreadyAdded = isMovieAdded(item)
    const isPreparing = preparingMovieKey === getPrimaryMovieIdentityKey(item)
    const isSelectionLocked = Boolean(preparingMovieKey)
    const imageUrl = getDisplayImageUrl(item)

    return (
      <TouchableOpacity
        style={[
          styles.movieItem,
          alreadyAdded && styles.movieItemAdded,
          isSelectionLocked && styles.movieItemDisabled,
        ]}
        onPress={() => {
          void handleSelectMovie(item)
        }}
        activeOpacity={0.85}
        disabled={isSelectionLocked}
      >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.poster} />
        ) : (
          <View style={[styles.poster, styles.posterFallback]}>
            <Ionicons name="image-outline" size={20} color={COLORS.lightGray} />
          </View>
        )}

        <View style={styles.movieInfo}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          {item.original_title && (
            <Text style={styles.originalTitle} numberOfLines={1}>
              {item.original_title}
            </Text>
          )}
          <View style={styles.metadata}>
            <View style={styles.resultChipRow}>
              <View style={styles.resultMetaChip}>
                <Text style={styles.resultMetaChipText}>{getContentTypeLabel(item.content_type)}</Text>
              </View>
              <View style={styles.resultMetaChip}>
                <Text style={styles.resultMetaChipText}>{getReleaseChannelLabel(item.release_channel)}</Text>
              </View>
            </View>
            {item.year && <Text style={styles.metadataText}>{item.year}</Text>}
            {item.genre ? <Text style={styles.metadataText}>{item.genre}</Text> : null}
            {item.director && item.director !== "Unknown" ? (
              <Text style={styles.metadataText}>{item.director}</Text>
            ) : null}
          </View>
        </View>

        {alreadyAdded && (
          <View style={styles.addedWatchlistChip} pointerEvents="none">
            <Ionicons name="bookmark" size={12} color={COLORS.darkNavy} />
            <Text style={styles.addedWatchlistChipText}>보관함</Text>
          </View>
        )}

        {isPreparing ? (
          <ActivityIndicator size="small" color={COLORS.gold} />
        ) : (
          <Ionicons name="chevron-forward" size={20} color={COLORS.lightGray} />
        )}
      </TouchableOpacity>
    )
  }

  const renderSearchBody = () => (
    <>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.lightGray} />
        <TextInput
          style={styles.searchInput}
          placeholder="작품 제목으로 검색..."
          placeholderTextColor={COLORS.lightGray}
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text)
            if (!text.trim()) {
              setHasSearched(false)
              setSearchResults([])
            }
          }}
          onSubmitEditing={() => {
            void handleSearch()
          }}
          returnKeyType="search"
          autoFocus
        />

        <View style={styles.searchActions}>
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.searchActionButton}
              onPress={() => {
                setSearchQuery("")
                setHasSearched(false)
                setSearchResults([])
              }}
            >
              <Ionicons name="close-circle" size={20} color={COLORS.lightGray} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.searchActionButton} onPress={handleSearch} disabled={loading}>
            <Ionicons name="search" size={18} color={COLORS.gold} />
          </TouchableOpacity>
        </View>
      </View>

      {!hasSearched ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={64} color={COLORS.lightGray} />
          <Text style={styles.emptyTitle}>작품을 검색해보세요</Text>
          <Text style={styles.emptySubtitle}>제목이나 제목+연도로 찾으면 더 정확해요</Text>
        </View>
      ) : loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={styles.loadingText}>검색 중...</Text>
        </View>
      ) : searchResults.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="film-outline" size={64} color={COLORS.lightGray} />
          <Text style={styles.emptyTitle}>검색 결과가 없습니다</Text>
          <Text style={styles.emptySubtitle}>작품 제목 위주로 다시 검색해보세요</Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderMovieItem}
          keyExtractor={(item, index) =>
            item.tmdb_id
              ? `tmdb-${item.tmdb_id}`
              : item.kobis_code
                ? `kobis-${item.kobis_code}`
                : item.kmdb_id
                  ? `kmdb-${item.kmdb_id}`
                  : `result-${item.source}-${item.title}-${item.year}-${index}`
          }
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </>
  )

  const renderEditorBody = () => {
    if (!draft) return null

    return (
      <ScrollView style={styles.editorContainer} contentContainerStyle={styles.editorContent}>
        <View style={styles.editorTopCard}>
          {getDisplayImageUrl(draft) ? (
            <Image source={{ uri: getDisplayImageUrl(draft)! }} style={styles.editorPoster} />
          ) : (
            <View style={[styles.editorPoster, styles.posterFallback]}>
              <Ionicons name="image-outline" size={20} color={COLORS.lightGray} />
            </View>
          )}
          <View style={styles.editorTopInfo}>
            <Text style={styles.editorTopTitle} numberOfLines={2}>
              {draft.title || "제목 없음"}
            </Text>
            <Text style={styles.editorTopMeta}>
              {getContentTypeLabel(draft.content_type)} · {getReleaseChannelLabel(draft.release_channel)}
            </Text>
          </View>
        </View>

        <View style={styles.editorSection}>
          <Text style={styles.editorSectionTitle}>기본정보</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>작품 형식</Text>
            <View style={styles.optionGrid}>
              {CONTENT_TYPE_OPTIONS.map((option) => {
                const selected = draft.content_type === option.value
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.optionChip, selected && styles.optionChipSelected]}
                    onPress={() => updateDraftField("content_type", option.value)}
                  >
                    <Text style={[styles.optionChipText, selected && styles.optionChipTextSelected]}>{option.label}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>공개 방식</Text>
            <View style={styles.optionGrid}>
              {RELEASE_CHANNEL_OPTIONS.map((option) => {
                const selected = draft.release_channel === option.value
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.optionChip, selected && styles.optionChipSelected]}
                    onPress={() => updateDraftField("release_channel", option.value)}
                  >
                    <Text style={[styles.optionChipText, selected && styles.optionChipTextSelected]}>{option.label}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>제목</Text>
            <TextInput
              style={styles.input}
              value={draft.title}
              onChangeText={(text) => updateDraftField("title", text)}
              placeholder="작품 제목"
              placeholderTextColor={COLORS.lightGray}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>원제</Text>
            <TextInput
              style={styles.input}
              value={draft.original_title}
              onChangeText={(text) => updateDraftField("original_title", text)}
              placeholder="Original title"
              placeholderTextColor={COLORS.lightGray}
            />
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, styles.inputHalf]}>
              <Text style={styles.inputLabel}>감독</Text>
              <TextInput
                style={styles.input}
                value={draft.director}
                onChangeText={(text) => updateDraftField("director", text)}
                placeholder="감독"
                placeholderTextColor={COLORS.lightGray}
              />
            </View>
            <View style={[styles.inputGroup, styles.inputHalf]}>
              <Text style={styles.inputLabel}>연도</Text>
              <TextInput
                style={styles.input}
                value={draft.year}
                onChangeText={(text) => updateDraftField("year", text.replace(/[^0-9]/g, ""))}
                placeholder="예: 2025"
                placeholderTextColor={COLORS.lightGray}
                keyboardType="number-pad"
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, styles.inputHalf]}>
              <Text style={styles.inputLabel}>{draft.content_type === "series" ? "회당 시간(분)" : "상영시간(분)"}</Text>
              <TextInput
                style={styles.input}
                value={draft.runtime}
                onChangeText={(text) => updateDraftField("runtime", text.replace(/[^0-9]/g, ""))}
                placeholder="예: 120"
                placeholderTextColor={COLORS.lightGray}
                keyboardType="number-pad"
              />
            </View>
            <View style={[styles.inputGroup, styles.inputHalf]}>
              <Text style={styles.inputLabel}>장르</Text>
              <TextInput
                style={styles.input}
                value={draft.genre}
                onChangeText={(text) => updateDraftField("genre", text)}
                placeholder="드라마, 액션"
                placeholderTextColor={COLORS.lightGray}
              />
            </View>
          </View>

          {draft.content_type === "series" && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>전체 회차</Text>
              <TextInput
                style={styles.input}
                value={draft.total_episodes}
                onChangeText={(text) => updateDraftField("total_episodes", text.replace(/[^0-9]/g, ""))}
                placeholder="예: 8"
                placeholderTextColor={COLORS.lightGray}
                keyboardType="number-pad"
              />
            </View>
          )}
        </View>

        <View style={styles.editorSection}>
          <Text style={styles.editorSectionTitle}>태그 선택</Text>
          {loadingTags ? (
            <View style={styles.tagLoadingRow}>
              <ActivityIndicator size="small" color={COLORS.gold} />
              <Text style={styles.tagLoadingText}>태그 불러오는 중...</Text>
            </View>
          ) : allTags.length === 0 ? (
            <Text style={styles.emptyTagText}>사용 가능한 태그가 없습니다.</Text>
          ) : (
            <View style={styles.tagGrid}>
              {allTags.map((tag) => {
                const selected = selectedTagIds.includes(tag.id)
                return (
                  <TouchableOpacity
                    key={tag.id}
                    style={[styles.tagChip, selected && styles.tagChipSelected]}
                    onPress={() => handleToggleTag(tag.id)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.tagChipText, selected && styles.tagChipTextSelected]}>
                      {tag.name}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          )}
        </View>
      </ScrollView>
    )
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={selectedMovie ? () => handleBackFromEditor() : () => navigation.goBack()}
          disabled={isSaving}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{selectedMovie ? "작품 등록하기" : "작품 검색"}</Text>

        {selectedMovie ? (
          <TouchableOpacity
            style={[styles.saveHeaderButton, isSaving && styles.saveHeaderButtonDisabled]}
            onPress={() => {
              void handleSaveMovie()
            }}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={COLORS.darkNavy} />
            ) : (
              <Text style={styles.saveHeaderButtonText}>저장</Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.headerRightPlaceholder} />
        )}
      </View>

      {selectedMovie ? renderEditorBody() : renderSearchBody()}

      {toastMessage ? (
        <View style={styles.toastContainer} pointerEvents="none">
          <View style={styles.toastBubble}>
            <Ionicons name="bookmark" size={14} color={COLORS.darkNavy} />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </View>
      ) : null}
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
  headerRightPlaceholder: {
    width: 56,
  },
  saveHeaderButton: {
    minWidth: 56,
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  saveHeaderButtonDisabled: {
    opacity: 0.75,
  },
  saveHeaderButtonText: {
    color: COLORS.darkNavy,
    fontSize: 13,
    fontWeight: "700",
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
  searchActionButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  searchActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
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
  loadingText: {
    fontSize: 14,
    color: COLORS.lightGray,
    marginTop: 12,
  },
  resultsList: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  movieItem: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.deepGray,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  movieItemAdded: {
    borderColor: "rgba(212, 175, 55, 0.52)",
    backgroundColor: COLORS.deepGray,
  },
  movieItemDisabled: {
    opacity: 0.72,
  },
  poster: {
    width: 60,
    height: 90,
    borderRadius: 8,
    backgroundColor: COLORS.darkGray,
  },
  posterFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  movieInfo: {
    flex: 1,
    gap: 4,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
  },
  originalTitle: {
    fontSize: 13,
    color: COLORS.lightGray,
  },
  metadata: {
    gap: 2,
  },
  resultChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 2,
  },
  resultMetaChip: {
    borderRadius: 999,
    backgroundColor: "rgba(212, 175, 55, 0.12)",
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  resultMetaChipText: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: "700",
  },
  metadataText: {
    fontSize: 12,
    color: COLORS.lightGray,
  },
  addedWatchlistChip: {
    position: "absolute",
    right: 34,
    top: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.gold,
    shadowColor: COLORS.gold,
    shadowOpacity: 0.28,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  addedWatchlistChipText: {
    color: COLORS.darkNavy,
    fontSize: 11,
    fontWeight: "700",
  },
  editorContainer: {
    flex: 1,
  },
  editorContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  editorTopCard: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: COLORS.deepGray,
    borderRadius: 14,
    padding: 12,
  },
  editorPoster: {
    width: 72,
    height: 108,
    borderRadius: 10,
    backgroundColor: COLORS.darkGray,
  },
  editorTopInfo: {
    flex: 1,
    justifyContent: "center",
    gap: 5,
  },
  editorTopTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.white,
  },
  editorTopMeta: {
    fontSize: 12,
    color: COLORS.gold,
    fontWeight: "700",
  },
  editorSection: {
    backgroundColor: COLORS.deepGray,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  editorSectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.white,
  },
  inputGroup: {
    gap: 6,
  },
  inputRow: {
    flexDirection: "row",
    gap: 10,
  },
  inputHalf: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: COLORS.lightGray,
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionChip: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.darkGray,
  },
  optionChipSelected: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.gold,
  },
  optionChipText: {
    color: COLORS.lightGray,
    fontSize: 12,
    fontWeight: "700",
  },
  optionChipTextSelected: {
    color: COLORS.darkNavy,
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 10,
    backgroundColor: COLORS.darkGray,
    color: COLORS.white,
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  tagLoadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tagLoadingText: {
    color: COLORS.lightGray,
    fontSize: 13,
  },
  emptyTagText: {
    color: COLORS.lightGray,
    fontSize: 13,
  },
  tagGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagChip: {
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.4)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "rgba(212, 175, 55, 0.08)",
  },
  tagChipSelected: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  tagChipText: {
    fontSize: 12,
    color: COLORS.gold,
    fontWeight: "600",
  },
  tagChipTextSelected: {
    color: COLORS.darkNavy,
  },
  toastContainer: {
    position: "absolute",
    left: 20,
    right: 20,
    top: 108,
    alignItems: "center",
    zIndex: 20,
  },
  toastBubble: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    backgroundColor: COLORS.gold,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    shadowColor: COLORS.gold,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  toastText: {
    color: COLORS.darkNavy,
    fontSize: 13,
    fontWeight: "700",
  },
})
