import React, { useState } from 'react'
import { useAtom } from 'jotai'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../../hooks/useLang'
import { useI18n } from '../../hooks/useI18n'
import UseIcon from '../../assets/web2/use_2.svg'
import CreateEditIcon from '../../assets/web2/create_edit.svg'
import { 
  modelCreationStateAtom, 
  styleTrainerStatusAtom,
  createModelAtom
} from '../../store/styleTrainerStore'

interface StyleTrainerBottomBarProps {
  onOpenSettings: () => void
}

const StyleTrainerBottomBar: React.FC<StyleTrainerBottomBarProps> = ({ onOpenSettings }) => {
  const { t } = useI18n()
  const navigate = useNavigate()
  useLang() // keep hook to sync language context if needed
  
  // Store 状态
  const [modelCreationState] = useAtom(modelCreationStateAtom)
  const [status] = useAtom(styleTrainerStatusAtom)
  const [, createModel] = useAtom(createModelAtom)
  
  // 本地状态
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // 处理开始训练
  const handleStartTraining = async () => {
    if (!status.canCreate) {
      console.error('Cannot start training - requirements not met')
      return
    }
    
    try {
      await createModel(navigate)
      setSuccessMessage('Style training started successfully!')
      setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)
    } catch (error) {
      console.error('Failed to start training:', error)
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 z-50 lg:hidden">
      <div className="flex gap-3">
        {/* Style Info Button */}
        <button
          onClick={onOpenSettings}
          className="flex-1 flex items-center justify-center gap-1.5 p-3 bg-none hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <img src={CreateEditIcon} alt="CreateEdit" className="w-6 h-6" />
          <span className="font-lexend text-sm font-medium text-gray-700 dark:text-gray-300">
            Style Info
          </span>
        </button>

        {/* Start Training Button */}
        <button
          onClick={handleStartTraining}
          disabled={!status.canCreate || modelCreationState.isCreating || modelCreationState.isTraining}
          className="flex-1 flex items-center justify-center gap-1.5 p-3 bg-[#0900FF] hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          {modelCreationState.isCreating || modelCreationState.isTraining ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          ) : (
            <img src={UseIcon} alt="Use" className="w-6 h-6" />
          )}
          <span className="font-lexend text-sm font-medium text-white">
            {modelCreationState.isCreating ? (t('style.creating') || 'Creating...') : 
             modelCreationState.isTraining ? (t('style.training') || 'Training...') : 
             (t('style.startTraining') || 'Start Training')}
          </span>
        </button>
      </div>

      {/* 成功消息 */}
      {successMessage && (
        <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <span className="text-green-600 dark:text-green-400 text-sm font-lexend">{successMessage}</span>
        </div>
      )}
    </div>
  )
}

export default StyleTrainerBottomBar 