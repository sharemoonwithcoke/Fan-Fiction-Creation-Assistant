import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'

const FEATURES = [
  { path: '/pages/text-to-image/index', title: '文字成图', icon: '🖼' },
  { path: '/pages/forum-post/index', title: '论坛截图', icon: '💬' },
  { path: '/pages/visual-novel/index', title: '视觉小说', icon: '🎮' },
]

export default function IndexPage() {
  return (
    <View className="min-h-screen bg-gray-50 p-4">
      <View className="pt-8 pb-6">
        <Text className="text-2xl font-bold text-gray-900">同人创作助手</Text>
        <Text className="text-gray-500 text-sm mt-1 block">选择工具开始创作</Text>
      </View>
      <View className="space-y-3">
        {FEATURES.map((f) => (
          <View
            key={f.path}
            className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4 active:bg-gray-50"
            onClick={() => Taro.navigateTo({ url: f.path })}
          >
            <Text className="text-3xl">{f.icon}</Text>
            <Text className="text-lg font-medium text-gray-900">{f.title}</Text>
            <Text className="ml-auto text-gray-400">›</Text>
          </View>
        ))}
      </View>
    </View>
  )
}
