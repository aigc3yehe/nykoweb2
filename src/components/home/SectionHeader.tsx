import React from 'react'
import { cn } from '../../utils/cn'
import ArrowLeftIcon from '../../assets/web2/arrow_left.svg'
import ArrowRightIcon from '../../assets/web2/arrow_right.svg'

interface SectionHeaderProps {
  title: string
  onPrevious?: () => void
  onNext?: () => void
  onViewAll?: () => void
  canGoPrevious?: boolean
  canGoNext?: boolean
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  onPrevious,
  onNext,
  onViewAll,
  canGoPrevious = true,
  canGoNext = true
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      {/* 左侧标题 */}
      <h2 className="font-lexend font-bold text-2xl leading-8 text-design-main-text dark:text-design-dark-main-text">
        {title}
      </h2>
      
      {/* 右侧按钮组 */}
      <div className="flex items-center gap-[0.625rem]"> {/* gap: 10px */}
        {/* 左右箭头 - 移动端隐藏 */}
        <div className="hidden md:flex items-center gap-[0.625rem]">
          {/* 左箭头 - 直接32x32 */}
          <button
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className={cn(
              "transition-opacity",
              canGoPrevious ? "hover:opacity-80" : "opacity-40 cursor-not-allowed"
            )}
            aria-label="Previous"
          >
            <img src={ArrowLeftIcon} alt="Previous" className="w-8 h-8 dark:invert" />
          </button>
          
          {/* 右箭头 - 直接32x32 */}
          <button
            onClick={onNext}
            disabled={!canGoNext}
            className={cn(
              "transition-opacity",
              canGoNext ? "hover:opacity-80" : "opacity-40 cursor-not-allowed"
            )}
            aria-label="Next"
          >
            <img src={ArrowRightIcon} alt="Next" className="w-8 h-8 dark:invert" />
          </button>
        </div>
        
        {/* View All 按钮 - 去掉border */}
        <button
          onClick={onViewAll}
          className="h-[2.125rem] px-[1.125rem] bg-white dark:bg-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <span className="font-lexend font-normal text-sm leading-none text-design-dark-gray dark:text-design-dark-dark-gray">
            View All
          </span>
        </button>
      </div>
    </div>
  )
}

export default SectionHeader 