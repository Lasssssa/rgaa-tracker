import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ChatPage from './pages/ChatPage'
import ProjectsPage from './pages/ProjectsPage'
import ProjectDetailPage from './pages/ProjectDetailPage'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/projects" replace />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/chat" element={<ChatPage />} />
      </Route>
    </Routes>
  )
}

export default App
