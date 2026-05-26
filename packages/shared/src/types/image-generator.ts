export interface ImageGeneratorOptions {
  elementId?: string
  element?: HTMLElement
  width: number
  height: number
  scale: 1 | 2 | 3
  rotation: 0 | 90 | -90 | 180
}

export interface ImageGeneratorResult {
  blob: Blob
  width: number
  height: number
  dataUrl?: string
}
