import { describe, it, expect } from 'vitest'
import { generateUsername, getAvatarColor } from './username-generator.js'

describe('generateUsername', () => {
  it('is deterministic for same seed', () => {
    expect(generateUsername(42)).toBe(generateUsername(42))
  })

  it('differs for different seeds', () => {
    expect(generateUsername(1)).not.toBe(generateUsername(2))
  })

  it('uses prefix', () => {
    expect(generateUsername(0, '普通的')).toMatch(/^普通的/)
  })
})

describe('getAvatarColor', () => {
  it('is deterministic', () => {
    expect(getAvatarColor('test')).toBe(getAvatarColor('test'))
  })

  it('returns a valid hex colour', () => {
    expect(getAvatarColor('hello')).toMatch(/^#[0-9A-F]{6}$/i)
  })

  it('differs for different inputs', () => {
    expect(getAvatarColor('alice')).not.toBe(getAvatarColor('bob'))
  })
})
