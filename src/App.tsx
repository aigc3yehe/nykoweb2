import './App.css'
import React from 'react'
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
import EditModelModal from './components/EditModelModal'
import EditWorkflowModal from './components/EditWorkflowModal'
import { ModelDetail } from "./store/modelStore.ts"
import { WorkflowDetail } from "./store/workflowStore.ts"
import Home from './pages/Home'
import Recipes from './pages/Recipes'

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

  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/recipes/:tab" element={<Recipes />} />
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

        {/* 其他模态框保持不变... */}

        <Analytics />
      </AppLayout>
    </BrowserRouter>
  )
}

export default App
