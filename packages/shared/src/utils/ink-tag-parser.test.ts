import { describe, it, expect } from 'vitest'
import { parseInkTag } from './ink-tag-parser.js'

describe('parseInkTag', () => {
  it('parses show tag', () => {
    const result = parseInkTag('show: protagonist, happy, left')
    expect(result.type).toBe('show')
    expect(result.characterName).toBe('protagonist')
    expect(result.expression).toBe('happy')
    expect(result.position).toBe('left')
  })

  it('parses hide tag', () => {
    const result = parseInkTag('hide: protagonist')
    expect(result.type).toBe('hide')
    expect(result.characterName).toBe('protagonist')
  })

  it('parses bg tag', () => {
    const result = parseInkTag('bg: forest_day')
    expect(result.type).toBe('bg')
    expect(result.sceneName).toBe('forest_day')
  })

  it('parses music tag', () => {
    const result = parseInkTag('music: ambient_01')
    expect(result.type).toBe('music')
    expect(result.trackName).toBe('ambient_01')
  })

  it('parses save tag', () => {
    expect(parseInkTag('save').type).toBe('save')
  })

  it('handles unknown tags', () => {
    expect(parseInkTag('foo: bar').type).toBe('unknown')
  })
})
