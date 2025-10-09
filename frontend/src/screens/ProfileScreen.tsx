import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { COLORS } from "../constants/colors"
import type { RootStackParamList } from "../types"

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>()

  // Mock 컬렉션 데이터
  const collections = [
    { id: 1, name: "크리스토퍼 놀란 영화", movieCount: 5, isAuto: false },
    { id: 2, name: "액션 명작", movieCount: 12, isAuto: false },
    { id: 3, name: "2024년 본 영화", movieCount: 8, isAuto: true },
  ]

  const menuItems = [
    { icon: "person-outline", label: "프로필 수정", action: "editProfile" },
    { icon: "notifications-outline", label: "알림 설정", action: "notifications" },
    { icon: "color-palette-outline", label: "테마 설정", action: "theme" },
    { icon: "cloud-upload-outline", label: "백업 및 복원", action: "backup" },
    { icon: "help-circle-outline", label: "도움말", action: "help" },
    { icon: "information-circle-outline", label: "앱 정보", action: "about" },
  ]

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>프로필</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <Image source={{ uri: "https://i.pravatar.cc/150?img=12" }} style={styles.avatar} />
        <Text style={styles.userName}>영화 애호가</Text>
        <Text style={styles.userEmail}>movie@lover.com</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>45</Text>
            <Text style={styles.statLabel}>관람</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>컬렉션</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>22</Text>
            <Text style={styles.statLabel}>연속 기록</Text>
          </View>
        </View>
      </View>

      {/* Collections Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="folder-outline" size={20} color={COLORS.gold} />
            <Text style={styles.sectionTitle}>내 컬렉션</Text>
          </View>
        </View>

        {/* Collection List */}
        <View style={styles.collectionList}>
          {collections.map((collection) => (
            <TouchableOpacity
              key={collection.id}
              style={styles.collectionItem}
              onPress={() => navigation.navigate("CollectionDetail", { id: collection.id })}
            >
              <View style={styles.collectionLeft}>
                <Ionicons
                  name={collection.isAuto ? "sparkles" : "folder"}
                  size={20}
                  color={collection.isAuto ? COLORS.gold : COLORS.white}
                />
                <View style={styles.collectionInfo}>
                  <Text style={styles.collectionName}>{collection.name}</Text>
                  <Text style={styles.collectionCount}>{collection.movieCount}편</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.lightGray} />
            </TouchableOpacity>
          ))}

          {/* Add New Collection Button */}
          <TouchableOpacity style={styles.addCollectionButton}>
            <Ionicons name="add-circle-outline" size={20} color={COLORS.gold} />
            <Text style={styles.addCollectionText}>새 컬렉션 만들기</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name={item.icon} size={24} color={COLORS.gold} />
              <Text style={styles.menuItemText}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.lightGray} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.red} />
        <Text style={styles.logoutText}>로그아웃</Text>
      </TouchableOpacity>

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
  },
  profileCard: {
    backgroundColor: COLORS.deepGray,
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: COLORS.gold,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.lightGray,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.gold,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.lightGray,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.darkNavy,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.white,
  },
  collectionList: {
    gap: 8,
  },
  collectionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.deepGray,
    padding: 16,
    borderRadius: 12,
  },
  collectionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionName: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.white,
    marginBottom: 2,
  },
  collectionCount: {
    fontSize: 13,
    color: COLORS.lightGray,
  },
  addCollectionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderStyle: "dashed",
    gap: 8,
  },
  addCollectionText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.gold,
  },
  menuSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.deepGray,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuItemText: {
    fontSize: 15,
    color: COLORS.white,
    fontWeight: "500",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.red,
    gap: 8,
  },
  logoutText: {
    fontSize: 15,
    color: COLORS.red,
    fontWeight: "600",
  },
  bottomPadding: {
    height: 40,
  },
})
