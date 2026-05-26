import { useRef, useState, useCallback } from 'react'
import type { StoryScript, VisualAssetMap, VisualSceneState, ChoiceOption } from '@fanfic/shared'

interface PlayerDisplay {
  displayText: string
  speaker: string
  choices: ChoiceOption[]
  sceneState: VisualSceneState
  isEnded: boolean
  isStarted: boolean
}

const EMPTY_SCENE: VisualSceneState = { backgroundId: null, musicId: null, visibleCharacters: [] }

export function useVisualStoryPlayer(script: StoryScript, assets: VisualAssetMap) {
  const sectionIdRef = useRef(script.startSectionId)
  const blockIdxRef = useRef(0)
  const sceneRef = useRef<VisualSceneState>(EMPTY_SCENE)

  const [display, setDisplay] = useState<PlayerDisplay>({
    displayText: '',
    speaker: '',
    choices: [],
    sceneState: EMPTY_SCENE,
    isEnded: false,
    isStarted: false,
  })

  // Walk forward from current position until a pause point
  function runUntilPause(sectionId: string, startIdx: number, scene: VisualSceneState) {
    const section = script.sections.find((s) => s.id === sectionId)
    if (!section) return

    let s = { ...scene, visibleCharacters: [...scene.visibleCharacters] }
    let i = startIdx

    while (i < section.blocks.length) {
      const block = section.blocks[i]!
      i++

      switch (block.type) {
        case 'narration':
          sceneRef.current = s
          blockIdxRef.current = i
          setDisplay({ displayText: block.text, speaker: '', choices: [], sceneState: s, isEnded: false, isStarted: true })
          return

        case 'dialogue': {
          const char = assets.characters.find((c) => c.id === block.characterId)
          const charName = char?.name ?? ''
          const others = s.visibleCharacters.filter((c) => c.characterId !== block.characterId)
          s = { ...s, visibleCharacters: [...others, { characterId: block.characterId, expression: block.expression, position: block.position }] }
          sceneRef.current = s
          blockIdxRef.current = i
          setDisplay({ displayText: block.text, speaker: charName, choices: [], sceneState: s, isEnded: false, isStarted: true })
          return
        }

        case 'scene': {
          if (block.backgroundId !== undefined) s = { ...s, backgroundId: block.backgroundId }
          if (block.musicId !== undefined) s = { ...s, musicId: block.musicId }
          break
        }

        case 'show': {
          const others = s.visibleCharacters.filter((c) => c.characterId !== block.characterId)
          s = { ...s, visibleCharacters: [...others, { characterId: block.characterId, expression: block.expression, position: block.position }] }
          break
        }

        case 'hide': {
          s = { ...s, visibleCharacters: s.visibleCharacters.filter((c) => c.characterId !== block.characterId) }
          break
        }

        case 'choice':
          sceneRef.current = s
          blockIdxRef.current = i
          setDisplay({ displayText: '', speaker: '', choices: block.options, sceneState: s, isEnded: false, isStarted: true })
          return

        case 'end':
          sceneRef.current = s
          blockIdxRef.current = i
          setDisplay({ displayText: '', speaker: '', choices: [], sceneState: s, isEnded: true, isStarted: true })
          return
      }
    }

    // Fell off the end of the section without an explicit end block
    sceneRef.current = s
    blockIdxRef.current = i
    setDisplay({ displayText: '', speaker: '', choices: [], sceneState: s, isEnded: true, isStarted: true })
  }

  const start = useCallback(() => {
    const sid = script.startSectionId
    sectionIdRef.current = sid
    blockIdxRef.current = 0
    sceneRef.current = EMPTY_SCENE
    runUntilPause(sid, 0, EMPTY_SCENE)
  }, [script, assets])

  const next = useCallback(() => {
    if (display.choices.length > 0 || display.isEnded) return
    runUntilPause(sectionIdRef.current, blockIdxRef.current, sceneRef.current)
  }, [display.choices, display.isEnded])

  const choose = useCallback((targetSectionId: string) => {
    sectionIdRef.current = targetSectionId
    blockIdxRef.current = 0
    runUntilPause(targetSectionId, 0, sceneRef.current)
  }, [])

  const reset = useCallback(() => {
    sectionIdRef.current = script.startSectionId
    blockIdxRef.current = 0
    sceneRef.current = EMPTY_SCENE
    setDisplay({ displayText: '', speaker: '', choices: [], sceneState: EMPTY_SCENE, isEnded: false, isStarted: false })
  }, [script.startSectionId])

  return { ...display, start, next, choose, reset }
}
