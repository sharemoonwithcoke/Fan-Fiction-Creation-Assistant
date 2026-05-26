/**
 * Slices a tall canvas into equal-height segments for long-image export.
 * Returns an array of canvas elements, each at most `maxHeight` pixels tall.
 */
export function splitImageByHeight(
  canvas: HTMLCanvasElement,
  maxHeight: number,
): HTMLCanvasElement[] {
  const { width, height } = canvas
  if (height <= maxHeight) return [canvas]

  const slices: HTMLCanvasElement[] = []
  let y = 0

  while (y < height) {
    const sliceHeight = Math.min(maxHeight, height - y)
    const slice = document.createElement('canvas')
    slice.width = width
    slice.height = sliceHeight
    const ctx = slice.getContext('2d')!
    ctx.drawImage(canvas, 0, y, width, sliceHeight, 0, 0, width, sliceHeight)
    slices.push(slice)
    y += sliceHeight
  }

  return slices
}

/** Converts a canvas element to a PNG Blob. */
export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('canvas.toBlob returned null'))
    }, 'image/png')
  })
}
