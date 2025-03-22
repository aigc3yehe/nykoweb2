import './App.css'
import MainLayout from './components/MainLayout'
import Toast from './components/Toast'
import ConfirmDialog from './components/ConfirmDialog'
import { useAtom, useSetAtom } from 'jotai'
import { modalAtom, closeImageDetails } from './store/modalStore'
import ImageDetailsModal from './components/ImageDetailsModal'

function App() {
  const [modalState] = useAtom(modalAtom)
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
    </div>
  )
}

export default App
