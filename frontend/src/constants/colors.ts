/**
 * Color Theme for Filmory App
 *
 * 모든 화면에서 일관된 색상을 사용하기 위한 중앙 집중식 색상 정의
 */

export const COLORS = {
  // Main colors
  darkNavy: "#1a1d29",    // 메인 배경색
  deepGray: "#2d2f3e",    // 카드 배경색
  gold: "#d4af37",        // 주요 액센트 (활성 상태, 별점)
  red: "#e74c3c",         // 보조 액센트 (로그아웃, 경고)

  // Text colors
  white: "#ffffff",       // 기본 텍스트
  lightGray: "#a0a0a0",   // 보조 텍스트

  // Additional colors (optional, for future use)
  darkGray: "#1f2230",    // 더 어두운 배경
  mediumGray: "#6b7280",  // 중간 회색
  success: "#10b981",     // 성공 메시지
  warning: "#f59e0b",     // 경고 메시지
  info: "#3b82f6",        // 정보 메시지
} as const

export type ColorKey = keyof typeof COLORS
