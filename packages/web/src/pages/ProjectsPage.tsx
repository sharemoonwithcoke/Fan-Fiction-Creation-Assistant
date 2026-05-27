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

const TYPE_CHIP: Record<string, string> = {
  image: 'is-image',
  forum: 'is-forum',
  game: 'is-game',
}

export default function ProjectsPage() {
  const { data: projects, isLoading } = useProjects()
  const deleteProject = useDeleteProject()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64" style={{ color: 'var(--fg-muted)' }}>
        加载中…
      </div>
    )
  }

  return (
    <div className="container fade-in">
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-2xl)', fontWeight: 600, marginBottom: 28 }}>
        我的项目
      </h1>

      {!projects?.length ? (
        <div className="text-center py-20" style={{ color: 'var(--fg-muted)' }}>
          <p style={{ fontSize: 'var(--fs-lg)', marginBottom: 8 }}>还没有项目</p>
          <p style={{ fontSize: 'var(--fs-sm)' }}>前往工具页面创建第一个项目</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <div key={p.id} className="card flex flex-col gap-3" style={{ padding: '16px 18px' }}>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`chip ${TYPE_CHIP[p.type] ?? ''}`}>{TYPE_LABELS[p.type]}</span>
                </div>
                <h3 className="truncate" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-md)', marginBottom: 4 }}>
                  {p.title}
                </h3>
                <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--fg-muted)' }}>
                  {new Date(p.updated_at).toLocaleString('zh-CN')}
                </p>
              </div>
              <div className="flex gap-2 mt-auto">
                <Link
                  to={`/${TYPE_PATH[p.type]}/${p.id}`}
                  className="btn is-secondary size-sm flex-1 text-center"
                  style={{ textDecoration: 'none' }}
                >
                  编辑
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  loading={deleteProject.isPending}
                  onClick={() => { if (confirm(`确认删除「${p.title}」？`)) deleteProject.mutate(p.id) }}
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
