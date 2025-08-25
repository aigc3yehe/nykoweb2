import React from 'react'
import { cn } from '../../utils/cn'

interface ThemeAdaptiveIconProps {
  /** 正常状态的图标 */
  lightIcon: string
  /** 暗色主题的图标 */
  darkIcon: string
  /** 选中状态的亮色图标 */
  lightSelectedIcon?: string
  /** 选中状态的暗色图标 */
  darkSelectedIcon?: string
  /** 图标描述 */
  alt: string
  /** 图标大小 */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** 自定义类名 */
  className?: string
  /** 是否为选中状态 */
  isSelected?: boolean
}

// 预设大小映射
const sizeMap = {
  sm: { className: 'w-4 h-4' },      // 16px
  md: { className: 'w-5 h-5' },      // 20px
  lg: { className: 'w-6 h-6' },      // 24px
  xl: { className: 'w-8 h-8' },      // 32px
}

const ThemeAdaptiveIcon: React.FC<ThemeAdaptiveIconProps> = ({
  lightIcon,
  darkIcon,
  lightSelectedIcon,
  darkSelectedIcon,
  alt,
  size = 'md',
  className,
  isSelected = false
}) => {
  const sizeConfig = sizeMap[size]

  // 如果没有提供选中状态图标，使用普通图标
  const finalLightIcon = isSelected && lightSelectedIcon ? lightSelectedIcon : lightIcon
  const finalDarkIcon = isSelected && darkSelectedIcon ? darkSelectedIcon : darkIcon

  return (
    <div className={cn("flex-shrink-0", className)}>
      {/* Light theme icon */}
      <img 
        src={finalLightIcon}
        alt={alt}
        className={cn(
          // 如果className包含尺寸类（如w-19 h-8.5），则使用className，否则使用sizeMap
          className && (className.includes('w-') || className.includes('h-')) 
            ? className 
            : sizeConfig.className, 
          "block dark:hidden"
        )}
      />
      
      {/* Dark theme icon */}
      <img 
        src={finalDarkIcon}
        alt={alt}
        className={cn(
          // 如果className包含尺寸类（如w-19 h-8.5），则使用className，否则使用sizeMap
          className && (className.includes('w-') || className.includes('h-')) 
            ? className 
            : sizeConfig.className, 
          "hidden dark:block"
        )}
      />
    </div>
  )
}

export default ThemeAdaptiveIcon
