import React from "react"
import { Image, Platform, StyleSheet, Text, View } from "react-native"

import { BRAND_LOCKUP_RATIO } from "../constants/branding"
import { COLORS } from "../constants/colors"

const PLAQUE_LOCKUP = require("../../assets/branding/cineentry-logo-lockup.png")
const IMMERSIVE_LOCKUP = require("../../assets/branding/cineentry-logo-loading.png")

type BrandMarkVariant = "plaque" | "immersive"

type BrandMarkProps = {
  width?: number
  subtitle?: string
  variant?: BrandMarkVariant
}

export default function BrandMark({
  width = 260,
  subtitle,
  variant = "plaque",
}: BrandMarkProps) {
  const isImmersive = variant === "immersive"
  const androidSharpImageProps =
    Platform.OS === "android"
      ? ({
          resizeMethod: "resize",
          resizeMultiplier: 2,
        } as const)
      : undefined
  const radius = Math.max(16, Math.round(width * 0.08))
  const height = width / BRAND_LOCKUP_RATIO
  const source = isImmersive ? IMMERSIVE_LOCKUP : PLAQUE_LOCKUP

  return (
    <View style={styles.container}>
      <Image
        source={source}
        style={[
          isImmersive ? styles.logoImmersive : styles.logoPlaque,
          {
            width,
            height,
            borderRadius: isImmersive ? 0 : radius,
          },
        ]}
        resizeMode="contain"
        {...(androidSharpImageProps as any)}
        accessibilityLabel="CineEntry 로고"
        fadeDuration={0}
      />
      {subtitle ? (
        <Text style={[styles.subtitle, isImmersive && styles.subtitleImmersive]}>{subtitle}</Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  logoPlaque: {
    backgroundColor: "#E7E8E4",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 16,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 14,
    },
    shadowOpacity: 0.24,
    shadowRadius: 24,
    elevation: 8,
  },
  logoImmersive: {
    marginBottom: 14,
  },
  subtitle: {
    color: COLORS.lightGray,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  subtitleImmersive: {
    color: "rgba(255,255,255,0.72)",
  },
})
