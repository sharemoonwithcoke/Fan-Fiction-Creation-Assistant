import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/auth.js'
import { useProjects } from '../hooks/useProjects.js'

const FEATURES = [
  {
    to: '/text-to-image',
    title: '文字成图',
    desc: '将故事文本转换为适合社交媒体的精美图片',
    icon: '🖼',
  },
  {
    to: '/forum-post',
    title: '论坛截图',
    desc: '生成逼真的论坛/微博/推特风格帖子截图',
    icon: '💬',
  },
  {
    to: '/visual-novel',
    title: '视觉小说',
    desc: '创作和体验完整的视觉小说游戏',
    icon: '🎮',
  },
]

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const { data: projects } = useProjects()

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">
        {user ? `你好，${user.nickname}！` : '欢迎回来！'}
      </h1>
      <p className="text-gray-500 mb-10">选择一个工具开始创作</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {FEATURES.map((f) => (
          <Link
            key={f.to}
            to={f.to}
            className="group block bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-primary-300 transition-all"
          >
            <div className="text-4xl mb-3">{f.icon}</div>
            <h2 className="font-semibold text-gray-900 text-lg mb-1 group-hover:text-primary-600 transition-colors">
              {f.title}
            </h2>
            <p className="text-sm text-gray-500">{f.desc}</p>
          </Link>
        ))}
      </div>

      {projects && projects.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">最近项目</h2>
            <Link to="/projects" className="text-sm text-primary-600 hover:underline">
              查看全部
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.slice(0, 6).map((p) => (
              <Link
                key={p.id}
                to={`/${p.type === 'image' ? 'text-to-image' : p.type === 'forum' ? 'forum-post' : 'visual-novel'}/${p.id}`}
                className="bg-white rounded-xl border border-gray-200 px-4 py-3 hover:border-primary-300 transition-colors"
              >
                <div className="font-medium text-gray-900 truncate">{p.title}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(p.updated_at).toLocaleDateString('zh-CN')}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
