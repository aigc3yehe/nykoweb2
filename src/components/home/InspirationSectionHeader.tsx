import React from 'react'
import { cn } from '../../utils/cn'

interface FilterOption {
  id: string
  label: string
}

interface InspirationSectionHeaderProps {
  title: string
  filterOptions: FilterOption[]
  selectedFilter: string
  onFilterChange: (filterId: string) => void
}

const InspirationSectionHeader: React.FC<InspirationSectionHeaderProps> = ({
  title,
  filterOptions,
  selectedFilter,
  onFilterChange
}) => {
  return (
    <div className="w-full">
      {/* 桌面端 - 单行布局 */}
      <div className="hidden md:flex items-center justify-between mb-4">
        {/* 左侧标题 */}
        <h2 className="font-lexend font-bold text-2xl leading-8 text-design-main-text dark:text-design-dark-main-text">
          {title}
        </h2>
        
        {/* 右侧按钮组 */}
        <div className="flex items-center gap-2"> {/* gap: 8px */}
          {filterOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => onFilterChange(option.id)}
              className={cn(
                "h-[2.125rem] px-[1.125rem] rounded-md transition-colors",
                selectedFilter === option.id
                  ? "bg-design-main-blue dark:bg-design-dark-main-blue"
                  : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
            >
              <span className={cn(
                "font-lexend font-normal text-sm leading-none",
                selectedFilter === option.id
                  ? "text-white"
                  : "text-design-dark-gray dark:text-design-dark-dark-gray"
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
        <h2 className="font-lexend font-bold text-2xl leading-8 text-design-main-text dark:text-design-dark-main-text">
          {title}
        </h2>
        
        {/* 按钮组行 */}
        <div className="flex items-center gap-2"> {/* gap: 8px */}
          {filterOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => onFilterChange(option.id)}
              className={cn(
                "h-[2.125rem] px-[1.125rem] rounded-md transition-colors",
                selectedFilter === option.id
                  ? "bg-design-main-blue dark:bg-design-dark-main-blue"
                  : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
            >
              <span className={cn(
                "font-lexend font-normal text-sm leading-none",
                selectedFilter === option.id
                  ? "text-white"
                  : "text-design-dark-gray dark:text-design-dark-dark-gray"
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