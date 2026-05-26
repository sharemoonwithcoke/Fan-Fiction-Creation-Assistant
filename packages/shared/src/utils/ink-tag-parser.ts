import type { InkTag } from '../types/game.js'

/**
 * Parses Ink tags emitted by the runtime into structured commands.
 * Tag formats:
 *   show: character_name, expression_label, position
 *   hide: character_name
 *   bg: scene_name
 *   music: track_name
 *   save
 */
export function parseInkTag(raw: string): InkTag {
  const trimmed = raw.trim()

  const showMatch = trimmed.match(/^show:\s*(\w+),\s*(\w+),\s*(left|center|right)$/i)
  if (showMatch) {
    return {
      type: 'show',
      raw,
      characterName: showMatch[1],
      expression: showMatch[2],
      position: showMatch[3]!.toLowerCase() as 'left' | 'center' | 'right',
    }
  }

  const hideMatch = trimmed.match(/^hide:\s*(\w+)$/i)
  if (hideMatch) {
    return { type: 'hide', raw, characterName: hideMatch[1] }
  }

  const bgMatch = trimmed.match(/^bg:\s*(.+)$/i)
  if (bgMatch) {
    return { type: 'bg', raw, sceneName: bgMatch[1]!.trim() }
  }

  const musicMatch = trimmed.match(/^music:\s*(.+)$/i)
  if (musicMatch) {
    return { type: 'music', raw, trackName: musicMatch[1]!.trim() }
  }

  if (trimmed === 'save') {
    return { type: 'save', raw }
  }

  return { type: 'unknown', raw }
}

export function parseInkTags(tags: string[]): InkTag[] {
  return tags.map(parseInkTag)
}
