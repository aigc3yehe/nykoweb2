import './App.css'
import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import ConfirmDialog from './components/ui/ConfirmDialog'
import Toast from './components/ui/Toast'
import { dialogAtom } from './store/dialogStore';
import { useAtom, useSetAtom } from 'jotai'
import ContentDetailModal from './components/modals/ContentDetailModal'
import { Analytics } from '@vercel/analytics/react'
import { initUserStateAtom } from './store/loginStore'
import LoginModal from './components/modals/LoginModal'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Home from './pages/Home'
import Recipes from './pages/Recipes'
import AuthCallback from './pages/AuthCallback'
import Profile from './pages/Profile'
import Account from './pages/Account'
import WorkflowDetail from './pages/WorkflowDetail'
import ModelDetail from './pages/ModelDetail'
import WorkflowBuilder from './pages/WorkflowBuilder'
import StyleTrainer from './pages/StyleTrainer'
import Pricing from './pages/Pricing'
import ThemeDemoPage from './pages/ThemeDemo'

function App() {
  const [dialog] = useAtom(dialogAtom);

  // 初始化用户状态
  const initUserState = useSetAtom(initUserStateAtom)

  useEffect(() => {
    // 在应用启动时初始化用户状态
    initUserState()
  }, [])

  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          {/* 公开页面 - 不需要登录 */}
          <Route path=":lang" element={<ProtectedRoute requireAuth={false}><Home /></ProtectedRoute>} />
          <Route path=":lang/recipes" element={<ProtectedRoute requireAuth={false}><Recipes /></ProtectedRoute>} />
          <Route path=":lang/recipes/:tab" element={<ProtectedRoute requireAuth={false}><Recipes /></ProtectedRoute>} />
          <Route path=":lang/theme-demo" element={<ProtectedRoute requireAuth={false}><ThemeDemoPage /></ProtectedRoute>} />
          {/* 新增：无语言前缀的 OAuth 回调路径，保证第三方重定向可命中 */}
          <Route path="api/auth/callback/google" element={<AuthCallback />} />
          <Route path=":lang/api/auth/callback/google" element={<AuthCallback />} />

          {/* 公开详情页面 - 不需要登录 */}
          <Route path=":lang/workflow/:id" element={<ProtectedRoute requireAuth={false}><WorkflowDetail /></ProtectedRoute>} />
          <Route path=":lang/model/:id" element={<ProtectedRoute requireAuth={false}><ModelDetail /></ProtectedRoute>} />

          {/* 需要登录的页面 */}
          <Route path=":lang/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path=":lang/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path=":lang/pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
          <Route path=":lang/workflow/builder" element={<ProtectedRoute><WorkflowBuilder /></ProtectedRoute>} />
          <Route path=":lang/style/trainer" element={<ProtectedRoute><StyleTrainer /></ProtectedRoute>} />

          {/* 根路径重定向到默认语言 */}
          <Route path="/" element={<Navigate to="/en" replace />} />
          {/* 未知路径：如果形如 /xx 开头，重定向到 /xx（去除后缀）；否则回 /en */}
          <Route path=":lang/*" element={<Navigate to=".." replace />} />
          <Route path="*" element={<Navigate to="/en" replace />} />
        </Routes>

        <Toast />
        {/* 新 ConfirmDialog 通用弹窗 */}
        {dialog.open && (
          <ConfirmDialog
            open={dialog.open}
            title={dialog.title || 'Tips'}
            message={dialog.message}
            onConfirm={dialog.onConfirm}
            onCancel={dialog.onCancel}
            confirmText={dialog.confirmText}
            cancelText={dialog.cancelText}
          />
        )}

        {/* 登录模态框 */}
        <LoginModal />

        {/* 内容详情弹窗 */}
        <ContentDetailModal />

        {/* 其他模态框保持不变... */}

        <Analytics />
      </AppLayout>
    </BrowserRouter>
  )
}

export default App
