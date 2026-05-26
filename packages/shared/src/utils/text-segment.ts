const SENTENCE_ENDINGS = /[。！？…!?]/

/**
 * Splits text into pages respecting sentence boundaries where possible.
 * Will not split mid-sentence if a clean break exists within `tolerance` chars of `maxChars`.
 */
export function segmentText(text: string, maxChars: number, tolerance = 50): string[] {
  if (text.length <= maxChars) return [text]

  const segments: string[] = []
  let remaining = text

  while (remaining.length > maxChars) {
    const window = remaining.slice(0, maxChars + tolerance)
    let breakPoint = -1

    // Search backwards from maxChars for a sentence ending
    for (let i = maxChars; i >= maxChars - tolerance && i >= 0; i--) {
      if (SENTENCE_ENDINGS.test(window[i] ?? '')) {
        breakPoint = i + 1
        break
      }
    }

    // If no sentence boundary found, look forward within tolerance
    if (breakPoint === -1) {
      for (let i = maxChars; i <= maxChars + tolerance && i < window.length; i++) {
        if (SENTENCE_ENDINGS.test(window[i] ?? '')) {
          breakPoint = i + 1
          break
        }
      }
    }

    // Hard break if no sentence boundary found anywhere
    if (breakPoint === -1) breakPoint = maxChars

    segments.push(remaining.slice(0, breakPoint))
    remaining = remaining.slice(breakPoint)
  }

  if (remaining.length > 0) segments.push(remaining)
  return segments
}
