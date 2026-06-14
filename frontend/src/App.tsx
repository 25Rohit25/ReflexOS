import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '@/store/useAuthStore'
import { initializeWorkspace } from '@/store/useWorkspaceStore'

// Layouts
import { AuthLayout } from '@/features/auth/AuthLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'

// Pages
import { Login } from '@/features/auth/Login'
import { Register } from '@/features/auth/Register'
import { ProjectList } from '@/features/project/ProjectList'
import { TaskBoard } from '@/features/task/TaskBoard'
import TeamChat from '@/features/chat/TeamChat'
import KnowledgeBase from '@/features/knowledge/KnowledgeBase'
import { MeetingIntelligence } from '@/features/meetings/MeetingIntelligence'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  const initializeAuth = useAuthStore(state => state.initialize)

  useEffect(() => {
    initializeAuth()
    initializeWorkspace()
  }, [initializeAuth])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected Dashboard Routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<ProjectList />} />
            <Route path="/projects/:projectId/tasks" element={<TaskBoard />} />
            {/* Placeholders for upcoming features */}
            <Route path="/tasks" element={<div className="p-4">Global Tasks View (Coming Soon)</div>} />
            <Route path="/projects/:projectId/chat" element={
              <div className="p-4 h-[calc(100vh-4rem)] flex items-center justify-center">
                <TeamChat />
              </div>
            } />
            <Route path="/projects/:projectId/knowledge" element={<KnowledgeBase />} />
            <Route path="/projects/:projectId/meetings" element={<MeetingIntelligence />} />
            <Route path="/settings" element={<div className="p-4">Settings (Coming Soon)</div>} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
