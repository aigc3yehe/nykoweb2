import React from 'react'
import { cn } from '../../utils/cn'

interface BannerCardProps {
  title: string
  description: string
  buttonText: string
  icon: string
  iconDark?: string
  onClick?: () => void
  isMobile?: boolean
}

const BannerCard: React.FC<BannerCardProps> = ({
  title,
  description,
  buttonText,
  icon,
  iconDark,
  onClick,
  isMobile = false
}) => {
  return (
    <div 
      className={cn(
        "relative rounded-xl overflow-hidden border border-line-subtle dark:border-line-subtle-dark bg-secondary dark:bg-secondary-dark hover:border-line-strong dark:hover:border-line-strong-dark transition-colors",
        // 桌面端样式
        !isMobile && "w-[39.5rem] h-[12.25rem] p-8", // width: 632px, height: 196px, padding: 32px
        // 移动端样式
        isMobile && "w-full h-[5.75rem] pt-4 pr-3 pb-6 pl-3" // width: 358px, height: 92px, padding: 16px 12px 16px 12px
      )}
    >
      {/* 桌面端内容布局 */}
      {!isMobile && (
        <div className="w-full h-full flex justify-between items-center">
          {/* 左侧文本信息 */}
          <div className="w-[28rem] h-[8.25rem] flex flex-col gap-8"> {/* width: 448px, height: 132px, gap: 32px */}
            {/* 文本区域 */}
            <div className="w-[28rem] h-16 flex flex-col gap-1"> {/* width: 448px, height: 64px, gap: 4px */}
              {/* 标题 */}
              <h2 className="font-switzer font-bold text-2xl leading-10 text-text-main dark:text-text-main-dark">
                {title}
              </h2>
              
              {/* 描述 */}
              <p className="font-switzer font-medium text-sm leading-5 text-text-secondary dark:text-text-secondary-dark">
                {description}
              </p>
            </div>
            
            {/* 按钮 */}
            <button
              onClick={onClick}
              className="w-30 h-9 px-4 rounded-full bg-text-main dark:bg-text-main-dark hover:bg-text-secondary dark:hover:bg-text-secondary-dark transition-colors"
            >
              <span className="font-switzer font-medium text-sm leading-5 text-text-inverse dark:text-text-inverse-dark text-center">
                {buttonText}
              </span>
            </button>
          </div>
          
          {/* 右侧SVG图标 */}
          <div className="w-30 h-30 flex items-center justify-center"> {/* 120px * 120px */}
            <img
              src={icon}
              alt=""
              className="w-30 h-30 block dark:hidden"
              aria-hidden="true"
            />
            {iconDark && (
              <img
                src={iconDark}
                alt=""
                className="w-30 h-30 hidden dark:block"
                aria-hidden="true"
              />
            )}
          </div>
        </div>
      )}
      
      {/* 移动端内容布局 */}
      {isMobile && (
        <div 
          className="w-full h-full flex justify-between items-center gap-4 cursor-pointer" 
          onClick={onClick}
        > {/* gap: 16px */}
          {/* 左侧文本信息 */}
          <div className="w-[16.375rem] h-[3.75rem] flex flex-col gap-1"> {/* width: 262px, height: 60px, gap: 4px */}
            {/* 标题 */}
            <h2 className="font-switzer font-bold text-lg leading-6 text-text-main dark:text-text-main-dark">
              {title}
            </h2>
            
            {/* 描述 */}
            <p className="font-switzer font-medium text-xs leading-4 text-text-secondary dark:text-text-secondary-dark">
              {description}
            </p>
          </div>
          
          {/* 右侧SVG图标 */}
          <div className="w-14 h-14 flex items-center justify-center"> {/* 56px * 56px */}
            <img
              src={icon}
              alt=""
              className="w-14 h-14 block dark:hidden"
              aria-hidden="true"
            />
            {iconDark && (
              <img
                src={iconDark}
                alt=""
                className="w-14 h-14 hidden dark:block"
                aria-hidden="true"
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default BannerCard 