import { useState, useCallback, useRef } from 'react'
import { Story } from 'inkjs'
import type { InkState } from '@fanfic/shared'

export interface UseInkStoryReturn {
  currentText: string
  currentTags: string[]
  currentChoices: { index: number; text: string }[]
  canContinue: boolean
  isStarted: boolean
  choose: (index: number) => void
  advance: () => void
  saveState: () => InkState
  loadState: (state: InkState) => void
  reset: () => void
}

export function useInkStory(script: string, initialState?: InkState): UseInkStoryReturn {
  const storyRef = useRef<InstanceType<typeof Story> | null>(null)
  const [currentText, setCurrentText] = useState('')
  const [currentTags, setCurrentTags] = useState<string[]>([])
  const [currentChoices, setCurrentChoices] = useState<{ index: number; text: string }[]>([])
  const [canContinue, setCanContinue] = useState(false)
  const [isStarted, setIsStarted] = useState(false)

  function getOrCreateStory() {
    if (!storyRef.current) {
      storyRef.current = new Story(script)
      if (initialState) {
        storyRef.current.state.LoadJson(JSON.stringify(initialState))
      }
    }
    return storyRef.current
  }

  function syncState(story: InstanceType<typeof Story>) {
    setCanContinue(story.canContinue)
    setCurrentChoices(
      story.currentChoices.map((c, i) => ({ index: i, text: c.text })),
    )
  }

  const advance = useCallback(() => {
    const story = getOrCreateStory()
    if (!story.canContinue) return

    let text = ''
    const tags: string[] = []

    while (story.canContinue) {
      text += story.Continue()
      if (story.currentTags) tags.push(...story.currentTags)
    }

    setCurrentText(text.trim())
    setCurrentTags(tags)
    setIsStarted(true)
    syncState(story)
  }, [script])

  const choose = useCallback((index: number) => {
    const story = getOrCreateStory()
    story.ChooseChoiceIndex(index)
    advance()
  }, [advance])

  const saveState = useCallback((): InkState => {
    const story = getOrCreateStory()
    return JSON.parse(story.state.ToJson()) as InkState
  }, [])

  const loadState = useCallback((state: InkState) => {
    const story = getOrCreateStory()
    story.state.LoadJson(JSON.stringify(state))
    syncState(story)
  }, [])

  const reset = useCallback(() => {
    storyRef.current = null
    setCurrentText('')
    setCurrentTags([])
    setCurrentChoices([])
    setCanContinue(false)
    setIsStarted(false)
  }, [])

  if (!isStarted && script) {
    const story = getOrCreateStory()
    if (story.canContinue && !currentText) {
      // Don't advance automatically — caller must call advance()
      setCanContinue(story.canContinue)
    }
  }

  return { currentText, currentTags, currentChoices, canContinue, isStarted, choose, advance, saveState, loadState, reset }
}
