import './App.css'
import { BrowserRouter } from 'react-router-dom'
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
import {ModelDetail} from "./store/modelStore.ts";
import {WorkflowDetail} from "./store/workflowStore.ts";

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
      <div className="container">
        <MainLayout />
        <Toast />
        <ConfirmDialog />

        {/* 图片详情模态框 */}
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

        {/* 账户弹窗 */}
        {accountPopupState.open && (
          <AccountPopup
            isOpen={true}
            onClose={hideAccountPopup}
            onExport={showExportKey} // 点击导出按钮时显示导出私钥弹窗
            onLogout={accountPopupState.onLogout}
            userData={accountPopupState.userData}
            anchorPosition={accountPopupState.anchorPosition}
          />
        )}

        {/* 导出私钥弹窗 */}
        {exportKeyState.open && (
          <ExportKeyModal
            isOpen={true}
            onClose={hideExportKey}
            onCancel={hideExportKey}
          />
        )}

        {/* 生成弹出框 */}
        {generatePopupState.open && (
          <GeneratePopup
            isOpen={true}
            onClose={hideGeneratePopup}
          />
        )}

        {/* 编辑模型弹窗 */}
        {editModalState.open && editModalState.type === 'model' && editModalState.data && (
          <EditModelModal
            isOpen={true}
            model={editModalState.data as ModelDetail}
            onClose={hideEditModal}
          />
        )}

        {/* 编辑工作流弹窗 */}
        {editModalState.open && editModalState.type === 'workflow' && editModalState.data && (
          <EditWorkflowModal
            isOpen={true}
            workflow={editModalState.data as WorkflowDetail}
            onClose={hideEditModal}
          />
        )}

        <Analytics />
      </div>
    </BrowserRouter>
  )
}

export default App
