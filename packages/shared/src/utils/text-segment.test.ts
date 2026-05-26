import { describe, it, expect } from 'vitest'
import { segmentText } from './text-segment.js'

describe('segmentText', () => {
  it('returns single item when text is short', () => {
    expect(segmentText('短文本', 100)).toEqual(['短文本'])
  })

  it('splits on sentence boundaries', () => {
    const text = '第一句话。第二句话。第三句话。'
    const segments = segmentText(text, 8)
    expect(segments.every((s) => s.length > 0)).toBe(true)
    expect(segments.join('')).toBe(text)
  })

  it('hard-breaks when no boundary found', () => {
    const text = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNO'
    const segments = segmentText(text, 10, 0)
    expect(segments.join('')).toBe(text)
    expect(segments[0]!.length).toBe(10)
  })

  it('does not produce empty segments', () => {
    const text = '你好。世界！这是测试。内容继续走。'
    const segments = segmentText(text, 5)
    expect(segments.every((s) => s.length > 0)).toBe(true)
  })
})
