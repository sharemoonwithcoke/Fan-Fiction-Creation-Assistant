import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth.js'
import { useApi } from '../hooks/useApi.js'

const NAV_ITEMS = [
  { to: '/', label: '首页', exact: true },
  { to: '/projects', label: '我的项目' },
  { to: '/text-to-image', label: '文字成图' },
  { to: '/forum-post', label: '论坛截图' },
  { to: '/visual-novel', label: '视觉小说' },
]

export default function Layout() {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)
  const api = useApi()

  async function handleLogout() {
    try { await api.auth.logout() } catch { /* ignore */ }
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
        <nav className="flex items-center gap-1">
          <span className="font-bold text-primary-600 mr-4 text-lg">同人创作助手</span>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {user && (
            <span className="text-sm text-gray-500">{user.nickname}</span>
          )}
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            退出
          </button>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
