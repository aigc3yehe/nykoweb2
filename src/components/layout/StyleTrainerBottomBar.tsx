import React from 'react'
import { useAtom } from 'jotai'
import { useI18n } from '../../hooks/useI18n'
import SettingsIcon from '../../assets/web2/workflow_setting.svg'
import PublishIcon from '../../assets/web2/publish.svg'
import { styleTrainerFormAtom, modelCreationStateAtom, styleTrainerStatusAtom } from '../../store/styleTrainerStore'

interface StyleTrainerBottomBarProps {
  onOpenSettings: () => void
  onOpenTraining: () => void
}

const StyleTrainerBottomBar: React.FC<StyleTrainerBottomBarProps> = ({ onOpenSettings, onOpenTraining }) => {
  const { t } = useI18n()
  
  // Store 状态
  const [formData] = useAtom(styleTrainerFormAtom)
  const [modelCreationState] = useAtom(modelCreationStateAtom)
  const [status] = useAtom(styleTrainerStatusAtom)

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 z-50 lg:hidden">
      <div className="flex gap-3">
        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <img src={SettingsIcon} alt="Settings" className="w-5 h-5" />
          <span className="font-lexend text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('style.settings') || 'Settings'}
          </span>
        </button>

        {/* Start Training Button */}
        <button
          onClick={onOpenTraining}
          disabled={!status.canCreate || modelCreationState.isCreating}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[#0900FF] hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          {modelCreationState.isCreating ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <img src={PublishIcon} alt="Train" className="w-5 h-5" />
          )}
          <span className="font-lexend text-sm font-medium text-white">
            {modelCreationState.isCreating ? (t('style.creating') || 'Creating...') : (t('style.startTraining') || 'Start Training')}
          </span>
        </button>
      </div>

      {/* 状态信息 */}
      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex justify-between items-center text-sm">
          <span className="font-lexend text-blue-700 dark:text-blue-300">
            {t('style.imagesUploaded') || 'Images uploaded'}: {formData.referenceImages.length}
          </span>
          <span className="font-lexend text-blue-700 dark:text-blue-300">
            {t('style.required') || 'Required'}: 10
          </span>
        </div>
      </div>
    </div>
  )
}

export default StyleTrainerBottomBar 