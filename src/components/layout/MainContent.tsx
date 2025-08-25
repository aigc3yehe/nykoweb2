import React from 'react'
import { cn } from '../../utils/cn'
import { useLocation } from 'react-router-dom'


interface MainContentProps {
  children: React.ReactNode
}

const MainContent: React.FC<MainContentProps> = ({ children }) => {
  // const [theme] = useAtom(themeAtom)
  // const location = useLocation()
  const location = useLocation()
  
  // 根据路由获取背景样式
  const getBackgroundStyle = () => {
    switch (location.pathname) {
      case '/pricing':
        return 'bg-primary dark:bg-primary-dark'
      case '/workflow/builder':
      case '/style/trainer':
        return 'bg-primary dark:bg-primary-dark'
      default:
        return 'bg-primary dark:bg-primary-dark'
    }
  }

  // 圆点背景样式
  const dotBg = {
    backgroundImage: 'radial-gradient(circle, #E5E7EB 1px, transparent 2px)',
    backgroundSize: '6px 6px',
    backgroundPosition: '0 0',
  }

  // 根据路由渲染不同的内容
  return (
    <main
      className={cn(
        "flex-1 overflow-y-auto overflow-x-hidden",
        getBackgroundStyle(),
        "text-foreground",
        "transition-colors duration-200",
        // 隐藏滚动条但保持可滚动
        "scrollbar-hide",
        // 移动端底部padding，避免被BottomBar遮挡
        (location.pathname === '/workflow/builder' || location.pathname === '/style/trainer') ? "pb-24 lg:pb-0" : ""
      )}
      style={location.pathname === '/workflow/builder' || location.pathname === '/style/trainer' ? dotBg : undefined}
      id="main-content" // 添加id便于查找
    >
      {/* 内容容器 - 最大宽度1352px，居中显示 */}
      <div className="w-full max-w-[84.5rem] mx-auto h-full">
        {children}
      </div>
    </main>
  )
}

export default MainContent