import { Link } from 'react-router-dom'

const FEATURES = [
  {
    to: '/text-to-image',
    title: '文字成图',
    desc: '将故事文本排版为精美图片，支持多平台尺寸与批量导出',
    icon: '🖼',
  },
  {
    to: '/forum-post',
    title: '论坛截图',
    desc: '生成 BBS / 推特 / 微博风格的帖子截图，完全本地合成',
    icon: '💬',
  },
  {
    to: '/visual-novel',
    title: '视觉小说',
    desc: '用 Ink 脚本编写分支剧情，实时预览立绘与对话框效果',
    icon: '🎮',
  },
]

export default function DashboardPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">同人创作工坊</h1>
      <p className="text-gray-500 mb-12">选择一个工具，开始创作</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {FEATURES.map((f) => (
          <Link
            key={f.to}
            to={f.to}
            className="group block bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-primary-300 transition-all"
          >
            <div className="text-4xl mb-4">{f.icon}</div>
            <h2 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-primary-600 transition-colors">
              {f.title}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
