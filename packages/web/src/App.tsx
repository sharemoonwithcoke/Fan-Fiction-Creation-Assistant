import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/auth.js'
import Layout from './components/Layout.js'
import LoginPage from './pages/LoginPage.js'
import RegisterPage from './pages/RegisterPage.js'
import DashboardPage from './pages/DashboardPage.js'
import TextToImagePage from './pages/TextToImagePage.js'
import ForumPostPage from './pages/ForumPostPage.js'
import VisualNovelPage from './pages/VisualNovelPage.js'
import ProjectsPage from './pages/ProjectsPage.js'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.accessToken)
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="text-to-image" element={<TextToImagePage />} />
        <Route path="text-to-image/:id" element={<TextToImagePage />} />
        <Route path="forum-post" element={<ForumPostPage />} />
        <Route path="forum-post/:id" element={<ForumPostPage />} />
        <Route path="visual-novel" element={<VisualNovelPage />} />
        <Route path="visual-novel/:id" element={<VisualNovelPage />} />
      </Route>
    </Routes>
  )
}
