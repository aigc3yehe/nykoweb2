import './App.css'
import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import Toast from './components/Toast'
import ConfirmDialog from './components/ui/ConfirmDialog'
import { dialogAtom } from './store/dialogStore';
import { useAtom, useSetAtom } from 'jotai'
import { modalAtom, closeImageDetails } from './store/modalStore'
import ImageDetailsModal from './components/ImageDetailsModal'
import ContentDetailModal from './components/modals/ContentDetailModal'
import { Analytics } from '@vercel/analytics/react'
import { initUserStateAtom } from './store/loginStore'
import LoginModal from './components/modals/LoginModal'
import Home from './pages/Home'
import Recipes from './pages/Recipes'
import AuthCallback from './pages/AuthCallback'
import Profile from './pages/Profile'
import WorkflowDetail from './pages/WorkflowDetail'
import ModelDetail from './pages/ModelDetail'
import WorkflowBuilder from './pages/WorkflowBuilder'

function App() {
  const [modalState] = useAtom(modalAtom)
  const [dialog] = useAtom(dialogAtom);
  const handleCloseImageDetails = useSetAtom(closeImageDetails)

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
          <Route path="/" element={<Home />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/recipes/:tab" element={<Recipes />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/workflow/:id" element={<WorkflowDetail />} />
          <Route path="/workflow/builder" element={<WorkflowBuilder />} />
          <Route path="/model/:id" element={<ModelDetail />} />
          <Route path="/api/auth/callback/google" element={<AuthCallback />} />
          {/* 其他路由... */}
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


        {/* 保持现有的模态框 */}
        {modalState.isImageDetailsOpen && modalState.selectedImage && (
          <ImageDetailsModal
            key={`image-detail-${modalState.selectedImage.id}`}
            image={modalState.selectedImage}
            imageDetail={modalState.imageDetail}
            isLoading={modalState.isLoading}
            error={modalState.error}
            onClose={handleCloseImageDetails}
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
