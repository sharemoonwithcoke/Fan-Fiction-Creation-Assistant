import { useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useProject, useCreateProject, useUpdateProject } from '../hooks/useProjects.js'
import { generateUsername, getAvatarColor } from '@fanfic/shared'
import { exportLongImageZip, triggerDownload } from '../lib/imageExport.js'
import html2canvas from 'html2canvas'
import type { PostData, PostItem, PostStyle, ForumProjectConfig } from '@fanfic/shared'
import Button from '../components/Button.js'

const DEFAULT_POST_DATA: PostData = {
  style: 'bbs',
  posts: [
    {
      id: '1',
      floor: 1,
      username: '楼主',
      content: '大家好！我写了一篇新同人文，欢迎阅读和讨论~\n\n这里是正文内容……',
      isOP: true,
      isPinned: true,
      timestamp: new Date().toISOString(),
      engagement: { likes: 42, reposts: 12, comments: 8 },
    },
  ],
  metadata: { totalFloors: 1, theme: 'light', title: '新同人文讨论帖' },
}

function BbsPost({ post, theme }: { post: PostItem; theme: 'light' | 'dark' }) {
  const color = getAvatarColor(post.username)
  const dark = theme === 'dark'
  return (
    <div
      className={`border-b last:border-b-0 px-4 py-3 ${dark ? 'border-gray-700' : 'border-gray-200'}`}
    >
      <div className="flex gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
          style={{ backgroundColor: color }}
        >
          {post.username[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-semibold text-sm ${dark ? 'text-gray-100' : 'text-gray-900'}`}>
              {post.username}
            </span>
            {post.isOP && (
              <span className="text-xs bg-orange-100 text-orange-600 rounded px-1.5 py-0.5">楼主</span>
            )}
            <span className={`text-xs ml-auto ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
              #{post.floor}楼
            </span>
          </div>
          <p className={`text-sm whitespace-pre-wrap ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
            {post.content}
          </p>
          <div className={`flex gap-4 mt-2 text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
            <span>👍 {post.engagement.likes}</span>
            <span>💬 {post.engagement.comments}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function TwitterPost({ post, theme }: { post: PostItem; theme: 'light' | 'dark' }) {
  const color = getAvatarColor(post.username)
  const dark = theme === 'dark'
  return (
    <div
      className={`border-b last:border-b-0 px-4 py-4 ${dark ? 'border-gray-800 bg-black' : 'border-gray-200 bg-white'}`}
    >
      <div className="flex gap-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
          style={{ backgroundColor: color }}
        >
          {post.username[0]}
        </div>
        <div className="flex-1">
          <div className="flex gap-1 items-center mb-0.5">
            <span className={`font-bold text-sm ${dark ? 'text-white' : 'text-gray-900'}`}>
              {post.username}
            </span>
            <span className={`text-sm ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
              · {new Date(post.timestamp).toLocaleDateString('zh-CN')}
            </span>
          </div>
          <p className={`text-sm whitespace-pre-wrap ${dark ? 'text-gray-100' : 'text-gray-800'}`}>
            {post.content}
          </p>
          <div className={`flex gap-6 mt-3 text-sm ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
            <span>💬 {post.engagement.comments}</span>
            <span>🔁 {post.engagement.reposts}</span>
            <span>❤️ {post.engagement.likes}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function WeiboPost({ post, theme }: { post: PostItem; theme: 'light' | 'dark' }) {
  const color = getAvatarColor(post.username)
  const dark = theme === 'dark'
  return (
    <div
      className={`px-4 py-4 border-b last:border-b-0 ${dark ? 'border-gray-700 bg-gray-900' : 'border-gray-100 bg-white'}`}
    >
      <div className="flex gap-3">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
          style={{ backgroundColor: color }}
        >
          {post.username[0]}
        </div>
        <div className="flex-1">
          <div className={`font-semibold text-sm mb-1 ${dark ? 'text-orange-300' : 'text-orange-500'}`}>
            {post.username}
          </div>
          <p className={`text-sm whitespace-pre-wrap ${dark ? 'text-gray-200' : 'text-gray-800'}`}>
            {post.content}
          </p>
          <div className={`flex gap-4 mt-2 text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
            <span>👍 {post.engagement.likes}</span>
            <span>📤 {post.engagement.reposts}</span>
            <span>💬 {post.engagement.comments}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ForumPostPage() {
  const { id } = useParams()
  const previewRef = useRef<HTMLDivElement>(null)
  const { data: project } = useProject(id ?? '')
  const createProject = useCreateProject()
  const updateProject = useUpdateProject(id ?? '')

  const storedConfig = project?.config as ForumProjectConfig | undefined
  const [postData, setPostData] = useState<PostData>(
    storedConfig?.postData ?? DEFAULT_POST_DATA,
  )
  const [title, setTitle] = useState(project?.title ?? '未命名论坛截图')
  const [exporting, setExporting] = useState(false)
  const [editingFloor, setEditingFloor] = useState<number | null>(null)

  function addPost() {
    const floor = postData.posts.length + 1
    const newPost: PostItem = {
      id: String(floor),
      floor,
      username: generateUsername(floor),
      content: '这里是楼中楼回复内容…',
      isOP: false,
      isPinned: false,
      timestamp: new Date().toISOString(),
      engagement: { likes: Math.floor(Math.random() * 30), reposts: 0, comments: 0 },
    }
    setPostData((d) => ({
      ...d,
      posts: [...d.posts, newPost],
      metadata: { ...d.metadata, totalFloors: floor },
    }))
  }

  function updatePost(floor: number, partial: Partial<PostItem>) {
    setPostData((d) => ({
      ...d,
      posts: d.posts.map((p) => (p.floor === floor ? { ...p, ...partial } : p)),
    }))
  }

  function removePost(floor: number) {
    setPostData((d) => ({
      ...d,
      posts: d.posts.filter((p) => p.floor !== floor).map((p, i) => ({ ...p, floor: i + 1 })),
      metadata: { ...d.metadata, totalFloors: d.posts.length - 1 },
    }))
  }

  async function handleExport() {
    if (!previewRef.current) return
    setExporting(true)
    try {
      await document.fonts.ready
      const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true, backgroundColor: null })
      const blob = await exportLongImageZip(canvas, 2000)
      triggerDownload(blob, `${title}.zip`)
    } finally {
      setExporting(false)
    }
  }

  async function handleSave() {
    const config: ForumProjectConfig = { type: 'forum', postData, maxHeightPerSlice: 2000 }
    if (id) {
      await updateProject.mutateAsync({ title, config })
    } else {
      await createProject.mutateAsync({ type: 'forum', title, config })
    }
  }

  const renderPost = (post: PostItem) => {
    const props = { post, theme: postData.metadata.theme }
    if (postData.style === 'twitter') return <TwitterPost key={post.id} {...props} />
    if (postData.style === 'weibo') return <WeiboPost key={post.id} {...props} />
    return <BbsPost key={post.id} {...props} />
  }

  const dark = postData.metadata.theme === 'dark'
  const bgClass = dark ? 'bg-gray-900' : 'bg-white'

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Preview */}
      <div className="flex-1 flex items-start justify-center bg-gray-100 p-8 overflow-auto">
        <div
          ref={previewRef}
          className={`w-[480px] rounded-lg overflow-hidden shadow-md ${bgClass}`}
        >
          {postData.metadata.title && (
            <div
              className={`px-4 py-3 border-b font-semibold ${
                dark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-900 border-gray-200'
              }`}
            >
              {postData.metadata.title}
            </div>
          )}
          {postData.posts.map(renderPost)}
        </div>
      </div>

      {/* Controls */}
      <aside className="w-80 bg-white border-l border-gray-200 overflow-y-auto flex flex-col scrollbar-thin">
        <div className="p-4 border-b border-gray-100 flex gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 text-sm border-none outline-none font-medium text-gray-700"
          />
          <Button size="sm" variant="secondary" onClick={handleSave}>保存</Button>
        </div>

        <div className="p-4 space-y-4 flex-1">
          <section>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">风格</label>
            <div className="flex gap-2">
              {(['bbs', 'twitter', 'weibo'] as PostStyle[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setPostData((d) => ({ ...d, style: s }))}
                  className={`flex-1 py-1.5 rounded text-xs border transition-colors ${
                    postData.style === s
                      ? 'bg-primary-100 border-primary-400 text-primary-700'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {s === 'bbs' ? '论坛' : s === 'twitter' ? 'Twitter' : '微博'}
                </button>
              ))}
            </div>
          </section>

          <section>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">主题</label>
            <div className="flex gap-2">
              {(['light', 'dark'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setPostData((d) => ({ ...d, metadata: { ...d.metadata, theme: t } }))}
                  className={`flex-1 py-1.5 rounded text-xs border transition-colors ${
                    postData.metadata.theme === t
                      ? 'bg-primary-100 border-primary-400 text-primary-700'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {t === 'light' ? '浅色' : '深色'}
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">楼层内容</label>
              <button onClick={addPost} className="text-xs text-primary-600 hover:underline">+ 添加楼层</button>
            </div>
            <div className="space-y-2">
              {postData.posts.map((post) => (
                <div key={post.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div
                    className="px-3 py-2 bg-gray-50 flex items-center justify-between cursor-pointer"
                    onClick={() => setEditingFloor(editingFloor === post.floor ? null : post.floor)}
                  >
                    <span className="text-sm font-medium text-gray-700">#{post.floor} {post.username}</span>
                    <span className="text-gray-400 text-xs">{editingFloor === post.floor ? '▲' : '▼'}</span>
                  </div>
                  {editingFloor === post.floor && (
                    <div className="p-3 space-y-2">
                      <input
                        value={post.username}
                        onChange={(e) => updatePost(post.floor, { username: e.target.value })}
                        placeholder="用户名"
                        className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none"
                      />
                      <textarea
                        value={post.content}
                        onChange={(e) => updatePost(post.floor, { content: e.target.value })}
                        rows={4}
                        className="w-full text-sm border border-gray-300 rounded px-2 py-1 resize-none focus:outline-none"
                      />
                      <div className="flex gap-2">
                        <label className="flex items-center gap-1 text-xs text-gray-600">
                          <input
                            type="checkbox"
                            checked={post.isOP}
                            onChange={(e) => updatePost(post.floor, { isOP: e.target.checked })}
                          />
                          楼主
                        </label>
                        <button
                          onClick={() => removePost(post.floor)}
                          className="text-xs text-red-500 hover:underline ml-auto"
                        >
                          删除楼层
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="p-4 border-t border-gray-100">
          <Button className="w-full" onClick={handleExport} loading={exporting}>
            导出长图 ZIP
          </Button>
        </div>
      </aside>
    </div>
  )
}
