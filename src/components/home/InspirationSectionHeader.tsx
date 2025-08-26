import React from 'react'
import { cn } from '../../utils/cn'
import { ContentTypeFilter } from '../../store/contentsStore'

interface InspirationSectionHeaderProps {
  title: string
  selectedFilter: ContentTypeFilter
  onFilterChange: (filterId: ContentTypeFilter) => void
}

const InspirationSectionHeader: React.FC<InspirationSectionHeaderProps> = ({
  title,
  selectedFilter,
  onFilterChange
}) => {
  // 固定的过滤选项
  const filterOptions = [
    { id: 'all' as ContentTypeFilter, label: 'All' },
    { id: 'image' as ContentTypeFilter, label: 'Images' },
    { id: 'video' as ContentTypeFilter, label: 'Videos' }
  ]

  return (
    <div className="w-full">
      {/* 桌面端 - 单行布局 */}
      <div className="hidden md:flex items-center justify-between h-10 mb-4"> {/* height: 40px */}
        {/* 左侧标题 */}
        <h2 className="font-switzer font-bold text-3xl leading-10 text-text-main dark:text-text-main-dark">
          {title}
        </h2>
        
        {/* 右侧分段选择器 */}
        <div className="h-9 px-0.5 py-px rounded-full bg-quaternary dark:bg-quaternary-dark border border-line-subtle dark:border-line-subtle-dark"> {/* height: 36px, border-radius: 999px, padding: 2px */}
          {filterOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => onFilterChange(option.id)}
              className={cn(
                "h-8 min-w-[4.5rem] px-4 rounded-full transition-all duration-200", // height: 32px, min-width: 72px, padding: 16px
                selectedFilter === option.id
                  ? "bg-btn-selected dark:bg-btn-selected-dark shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.1)]" // 选中状态
                  : "hover:bg-quaternary dark:hover:bg-quaternary-dark" // 未选中状态
              )}
            >
              <span className={cn(
                "font-switzer font-medium text-sm leading-[1.375rem] text-center", // font-size: 14px, line-height: 22px
                selectedFilter === option.id
                  ? "text-text-main dark:text-text-main-dark" // 选中状态字体颜色
                  : "text-text-secondary dark:text-text-secondary-dark" // 未选中状态字体颜色
              )}>
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 移动端 - 上下两行布局 */}
      <div className="md:hidden mb-4 space-y-[0.875rem]"> {/* gap: 14px */}
        {/* 标题行 */}
        <h2 className="font-switzer font-bold text-lg leading-6 text-text-main dark:text-text-main-dark"> {/* font-size: 18px, line-height: 24px */}
          {title}
        </h2>
        
                 {/* 按钮组行 - 与PC端相同的分段选择器样式 */}
         <div className="inline-flex h-9 px-0.5 py-px rounded-full bg-quaternary dark:bg-quaternary-dark border border-line-subtle dark:border-line-subtle-dark"> {/* height: 36px, border-radius: 999px, padding: 2px */}
           {filterOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => onFilterChange(option.id)}
              className={cn(
                "h-8 min-w-[4.5rem] px-4 rounded-full transition-all duration-200", // height: 32px, min-width: 72px, padding: 16px
                selectedFilter === option.id
                  ? "bg-btn-selected dark:bg-btn-selected-dark shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.1)]" // 选中状态
                  : "hover:bg-quaternary dark:hover:bg-quaternary-dark" // 未选中状态
              )}
            >
              <span className={cn(
                "font-switzer font-medium text-sm leading-[1.375rem] text-center", // font-size: 14px, line-height: 22px
                selectedFilter === option.id
                  ? "text-text-main dark:text-text-main-dark" // 选中状态字体颜色
                  : "text-text-secondary dark:text-text-secondary-dark" // 未选中状态字体颜色
              )}>
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default InspirationSectionHeader 