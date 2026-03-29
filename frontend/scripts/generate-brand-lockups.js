#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

const Jimp = require("jimp-compact")

const ROOT_DIR = path.resolve(__dirname, "..", "..")
const SOURCE_PATH = path.join(ROOT_DIR, "docs", "logo", "cineentry-logo3.png")
const OUTPUT_DIR = path.join(ROOT_DIR, "frontend", "assets", "branding")

const BASE_WIDTH = 648
const BASE_HEIGHT = 224
const BASE_PADDING_X = 24
const BASE_PADDING_Y = 24
const SCALE_FACTORS = [1, 2, 3]

const BBOX_THRESHOLD = 20
const MASK_THRESHOLD = 10
const MASK_GAMMA = 0.78

const PLAQUE_BG = { r: 231, g: 232, b: 228 }
const PLAQUE_FG = { r: 59, g: 68, b: 70 }
const LOADING_FG = { r: 245, g: 239, b: 216 }

function colorDelta(color, bg) {
  return (
    Math.abs(color.r - bg.r) +
    Math.abs(color.g - bg.g) +
    Math.abs(color.b - bg.b)
  )
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function rgbaToInt({ r, g, b, a = 255 }) {
  return Jimp.rgbaToInt(r, g, b, a)
}

function getPixel(image, x, y) {
  return Jimp.intToRGBA(image.getPixelColor(x, y))
}

function findLogoBounds(image, bgColor) {
  let minX = image.bitmap.width
  let minY = image.bitmap.height
  let maxX = -1
  let maxY = -1

  for (let y = 0; y < image.bitmap.height; y += 1) {
    for (let x = 0; x < image.bitmap.width; x += 1) {
      const delta = colorDelta(getPixel(image, x, y), bgColor)
      if (delta <= BBOX_THRESHOLD) continue

      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
    }
  }

  if (maxX < minX || maxY < minY) {
    throw new Error("로고 bbox를 찾지 못했습니다.")
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  }
}

function buildMaskStats(image, bgColor) {
  let maxDelta = 0

  for (let y = 0; y < image.bitmap.height; y += 1) {
    for (let x = 0; x < image.bitmap.width; x += 1) {
      const delta = colorDelta(getPixel(image, x, y), bgColor)
      if (delta > maxDelta) {
        maxDelta = delta
      }
    }
  }

  return {
    maxDelta: Math.max(maxDelta, MASK_THRESHOLD + 1),
  }
}

function buildMonochromeLogo(image, bgColor, foreground) {
  const logo = new Jimp(image.bitmap.width, image.bitmap.height, 0x00000000)
  const { maxDelta } = buildMaskStats(image, bgColor)

  for (let y = 0; y < image.bitmap.height; y += 1) {
    for (let x = 0; x < image.bitmap.width; x += 1) {
      const delta = colorDelta(getPixel(image, x, y), bgColor)
      const normalized = clamp((delta - MASK_THRESHOLD) / (maxDelta - MASK_THRESHOLD), 0, 1)
      const alpha = Math.round(Math.pow(normalized, MASK_GAMMA) * 255)

      if (alpha === 0) continue

      logo.setPixelColor(
        rgbaToInt({
          r: foreground.r,
          g: foreground.g,
          b: foreground.b,
          a: alpha,
        }),
        x,
        y
      )
    }
  }

  return logo
}

async function writeVariant(logo, fileBaseName, background, scale) {
  const width = BASE_WIDTH * scale
  const height = BASE_HEIGHT * scale
  const paddingX = BASE_PADDING_X * scale
  const paddingY = BASE_PADDING_Y * scale
  const innerWidth = width - paddingX * 2
  const innerHeight = height - paddingY * 2
  const scaleRatio = Math.min(innerWidth / logo.bitmap.width, innerHeight / logo.bitmap.height)
  const targetWidth = Math.max(1, Math.round(logo.bitmap.width * scaleRatio))
  const targetHeight = Math.max(1, Math.round(logo.bitmap.height * scaleRatio))
  const x = Math.round((width - targetWidth) / 2)
  const y = Math.round((height - targetHeight) / 2)
  const resized = logo.clone().resize(targetWidth, targetHeight, Jimp.RESIZE_BICUBIC)
  const canvas = new Jimp(
    width,
    height,
    background ? rgbaToInt(background) : 0x00000000
  )
  const suffix = scale === 1 ? "" : `@${scale}x`
  const outputPath = path.join(OUTPUT_DIR, `${fileBaseName}${suffix}.png`)

  canvas.composite(resized, x, y)
  await canvas.writeAsync(outputPath)

  return outputPath
}

async function main() {
  if (!fs.existsSync(SOURCE_PATH)) {
    throw new Error(`소스 로고를 찾지 못했습니다: ${SOURCE_PATH}`)
  }

  const source = await Jimp.read(SOURCE_PATH)
  const bgColor = getPixel(source, 0, 0)
  const bounds = findLogoBounds(source, bgColor)
  const cropped = source.clone().crop(bounds.x, bounds.y, bounds.width, bounds.height)

  const plaqueLogo = buildMonochromeLogo(cropped, bgColor, PLAQUE_FG)
  const loadingLogo = buildMonochromeLogo(cropped, bgColor, LOADING_FG)

  const written = []

  for (const scale of SCALE_FACTORS) {
    written.push(await writeVariant(plaqueLogo, "cineentry-logo-lockup", PLAQUE_BG, scale))
    written.push(await writeVariant(loadingLogo, "cineentry-logo-loading", null, scale))
  }

  for (const file of written) {
    const relative = path.relative(ROOT_DIR, file)
    console.log(`wrote ${relative}`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
