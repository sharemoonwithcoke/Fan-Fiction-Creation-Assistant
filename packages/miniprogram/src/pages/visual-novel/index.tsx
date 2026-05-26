import { View, Text } from '@tarojs/components'
import { useState } from 'react'
import type { StoryScript, VisualAssetMap } from '@fanfic/shared'
import { useVisualStoryPlayer } from '../../hooks/useVisualStoryPlayer.js'

const DEMO_SCRIPT: StoryScript = {
  startSectionId: 'start',
  sections: [
    {
      id: 'start',
      name: '开始',
      blocks: [
        { id: 'b1', type: 'narration', text: '这是一个演示剧本。' },
        { id: 'b2', type: 'choice', options: [
          { id: 'o1', label: '选项一', targetSectionId: 'a' },
          { id: 'o2', label: '选项二', targetSectionId: 'b' },
        ]},
      ],
    },
    {
      id: 'a',
      name: '路线A',
      blocks: [
        { id: 'a1', type: 'narration', text: '你选择了路线A。' },
        { id: 'a2', type: 'end' },
      ],
    },
    {
      id: 'b',
      name: '路线B',
      blocks: [
        { id: 'b1b', type: 'narration', text: '你选择了路线B。' },
        { id: 'b2b', type: 'end' },
      ],
    },
  ],
}

const EMPTY_ASSETS: VisualAssetMap = { characters: [], backgrounds: [], music: [] }

export default function VisualNovelPage() {
  const [script] = useState(DEMO_SCRIPT)
  const { displayText, speaker, choices, isEnded, isStarted, start, next, choose } =
    useVisualStoryPlayer(script, EMPTY_ASSETS)

  function handleTap() {
    if (!isStarted) { start(); return }
    if (choices.length === 0 && !isEnded) next()
  }

  return (
    <View className="min-h-screen bg-gray-900 flex flex-col" onClick={handleTap}>
      <View className="flex-1 flex items-center justify-center">
        <Text className="text-gray-600 text-sm">（背景/立绘占位）</Text>
      </View>

      <View className="bg-blue-900/90 mx-4 mb-4 rounded-2xl p-5">
        {speaker ? <Text className="text-yellow-300 text-sm font-bold block mb-1">{speaker}</Text> : null}
        <Text className="text-white text-lg leading-relaxed block min-h-[4em]">
          {isStarted ? displayText : '点击开始'}
        </Text>

        {choices.length > 0 && (
          <View className="flex flex-col gap-2 mt-4">
            {choices.map((c) => (
              <View
                key={c.id}
                className="bg-white/10 rounded-xl px-4 py-3"
                onClick={(e) => { e.stopPropagation(); choose(c.targetSectionId) }}
              >
                <Text className="text-white text-sm">{c.label}</Text>
              </View>
            ))}
          </View>
        )}

        {isEnded && (
          <Text className="text-white/50 text-sm block mt-3">— 完 —</Text>
        )}
      </View>
    </View>
  )
}
