import React, { useState } from 'react'
import { getScaledImageUrl } from '../../utils'
import PictureIcon from '../../assets/mavae/Picture_white.svg'
import VideoIconNew from '../../assets/mavae/video_white.svg'
import UseIconNew from '../../assets/mavae/use_white.svg'
import MaskImage from '../../assets/mavae/Mask.svg'
import { useI18n } from '../../hooks/useI18n'


interface WorkflowCoverProps {
  cover?: string
  name?: string
  usage?: number
  className?: string
}

const WorkflowCover: React.FC<WorkflowCoverProps> = ({
  cover,
  name,
  usage = 0,
  className = ''
}) => {
  const { t } = useI18n()
  const [imageError, setImageError] = useState(false)

  // 判断是否为视频
  const isVideo = cover?.includes('.mp4') || cover?.includes('.webm')

  return (
    <div className={`relative w-[25rem] h-[37.5rem] min-w-[15rem] max-w-[26.25rem] min-h-[22.5rem] max-h-[39.375rem] flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden ${className}`}>
      {cover && !imageError ? (
        isVideo ? (
          <video
            src={cover}
            className="w-full h-full object-cover"
            muted
            playsInline
            preload="metadata"
          />
        ) : (
          <img
            src={getScaledImageUrl(cover, 450)}
            alt={name || t('workflow.workflowCover')}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        )
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-gray-400">{t('workflow.noCoverImage')}</span>
        </div>
      )}

      {/* Mask阴影区域 */}
      <img
        src={MaskImage}
        alt="Mask"
        className="absolute bottom-0 left-0 right-0 w-full h-[3.25rem] object-cover opacity-70"
      />

      {/* 类型标签 - 左下角 */}
      <div className="absolute bottom-2 left-2 flex items-center p-0.5 bg-black/20 rounded">
        {isVideo ? (
          <img src={VideoIconNew} alt="Video" className="w-4 h-4 min-w-4 min-h-4" />
        ) : (
          <img src={PictureIcon} alt="Picture" className="w-4 h-4 min-w-4 min-h-4" />
        )}
      </div>

      {/* 使用量和收藏数 - 右下角 */}
      <div className="absolute bottom-2 right-2 flex items-center gap-2">
        {/* 使用量 */}
        <div className="flex items-center gap-0.5 h-5">
          <img src={UseIconNew} alt="Uses" className="w-3 h-3" />
          <span className="pb-px font-switzer font-medium text-xs leading-4 text-white text-center">
            {usage}
          </span>
        </div>
      </div>
    </div>
  )
}

export default WorkflowCover
