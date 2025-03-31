import './App.css'
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

  return (
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
    </div>
  )
}

export default App
