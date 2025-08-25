import React from 'react'
import { cn } from '../../utils/cn'
import LeftIcon from '../../assets/mavae/left.svg'
import LeftDisabledIcon from '../../assets/mavae/left_disabled.svg'
import LeftIconDark from '../../assets/mavae/dark/left.svg'
import LeftDisabledIconDark from '../../assets/mavae/dark/left_disabled.svg'
import RightIcon from '../../assets/mavae/right.svg'
import RightDisabledIcon from '../../assets/mavae/right_disabled.svg'
import RightIconDark from '../../assets/mavae/dark/right.svg'
import RightDisabledIconDark from '../../assets/mavae/dark/right_disabled.svg'
import Right2Icon from '../../assets/mavae/right2.svg'
import Right2IconDark from '../../assets/mavae/dark/right2.svg'

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
    <div className="flex items-center justify-between h-6 md:h-10 mb-4"> {/* height: 40px */}
      {/* 移动端 - 只有标题和右箭头 */}
      <div className="md:hidden flex items-center">
        <h2 className="font-switzer font-bold text-lg leading-6 text-text-main dark:text-text-main-dark">
          {title}
        </h2>
        <button
            onClick={onViewAll}
            className="w-6 h-6 flex items-center justify-center" // 24x24
            aria-label="View All"
        >
          <img src={Right2Icon} alt="View All" className="w-6 h-6 block dark:hidden" />
          <img src={Right2IconDark} alt="View All" className="w-6 h-6 hidden dark:block" />
        </button>
      </div>
      {/* 左侧标题 */}
      <h2 className="hidden md:flex font-switzer font-bold text-3xl leading-10 text-text-main dark:text-text-main-dark">
        {title}
      </h2>

      {/* 右侧按钮组 - PC端 */}
      <div className="hidden md:flex items-center h-9 gap-4"> {/* height: 36px, gap: 16px */}
        {/* 左右箭头按钮组 - 没有间距 */}
        <div className="w-16 h-8 flex"> {/* width: 64px, height: 32px */}
          {/* 左箭头按钮 */}
          <button
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className={cn(
              "flex-1 flex items-center justify-center transition-opacity",
              canGoPrevious ? "hover:opacity-80" : "opacity-40 cursor-not-allowed"
            )}
            aria-label="Previous"
          >
            {canGoPrevious ? (
              <>
                <img src={LeftIcon} alt="Previous" className="w-5 h-5 block dark:hidden" /> {/* 20x20 */}
                <img src={LeftIconDark} alt="Previous" className="w-5 h-5 hidden dark:block" />
              </>
            ) : (
              <>
                <img src={LeftDisabledIcon} alt="Previous" className="w-5 h-5 block dark:hidden" />
                <img src={LeftDisabledIconDark} alt="Previous" className="w-5 h-5 hidden dark:block" />
              </>
            )}
          </button>

          {/* 右箭头按钮 */}
          <button
            onClick={onNext}
            disabled={!canGoNext}
            className={cn(
              "flex-1 flex items-center justify-center transition-opacity",
              canGoNext ? "hover:opacity-80" : "opacity-40 cursor-not-allowed"
            )}
            aria-label="Next"
          >
            {canGoNext ? (
              <>
                <img src={RightIcon} alt="Next" className="w-5 h-5 block dark:hidden" /> {/* 20x20 */}
                <img src={RightIconDark} alt="Next" className="w-5 h-5 hidden dark:block" />
              </>
            ) : (
              <>
                <img src={RightDisabledIcon} alt="Next" className="w-5 h-5 block dark:hidden" />
                <img src={RightDisabledIconDark} alt="Next" className="w-5 h-5 hidden dark:block" />
              </>
            )}
          </button>
        </div>

        {/* View All 按钮 */}
        <button
          onClick={onViewAll}
          className="h-9 px-4 rounded-full hover:bg-quaternary dark:hover:bg-quaternary-dark transition-colors" // height: 36px, padding: 16px, gap: 4px
        >
          <span className="font-lexend font-normal text-sm leading-none text-text-main dark:text-text-main-dark">
            View All
          </span>
        </button>
      </div>
    </div>
  )
}

export default SectionHeader