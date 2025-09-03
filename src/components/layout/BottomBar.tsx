import React, { useState } from 'react'
import { useAtom } from 'jotai'
import { useNavigate } from 'react-router-dom'
import { useLang, withLangPrefix } from '../../hooks/useLang'
import { useI18n } from '../../hooks/useI18n'
import UseIcon from '../../assets/web2/use_2.svg'
import CreateEditIcon from '../../assets/web2/create_edit.svg'
import { 
  workflowFormAtom, 
  createWorkflowAtom, 
  isCreatingWorkflowAtom, 
  createWorkflowErrorAtom 
} from '../../store/workflowBuilderStore'
import { userStateAtom } from '../../store/loginStore'

interface BottomBarProps {
  onOpenSettings: () => void
}

const BottomBar: React.FC<BottomBarProps> = ({ onOpenSettings }) => {
  const { t } = useI18n()
  const navigate = useNavigate()
  const lang = useLang()
  
  // Store 状态
  const [workflowForm] = useAtom(workflowFormAtom)
  const [, createWorkflow] = useAtom(createWorkflowAtom)
  const [isCreatingWorkflow] = useAtom(isCreatingWorkflowAtom)
  const [createWorkflowError] = useAtom(createWorkflowErrorAtom)
  const [userState] = useAtom(userStateAtom)
  
  // 本地状态
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handlePublish = async () => {
    // 检查用户是否已登录
    if (!userState.isAuthenticated || !userState.userDetails?.did) {
      console.error('User not authenticated or missing user ID')
      return
    }
    
    const userId = userState.userDetails.did
    
    try {
      const result = await createWorkflow(userId)
      if (result && result.workflow_id) {
        // 创建成功，显示成功提示
        setSuccessMessage('Workflow created successfully!')
        
        // 延迟跳转到工作流详情页
        setTimeout(() => {
      navigate(withLangPrefix(lang, `/workflow/${result.workflow_id}`))
        }, 1500)
      }
    } catch (error) {
      console.error('Failed to create workflow:', error)
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 z-50 lg:hidden">
      <div className="flex gap-3">
        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="flex-1 flex items-center justify-center gap-1.5 p-3 bg-none hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <img src={CreateEditIcon} alt="CreateEdit" className="w-6 h-6" />
          <span className="font-lexend text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('workflow.info') || 'Workflow Info'}
          </span>
        </button>

        {/* Publish Button */}
        <button
          onClick={handlePublish}
          disabled={isCreatingWorkflow || !workflowForm.name.trim() || !userState.isAuthenticated}
          className="flex-1 flex items-center justify-center gap-1.5 p-3 bg-[#0900FF] hover:bg-blue-800 disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          {isCreatingWorkflow ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          ) : (
            <img src={UseIcon} alt="Use" className="w-6 h-6" />
          )}
          <span className="font-lexend text-sm font-medium text-white">
            {isCreatingWorkflow ? (t('workflow.publishing') || 'Publishing...') : (t('workflow.publish') || 'Publish')}
          </span>
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <span className="text-green-600 dark:text-green-400 text-sm font-lexend">{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {createWorkflowError && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <span className="text-red-600 dark:text-red-400 text-sm font-lexend">{createWorkflowError}</span>
        </div>
      )}
    </div>
  )
}

export default BottomBar 