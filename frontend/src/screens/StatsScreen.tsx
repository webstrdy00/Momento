import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { COLORS } from "../constants/colors"

const { width } = Dimensions.get("window")

export default function StatsScreen() {
  const yearlyGoal = 100
  const watched = 45
  const progress = (watched / yearlyGoal) * 100

  const monthlyData = [
    { month: "1월", count: 5 },
    { month: "2월", count: 8 },
    { month: "3월", count: 6 },
    { month: "4월", count: 12 },
    { month: "5월", count: 9 },
    { month: "6월", count: 5 },
  ]

  const genreStats = [
    { genre: "드라마", count: 15, color: COLORS.gold },
    { genre: "SF", count: 12, color: COLORS.red },
    { genre: "액션", count: 10, color: "#3498db" },
    { genre: "코미디", count: 8, color: "#2ecc71" },
  ]

  const topTags = [
    { tag: "#명작", count: 18 },
    { tag: "#재관람", count: 12 },
    { tag: "#추천", count: 10 },
    { tag: "#감동", count: 8 },
  ]

  const maxCount = Math.max(...monthlyData.map((d) => d.count))

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>통계</Text>
        <Text style={styles.headerSubtitle}>2025년</Text>
      </View>

      {/* Yearly Goal */}
      <View style={styles.goalCard}>
        <View style={styles.goalHeader}>
          <Text style={styles.goalTitle}>연간 목표</Text>
          <Text style={styles.goalProgress}>
            {watched} / {yearlyGoal}편
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.goalPercentage}>{progress.toFixed(0)}% 달성</Text>
      </View>

      {/* Monthly Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>월별 관람 추이</Text>
        <View style={styles.chartContainer}>
          {monthlyData.map((item, index) => (
            <View key={index} style={styles.chartBar}>
              <View style={styles.barContainer}>
                <View style={[styles.bar, { height: (item.count / maxCount) * 120 }]} />
              </View>
              <Text style={styles.barCount}>{item.count}</Text>
              <Text style={styles.barLabel}>{item.month}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="film" size={32} color={COLORS.gold} />
          <Text style={styles.statValue}>45편</Text>
          <Text style={styles.statLabel}>총 관람</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="star" size={32} color={COLORS.gold} />
          <Text style={styles.statValue}>4.2</Text>
          <Text style={styles.statLabel}>평균 별점</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="time" size={32} color={COLORS.gold} />
          <Text style={styles.statValue}>120시간</Text>
          <Text style={styles.statLabel}>총 시청 시간</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="calendar" size={32} color={COLORS.gold} />
          <Text style={styles.statValue}>22일</Text>
          <Text style={styles.statLabel}>연속 기록</Text>
        </View>
      </View>

      {/* Genre Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>장르별 통계</Text>
        {genreStats.map((item, index) => (
          <View key={index} style={styles.genreItem}>
            <View style={styles.genreInfo}>
              <View style={[styles.genreColor, { backgroundColor: item.color }]} />
              <Text style={styles.genreText}>{item.genre}</Text>
            </View>
            <Text style={styles.genreCount}>{item.count}편</Text>
          </View>
        ))}
      </View>

      {/* Top Tags */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>인기 태그</Text>
        <View style={styles.tagsContainer}>
          {topTags.map((item, index) => (
            <View key={index} style={styles.tagItem}>
              <Text style={styles.tagText}>{item.tag}</Text>
              <Text style={styles.tagCount}>{item.count}</Text>
            </View>
          ))}
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.lightGray,
  },
  goalCard: {
    backgroundColor: COLORS.deepGray,
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.white,
  },
  goalProgress: {
    fontSize: 16,
    color: COLORS.gold,
    fontWeight: "600",
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: COLORS.darkNavy,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.gold,
  },
  goalPercentage: {
    fontSize: 14,
    color: COLORS.lightGray,
    textAlign: "right",
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 180,
    backgroundColor: COLORS.deepGray,
    padding: 16,
    borderRadius: 12,
  },
  chartBar: {
    flex: 1,
    alignItems: "center",
  },
  barContainer: {
    flex: 1,
    justifyContent: "flex-end",
    width: "100%",
    alignItems: "center",
  },
  bar: {
    width: 24,
    backgroundColor: COLORS.gold,
    borderRadius: 4,
  },
  barCount: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: "600",
    marginTop: 4,
  },
  barLabel: {
    fontSize: 11,
    color: COLORS.lightGray,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    width: (width - 52) / 2,
    backgroundColor: COLORS.deepGray,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.white,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.lightGray,
    marginTop: 4,
  },
  genreItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.deepGray,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  genreInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  genreColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  genreText: {
    fontSize: 15,
    color: COLORS.white,
    fontWeight: "500",
  },
  genreCount: {
    fontSize: 15,
    color: COLORS.gold,
    fontWeight: "600",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.deepGray,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  tagText: {
    fontSize: 14,
    color: COLORS.gold,
    fontWeight: "500",
  },
  tagCount: {
    fontSize: 12,
    color: COLORS.lightGray,
  },
  bottomPadding: {
    height: 20,
  },
})
