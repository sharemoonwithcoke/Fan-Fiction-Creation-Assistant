import { View, Text, Textarea, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { generateUsername, getAvatarColor } from '@fanfic/shared'
import type { PostItem } from '@fanfic/shared'

const INITIAL_POSTS: PostItem[] = [
  {
    id: '1',
    floor: 1,
    username: '楼主',
    content: '大家好！欢迎讨论~',
    isOP: true,
    isPinned: false,
    timestamp: new Date().toISOString(),
    engagement: { likes: 0, reposts: 0, comments: 0 },
  },
]

export default function ForumPostPage() {
  const [posts, setPosts] = useState<PostItem[]>(INITIAL_POSTS)

  function addPost() {
    const floor = posts.length + 1
    setPosts((p) => [
      ...p,
      {
        id: String(floor),
        floor,
        username: generateUsername(floor),
        content: '回复内容…',
        isOP: false,
        isPinned: false,
        timestamp: new Date().toISOString(),
        engagement: { likes: 0, reposts: 0, comments: 0 },
      },
    ])
  }

  async function handleExport() {
    Taro.showToast({ title: '请使用截图功能保存', icon: 'none' })
  }

  return (
    <View className="min-h-screen bg-gray-50">
      <View className="p-4 space-y-3">
        {posts.map((post) => (
          <View key={post.id} className="bg-white rounded-xl p-3 flex gap-3">
            <View
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: getAvatarColor(post.username) }}
            >
              <Text className="text-white">{post.username[0]}</Text>
            </View>
            <View className="flex-1">
              <View className="flex items-center gap-2 mb-1">
                <Text className="font-semibold text-sm text-gray-900">{post.username}</Text>
                {post.isOP && (
                  <Text className="text-xs bg-orange-100 text-orange-600 rounded px-1">楼主</Text>
                )}
              </View>
              <Textarea
                value={post.content}
                onInput={(e) =>
                  setPosts((pp) =>
                    pp.map((p) => (p.id === post.id ? { ...p, content: e.detail.value } : p)),
                  )
                }
                className="text-sm text-gray-700 w-full"
                autoHeight
              />
            </View>
          </View>
        ))}

        <Button onClick={addPost} className="w-full border border-gray-300 rounded-xl py-3 text-gray-600">
          + 添加楼层
        </Button>
        <Button onClick={handleExport} className="w-full bg-primary-600 text-white rounded-xl py-3">
          导出提示
        </Button>
      </View>
    </View>
  )
}
