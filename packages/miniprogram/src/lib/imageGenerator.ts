import Taro from '@tarojs/taro'
import type { ImageGeneratorOptions, ImageGeneratorResult } from '@fanfic/shared'

/**
 * WeChat Mini Program image generator.
 * Uses the wx Canvas 2D API instead of html2canvas (which doesn't run in MP).
 */
export async function generateImage(options: ImageGeneratorOptions): Promise<ImageGeneratorResult> {
  const { width, height, scale } = options
  const pixelWidth = width * scale
  const pixelHeight = height * scale

  return new Promise((resolve, reject) => {
    const canvas = Taro.createOffscreenCanvas({ type: '2d', width: pixelWidth, height: pixelHeight })
    const ctx = canvas.getContext('2d')
    if (!ctx) return reject(new Error('Failed to get canvas context'))

    // Caller is responsible for drawing onto the canvas via a render callback.
    // This stub exports the canvas as-is; full rendering is done in each feature's
    // MP-specific component which draws directly to this canvas before calling resolve.
    Taro.canvasToTempFilePath({
      canvas,
      fileType: 'png',
      success: (res) => {
        resolve({
          blob: new Blob(),
          dataUrl: res.tempFilePath,
          width: pixelWidth,
          height: pixelHeight,
        })
      },
      fail: (err) => reject(new Error(JSON.stringify(err))),
    })
  })
}

/** Load a custom font in the MP environment before drawing text. */
export async function loadFont(family: string, url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    Taro.loadFontFace({
      family,
      source: `url('${url}')`,
      success: () => resolve(),
      fail: (err) => reject(new Error(JSON.stringify(err))),
    })
  })
}

/** Save an image from a temp path to the device photo album. */
export async function saveToAlbum(tempFilePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    Taro.saveImageToPhotosAlbum({
      filePath: tempFilePath,
      success: () => resolve(),
      fail: (err) => reject(new Error(JSON.stringify(err))),
    })
  })
}
