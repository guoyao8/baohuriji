import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './stores/auth'
import { useReminderStore } from './stores/reminder'
import { notificationService } from './services/notification'
import Layout from './components/Layout/Layout'
import Login from './pages/Login'
import Home from './pages/Home'
import AddRecord from './pages/AddRecord'
import Statistics from './pages/Statistics'
import Settings from './pages/Settings'
import BabyProfile from './pages/BabyProfile'
import AddBaby from './pages/AddBaby'
import FamilySettings from './pages/FamilySettings'
import ReminderSettings from './pages/ReminderSettings'
import BackendSettings from './pages/BackendSettings'

function App() {
  const { user, checkUser } = useAuthStore()
  const { checkReminders } = useReminderStore()

  useEffect(() => {
    checkUser()
  }, [checkUser])

  // 启动提醒检查
  useEffect(() => {
    if (user) {
      // 启动提醒检查，每5分钟检查一次
      notificationService.startReminderCheck(5)
      
      // 立即执行一次检查
      checkReminders()
      
      // 启用后台同步
      notificationService.enableBackgroundSync()
      
      return () => {
        notificationService.stopReminderCheck()
      }
    }
  }, [user, checkReminders])

  return (
    <BrowserRouter>
      {!user ? (
        <Login />
      ) : (
        <Layout>
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/record/add" element={<AddRecord />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/baby" element={<BabyProfile />} />
            <Route path="/settings/baby/add" element={<AddBaby />} />
            <Route path="/settings/family" element={<FamilySettings />} />
            <Route path="/settings/reminders" element={<ReminderSettings />} />
            <Route path="/settings/backend" element={<BackendSettings />} />
            <Route path="/" element={<Navigate to="/home" replace />} />
          </Routes>
        </Layout>
      )}
    </BrowserRouter>
  )
}

export default App
