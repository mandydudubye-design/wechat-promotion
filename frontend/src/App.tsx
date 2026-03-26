import { Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import { LoginPage } from './components/pages/LoginPage'
import { Dashboard } from './components/dashboard/Dashboard'
import { EmployeesPage } from './components/pages/EmployeesPage'
import { FollowStatusPage } from './components/pages/FollowStatusPage'
import { PromotionPage } from './components/pages/PromotionPage'
import { ReportsPage } from './components/pages/ReportsPage'
import { SettingsPage } from './components/pages/SettingsPage'
import { AccountsPage } from './components/pages/AccountsPage'

function App() {
  // 检查是否有 token
  const token = localStorage.getItem('token')
  const isAuthenticated = !!token

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="follow-status" element={<FollowStatusPage />} />
        <Route path="promotion" element={<PromotionPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="accounts" element={<AccountsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App