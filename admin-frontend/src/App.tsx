import { Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import { LoginPage } from './components/pages/LoginPage'
import { Dashboard } from './components/dashboard/Dashboard'
import { EmployeesPage } from './components/pages/EmployeesPage'
import { PromotionStatsPage } from './components/pages/PromotionStatsPage'
import { EmployeeFollowStatsPage } from './components/pages/EmployeeFollowStatsPage'
import { SettingsPage } from './components/pages/SettingsPage'
import { AccountsPage } from './components/pages/AccountsPage'

function App() {
  // TODO: Add real authentication check
  const isAuthenticated = true // For demo, always authenticated

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="promotion-stats" element={<PromotionStatsPage />} />
        <Route path="employee-follow-stats" element={<EmployeeFollowStatsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="accounts" element={<AccountsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App