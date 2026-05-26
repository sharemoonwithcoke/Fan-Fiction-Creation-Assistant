import html2canvas from 'html2canvas'
import JSZip from 'jszip'
import { splitImageByHeight, canvasToBlob, segmentText } from '@fanfic/shared'
import type { ImageGeneratorOptions, ImageGeneratorResult } from '@fanfic/shared'

export async function generateImage(options: ImageGeneratorOptions): Promise<ImageGeneratorResult> {
  const el = options.element ?? document.getElementById(options.elementId!)
  if (!el) throw new Error('Target element not found')

  // Font guard — must be awaited before any screenshot
  await document.fonts.ready

  const canvas = await html2canvas(el as HTMLElement, {
    scale: options.scale,
    useCORS: true,
    allowTaint: false,
    backgroundColor: null,
    logging: false,
  })

  let finalCanvas = canvas

  if (options.rotation !== 0) {
    const rad = (options.rotation * Math.PI) / 180
    const rotated = document.createElement('canvas')
    const swap = options.rotation === 90 || options.rotation === -90
    rotated.width = swap ? canvas.height : canvas.width
    rotated.height = swap ? canvas.width : canvas.height
    const ctx = rotated.getContext('2d')!
    ctx.translate(rotated.width / 2, rotated.height / 2)
    ctx.rotate(rad)
    ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2)
    finalCanvas = rotated
  }

  const blob = await canvasToBlob(finalCanvas)
  return { blob, width: finalCanvas.width, height: finalCanvas.height }
}

export async function exportMultiPageZip(
  text: string,
  maxChars: number,
  renderPage: (text: string, pageIndex: number) => Promise<ImageGeneratorResult>,
): Promise<Blob> {
  const pages = segmentText(text, maxChars)
  const zip = new JSZip()

  for (let i = 0; i < pages.length; i++) {
    const result = await renderPage(pages[i]!, i)
    zip.file(`page-${String(i + 1).padStart(3, '0')}.png`, result.blob)
  }

  return zip.generateAsync({ type: 'blob' })
}

export async function exportLongImageZip(
  canvas: HTMLCanvasElement,
  maxHeight: number,
): Promise<Blob> {
  const slices = splitImageByHeight(canvas, maxHeight)
  const zip = new JSZip()

  for (let i = 0; i < slices.length; i++) {
    const blob = await canvasToBlob(slices[i]!)
    zip.file(`slice-${String(i + 1).padStart(3, '0')}.png`, blob)
  }

  return zip.generateAsync({ type: 'blob' })
}

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
