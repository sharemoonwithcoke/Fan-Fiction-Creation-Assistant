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
    <div className="editor-shell">
      {/* Preview canvas */}
      <div className="editor-canvas" style={{ alignItems: 'flex-start', paddingTop: 40 }}>
        <div
          ref={previewRef}
          className="overflow-hidden"
          style={{
            width: 480,
            borderRadius: 12,
            boxShadow: 'var(--shadow-xl)',
            background: dark ? '#111827' : '#ffffff',
          }}
        >
          {postData.metadata.title && (
            <div
              style={{
                padding: '12px 16px',
                borderBottom: `1px solid ${dark ? '#374151' : '#E5E7EB'}`,
                fontWeight: 600,
                fontSize: 15,
                background: dark ? '#1F2937' : '#F9FAFB',
                color: dark ? '#F9FAFB' : '#111827',
              }}
            >
              {postData.metadata.title}
            </div>
          )}
          {postData.posts.map(renderPost)}
        </div>
      </div>

      {/* Controls rail */}
      <aside className="editor-rail">
        <div className="rail-section" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
            style={{ border: 'none', background: 'transparent', boxShadow: 'none', padding: '4px 0', fontWeight: 600, flex: 1 }}
          />
          <Button size="sm" variant="secondary" onClick={handleSave}>保存</Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="rail-section">
            <span className="rail-label">风格</span>
            <div className="segmented is-block">
              {(['bbs', 'twitter', 'weibo'] as PostStyle[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setPostData((d) => ({ ...d, style: s }))}
                  className={postData.style === s ? 'is-active' : ''}
                >
                  {s === 'bbs' ? '论坛' : s === 'twitter' ? 'Twitter' : '微博'}
                </button>
              ))}
            </div>
          </div>

          <div className="rail-section">
            <span className="rail-label">主题</span>
            <div className="segmented is-block">
              {(['light', 'dark'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setPostData((d) => ({ ...d, metadata: { ...d.metadata, theme: t } }))}
                  className={postData.metadata.theme === t ? 'is-active' : ''}
                >
                  {t === 'light' ? '浅色' : '深色'}
                </button>
              ))}
            </div>
          </div>

          <div className="rail-section">
            <div className="flex items-center justify-between mb-3">
              <span className="rail-label" style={{ marginBottom: 0 }}>楼层内容</span>
              <button
                onClick={addPost}
                className="btn is-ghost size-sm"
                style={{ padding: '3px 8px', fontSize: 12 }}
              >
                + 添加楼层
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {postData.posts.map((post) => (
                <div
                  key={post.id}
                  style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}
                >
                  <div
                    style={{ padding: '8px 12px', background: 'var(--paper-oat)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    onClick={() => setEditingFloor(editingFloor === post.floor ? null : post.floor)}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-2)' }}>
                      <span className="chip is-floor" style={{ marginRight: 6 }}>#{post.floor}</span>
                      {post.username}
                    </span>
                    <span style={{ color: 'var(--fg-muted)', fontSize: 11 }}>{editingFloor === post.floor ? '▲' : '▼'}</span>
                  </div>
                  {editingFloor === post.floor && (
                    <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <input
                        value={post.username}
                        onChange={(e) => updatePost(post.floor, { username: e.target.value })}
                        placeholder="用户名"
                        className="input"
                      />
                      <textarea
                        value={post.content}
                        onChange={(e) => updatePost(post.floor, { content: e.target.value })}
                        rows={4}
                        className="textarea"
                        style={{ minHeight: 80 }}
                      />
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1" style={{ fontSize: 12, color: 'var(--fg-3)', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={post.isOP}
                            onChange={(e) => updatePost(post.floor, { isOP: e.target.checked })}
                          />
                          楼主
                        </label>
                        <button
                          onClick={() => removePost(post.floor)}
                          style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--claret)', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rail-footer">
          <Button block onClick={handleExport} loading={exporting}>
            导出长图 ZIP
          </Button>
        </div>
      </aside>
    </div>
  )
}
