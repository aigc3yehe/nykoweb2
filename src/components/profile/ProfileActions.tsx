import React, { useState } from 'react'
import { cn } from '../../utils'
import PictureIcon from '../../assets/mavae/Picture.svg'
import PictureIconDark from '../../assets/mavae/dark/Picture.svg'
import GptIcon from '../../assets/mavae/gpt.svg'
import GptIconDark from '../../assets/mavae/dark/gpt.svg'

type ProfileTab = 'published' | 'liked'
type ContentTypeFilter = 'images' | 'workflows'

interface ProfileActionsProps {
  activeTab: ProfileTab
  onFilterChange?: (filterOption: ContentTypeFilter) => void
}

const ProfileActions: React.FC<ProfileActionsProps> = ({onFilterChange }) => {
  const [selectedOption, setSelectedOption] = useState<ContentTypeFilter>('images')

  const options: ContentTypeFilter[] = ['images', 'workflows']

  const handleOptionSelect = (option: ContentTypeFilter) => {
    setSelectedOption(option)

    // 调用父组件的过滤回调
    if (onFilterChange) {
      onFilterChange(option)
    }
  }

  return (
    <div className="w-full h-auto md:h-9 flex items-center justify-between pt-3 pb-6 md:pt-0 md:pb-0"> {/* 移动端: height: auto, padding: 12px 16px 24px 16px, PC端: height: 36px */}
      {/* 左侧分段选择器 */}
      <div className="w-full md:w-auto h-9 px-px py-px rounded-full bg-quaternary dark:bg-quaternary-dark border border-line-subtle dark:border-line-subtle-dark flex"> {/* 移动端: 宽度占满, PC端: 自适应宽度 */}
        {options.map((option) => (
          <button
            key={option}
            onClick={() => handleOptionSelect(option)}
            className={cn(
              "h-8 px-4 rounded-full transition-all duration-200 flex items-center justify-center gap-1", // height: 32px, padding: 16px, gap: 4px, 内容居中
              "md:min-w-[6.875rem]", // PC端: min-width: 110px
              "w-1/4 md:w-auto md:flex-none", // 移动端: 平分1/4宽度, PC端: 自适应
              selectedOption === option
                ? "bg-btn-selected dark:bg-btn-selected-dark shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" // 选中状态
                : "hover:bg-quaternary dark:hover:bg-quaternary-dark" // 未选中状态
            )}
          >
            {/* 图标 - 为所有选项显示 */}
            <img
              src={option === 'images' ? PictureIcon : GptIcon}
              alt={option}
              className="w-4 h-4 flex-shrink-0 dark:hidden" // 16x16px, 浅色模式显示
            />
            <img
              src={option === 'images' ? PictureIconDark : GptIconDark}
              alt={option}
              className="w-4 h-4 flex-shrink-0 hidden dark:block" // 16x16px, 深色模式显示
            />
            <span className={cn(
              "font-switzer font-medium text-sm leading-[1.375rem] text-center", // font-size: 14px, line-height: 22px
              selectedOption === option
                ? "text-text-main dark:text-text-main-dark" // 选中状态字体颜色
                : "text-text-secondary dark:text-text-secondary-dark" // 未选中状态字体颜色
            )}>
              {option === 'workflows' ? 'Cases' : 'Images'}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default ProfileActions
