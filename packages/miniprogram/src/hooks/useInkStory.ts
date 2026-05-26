import { useState, useCallback, useRef } from 'react'
import { Story } from 'inkjs'
import type { InkState } from '@fanfic/shared'

export function useInkStory(script: string, initialState?: InkState) {
  const storyRef = useRef<InstanceType<typeof Story> | null>(null)
  const [currentText, setCurrentText] = useState('')
  const [currentChoices, setCurrentChoices] = useState<{ index: number; text: string }[]>([])
  const [canContinue, setCanContinue] = useState(false)
  const [isStarted, setIsStarted] = useState(false)

  function getOrCreateStory() {
    if (!storyRef.current) {
      storyRef.current = new Story(script)
      if (initialState) storyRef.current.state.LoadJson(JSON.stringify(initialState))
    }
    return storyRef.current
  }

  const advance = useCallback(() => {
    const story = getOrCreateStory()
    if (!story.canContinue) return

    let text = ''
    while (story.canContinue) text += story.Continue()

    setCurrentText(text.trim())
    setCanContinue(story.canContinue)
    setCurrentChoices(story.currentChoices.map((c, i) => ({ index: i, text: c.text })))
    setIsStarted(true)
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
    setCanContinue(story.canContinue)
    setCurrentChoices(story.currentChoices.map((c, i) => ({ index: i, text: c.text })))
  }, [])

  return { currentText, currentChoices, canContinue, isStarted, advance, choose, saveState, loadState }
}
