import WORD_BANK from './word-bank.json' assert { type: 'json' }

const PALETTE = [
  '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3',
  '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
  '#FFC107', '#FF9800', '#FF5722', '#795548', '#9E9E9E', '#607D8B',
  '#E53935', '#8E24AA', '#1E88E5', '#00ACC1', '#43A047', '#F4511E',
]

/** Deterministic username from a numeric seed. Same seed → same name. */
export function generateUsername(seed: number, prefix = '普通的'): string {
  const index = Math.abs(seed) % WORD_BANK.length
  return `${prefix}${WORD_BANK[index] ?? '用户'}`
}

/** Deterministic avatar colour derived from username string. */
export function getAvatarColor(username: string): string {
  let hash = 0
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % PALETTE.length
  return PALETTE[index] ?? PALETTE[0]!
}
