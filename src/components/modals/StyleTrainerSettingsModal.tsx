import React from 'react'
import { useAtom } from 'jotai'
import { useI18n } from '../../hooks/useI18n'
import CloseIcon from '../../assets/web2/close.svg'
import { styleTrainerFormAtom } from '../../store/styleTrainerStore'

interface StyleTrainerSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

const StyleTrainerSettingsModal: React.FC<StyleTrainerSettingsModalProps> = ({ isOpen, onClose }) => {
  const { t } = useI18n()
  const [formData] = useAtom(styleTrainerFormAtom)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:hidden">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50" 
        onClick={onClose}
      />
      
      {/* 模态框内容 */}
      <div className="relative w-full bg-white dark:bg-gray-900 rounded-t-2xl max-h-[90vh] overflow-y-auto">
        {/* 拖拽指示器 */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        </div>
        
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full"
        >
          <img src={CloseIcon} alt="Close" className="w-5 h-5" />
        </button>

        {/* 内容区域 */}
        <div className="p-6 space-y-6">
          {/* 标题 */}
          <div className="text-center">
            <h2 className="font-lexend font-semibold text-xl text-gray-900 dark:text-white">
              {t('style.settings') || 'Style Settings'}
            </h2>
          </div>

          {/* 当前样式信息 */}
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="font-lexend font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                {t('style.currentStyle') || 'Current Style'}
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Name:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {formData.name || 'Not set'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Description:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {formData.description || 'Not set'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Cover Image:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {formData.cover ? 'Uploaded' : 'Not uploaded'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Reference Images:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {formData.referenceImages.length} / 10
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 训练要求 */}
          <div className="space-y-4">
            <h3 className="font-lexend font-medium text-lg text-gray-900 dark:text-white">
              {t('style.trainingRequirements') || 'Training Requirements'}
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-lexend text-sm text-green-700 dark:text-green-300">
                  {t('style.consistentStyle') || 'Consistent style'}
                </span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-lexend text-sm text-green-700 dark:text-green-300">
                  {t('style.distinctFeatures') || 'Distinct features'}
                </span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-lexend text-sm text-green-700 dark:text-green-300">
                  {t('style.showDiversity') || 'Show diversity'}
                </span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-lexend text-sm text-green-700 dark:text-green-300">
                  {t('style.clearNoWatermark') || 'Clear & No watermark'}
                </span>
              </div>
            </div>
          </div>

          {/* 进度指示器 */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-lexend text-gray-600 dark:text-gray-400">
                {t('style.progress') || 'Progress'}
              </span>
              <span className="font-lexend text-gray-900 dark:text-white font-medium">
                {formData.referenceImages.length} / 10
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#0900FF] transition-all duration-300"
                style={{ width: `${Math.min((formData.referenceImages.length / 10) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="space-y-3 pt-4">
            <button
              onClick={onClose}
              className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-lexend font-medium"
            >
              {t('common.close') || 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StyleTrainerSettingsModal 