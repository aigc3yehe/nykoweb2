import React from 'react'
import { cn } from '../../utils/cn'


interface MainContentProps {
  children: React.ReactNode
}

const MainContent: React.FC<MainContentProps> = ({ children }) => {
  // const [theme] = useAtom(themeAtom)
  // const location = useLocation()

  // 根据路由渲染不同的内容
  return (
    <main
      className={cn(
        "flex-1 overflow-y-auto overflow-x-hidden",
        "bg-main-bg dark:bg-gray-900 text-foreground",
        "transition-colors duration-200",
        // 隐藏滚动条但保持可滚动
        "scrollbar-hide"
      )}
      id="main-content" // 添加id便于查找
    >
      {/* 内容容器 - 最大宽度1184px，居中显示 */}
      <div className="w-full max-w-[74rem] mx-auto h-full">
        {children}
      </div>
    </main>
  )
}

export default MainContent