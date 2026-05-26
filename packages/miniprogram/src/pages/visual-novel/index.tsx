import { View, Text } from '@tarojs/components'
import { useState } from 'react'
import { useInkStory } from '../../hooks/useInkStory.js'

const DEMO_SCRIPT = `
=== start ===
旁白：这是一个演示剧本。
-> choice_point

=== choice_point ===
* [选项一]
  主角：我选了选项一。
  -> END
* [选项二]
  主角：我选了选项二。
  -> END
`.trim()

export default function VisualNovelPage() {
  const [script] = useState(DEMO_SCRIPT)
  const { currentText, currentChoices, canContinue, isStarted, advance, choose } =
    useInkStory(script)

  return (
    <View className="min-h-screen bg-gray-900 flex flex-col">
      <View className="flex-1 flex items-center justify-center p-8">
        <Text className="text-gray-400 text-sm">（背景/立绘占位符）</Text>
      </View>

      {/* Dialogue box */}
      <View className="bg-blue-900/90 mx-4 mb-4 rounded-2xl p-5" onClick={canContinue ? advance : undefined}>
        <Text className="text-white text-lg leading-relaxed block min-h-[4em]">
          {isStarted ? currentText : '点击开始'}
        </Text>
        {currentChoices.length > 0 && (
          <View className="flex flex-col gap-2 mt-4">
            {currentChoices.map((c) => (
              <View
                key={c.index}
                className="bg-white/10 rounded-xl px-4 py-3 active:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation()
                  choose(c.index)
                }}
              >
                <Text className="text-white text-sm">{c.text}</Text>
              </View>
            ))}
          </View>
        )}
        {!isStarted && (
          <View className="mt-3" onClick={advance}>
            <Text className="text-white/60 text-sm">点击开始</Text>
          </View>
        )}
      </View>
    </View>
  )
}
