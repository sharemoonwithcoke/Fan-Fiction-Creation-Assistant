import { Link } from 'react-router-dom'
import { useProjects, useDeleteProject } from '../hooks/useProjects.js'
import Button from '../components/Button.js'

const TYPE_LABELS: Record<string, string> = {
  image: '文字成图',
  forum: '论坛截图',
  game: '视觉小说',
}

const TYPE_PATH: Record<string, string> = {
  image: 'text-to-image',
  forum: 'forum-post',
  game: 'visual-novel',
}

export default function ProjectsPage() {
  const { data: projects, isLoading } = useProjects()
  const deleteProject = useDeleteProject()

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">加载中…</div>
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">我的项目</h1>
      {!projects?.length ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg mb-2">还没有项目</p>
          <p className="text-sm">前往工具页面创建第一个项目</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-gray-100 text-gray-600 rounded px-2 py-0.5">
                    {TYPE_LABELS[p.type]}
                  </span>
                </div>
                <h3 className="font-medium text-gray-900 truncate">{p.title}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(p.updated_at).toLocaleString('zh-CN')}
                </p>
              </div>
              <div className="flex gap-2 mt-auto">
                <Link
                  to={`/${TYPE_PATH[p.type]}/${p.id}`}
                  className="flex-1 text-center text-sm bg-primary-50 text-primary-700 rounded-lg px-3 py-1.5 hover:bg-primary-100 transition-colors"
                >
                  编辑
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                  loading={deleteProject.isPending}
                  onClick={() => {
                    if (confirm(`确认删除「${p.title}」？`)) {
                      deleteProject.mutate(p.id)
                    }
                  }}
                >
                  删除
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
