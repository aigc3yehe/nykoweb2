import React from 'react'
import { useAtom } from 'jotai'
import { useLocation } from 'react-router-dom'
import { cn } from '../../utils/cn'
import { themeAtom } from '../../store/themeStore'

// 导入现有的页面组件
import Activity from '../Activity'
import Pricing from '../Pricing'

interface MainContentProps {
  children: React.ReactNode
}

const MainContent: React.FC<MainContentProps> = ({ children }) => {
  const [theme] = useAtom(themeAtom)
  const location = useLocation()

  // 根据路由渲染不同的内容
  const renderContent = () => {
    const path = location.pathname

    // 默认首页内容
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-foreground">
            欢迎来到 Nikosolo
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            探索 AI 驱动的创意平台，发现无限可能
          </p>
          <div className="flex gap-4 justify-center">
            <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              开始探索
            </button>
            <button className="px-6 py-3 border border-border text-foreground rounded-lg hover:bg-accent transition-colors">
              了解更多
            </button>
          </div>
        </div>
      </div>
    )
  }

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