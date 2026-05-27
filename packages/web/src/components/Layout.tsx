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
    <div className="app-shell">
      <header
        className="h-14 sticky top-0 z-40 flex items-center justify-between px-6"
        style={{
          background: 'var(--bg-elevated)',
          borderBottom: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <nav className="flex items-center gap-1">
          <NavLink
            to="/"
            className="mr-5 font-display font-semibold text-lg no-underline"
            style={{ color: 'var(--claret)', fontFamily: 'var(--font-display)', textDecoration: 'none' }}
          >
            同人创作助手
          </NavLink>
          {NAV_ITEMS.slice(1).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md text-sm font-medium transition-colors no-underline ${
                  isActive ? 'is-active-nav' : 'nav-link'
                }`
              }
              style={({ isActive }) => isActive
                ? { background: 'var(--accent-soft)', color: 'var(--claret)', textDecoration: 'none' }
                : { color: 'var(--fg-2)', textDecoration: 'none' }
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user && (
            <span className="text-sm" style={{ color: 'var(--fg-3)' }}>{user.nickname}</span>
          )}
          <button
            onClick={handleLogout}
            className="text-sm transition-colors"
            style={{ color: 'var(--fg-3)', background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseOver={(e) => (e.currentTarget.style.color = 'var(--fg)')}
            onMouseOut={(e) => (e.currentTarget.style.color = 'var(--fg-3)')}
          >
            退出
          </button>
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
