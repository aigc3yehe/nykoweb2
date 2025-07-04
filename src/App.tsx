import './App.css'
import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import MainLayout from './components/MainLayout'
import Toast from './components/Toast'
import ConfirmDialog from './components/ConfirmDialog'
import { useAtom, useSetAtom } from 'jotai'
import { modalAtom, closeImageDetails } from './store/modalStore'
import { accountPopupAtom, hideAccountPopupAtom } from './store/accountPopupStore'
import { exportKeyAtom, hideExportKeyAtom, showExportKeyAtom } from './store/exportKeyStore'
import ImageDetailsModal from './components/ImageDetailsModal'
import AccountPopup from './components/AccountPopup'
import ExportKeyModal from './components/ExportKeyModal'
import GeneratePopup from './components/GeneratePopup'
import { generatePopupAtom, hideGeneratePopupAtom } from './store/generatePopupStore'
import { Analytics } from '@vercel/analytics/react'
import { editModalAtom, hideEditModalAtom } from './store/editStore'
import { loginModalAtom, initUserStateAtom } from './store/loginStore'
import EditModelModal from './components/EditModelModal'
import EditWorkflowModal from './components/EditWorkflowModal'
import LoginModal from './components/modals/LoginModal'
import { ModelDetail } from "./store/modelStore.ts"
import { WorkflowDetail } from "./store/workflowStore.ts"
import Home from './pages/Home'
import Recipes from './pages/Recipes'
import AuthCallback from './pages/AuthCallback'
import Profile from './pages/Profile'

function App() {
  const [modalState] = useAtom(modalAtom)
  const [accountPopupState] = useAtom(accountPopupAtom)
  const [exportKeyState] = useAtom(exportKeyAtom)
  const [generatePopupState] = useAtom(generatePopupAtom)
  const hideAccountPopup = useSetAtom(hideAccountPopupAtom)
  const hideExportKey = useSetAtom(hideExportKeyAtom)
  const hideGeneratePopup = useSetAtom(hideGeneratePopupAtom)
  const showExportKey = useSetAtom(showExportKeyAtom)
  const handleCloseImageDetails = useSetAtom(closeImageDetails)
  const [editModalState] = useAtom(editModalAtom)
  const hideEditModal = useSetAtom(hideEditModalAtom)
  const [loginModalState] = useAtom(loginModalAtom)
  
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
          <Route path="/api/auth/callback/google" element={<AuthCallback />} />
          {/* 其他路由... */}
        </Routes>

        <Toast />
        <ConfirmDialog />

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

        {/* 其他模态框保持不变... */}

        <Analytics />
      </AppLayout>
    </BrowserRouter>
  )
}

export default App
