import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/auth.js'

function IconImage() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  )
}

function IconForum() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  )
}

function IconNovel() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  )
}

const FEATURES = [
  {
    to: '/text-to-image',
    title: '文字成图',
    desc: '将故事文本排版为精美图片，支持微博、小红书等多平台尺寸与批量导出',
    Icon: IconImage,
    chipClass: 'is-image',
  },
  {
    to: '/forum-post',
    title: '论坛截图',
    desc: '生成 BBS、Twitter、微博风格的帖子截图，楼层内容完全自定义',
    Icon: IconForum,
    chipClass: 'is-forum',
  },
  {
    to: '/visual-novel',
    title: '视觉小说',
    desc: '可视化编写分支剧情，上传立绘与背景，实时预览对话框与场景效果',
    Icon: IconNovel,
    chipClass: 'is-game',
  },
]

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="container fade-in">
      <div className="mb-12">
        <p className="eyebrow mb-3">同人创作工坊</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-3xl)', fontWeight: 600, color: 'var(--fg)' }}>
          {user ? `你好，${user.nickname}` : '欢迎回来'}
        </h1>
        <p className="mt-3" style={{ fontStyle: 'italic', color: 'var(--fg-3)', fontSize: 'var(--fs-md)' }}>
          选择一个工具，开始你的创作之旅
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {FEATURES.map((f) => (
          <Link
            key={f.to}
            to={f.to}
            className="card is-hoverable block"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="mb-4" style={{ color: 'var(--claret)' }}>
              <f.Icon />
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-xl)', marginBottom: 8 }}>
              {f.title}
            </h3>
            <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--fg-3)', lineHeight: 'var(--lh-loose)' }}>
              {f.desc}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
