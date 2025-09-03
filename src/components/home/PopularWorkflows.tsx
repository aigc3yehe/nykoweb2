import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang, withLangPrefix } from '../../hooks/useLang'
import { useAtom, useSetAtom } from 'jotai'
import { featuredWorkflowsAtom, fetchFeaturedWorkflowsAtom } from '../../store/featuredStore'
import SectionHeader from './SectionHeader'
import { setPendingMessageAtom } from '../../store/assistantStore'
import WorkflowCard from './WorkflowCard'
import { useChatSidebar } from '../../hooks/useChatSidebar'

const PopularWorkflows: React.FC = () => {
  const navigate = useNavigate()
  const lang = useLang()
  const [workflowsState] = useAtom(featuredWorkflowsAtom)
  const [, fetchWorkflows] = useAtom(fetchFeaturedWorkflowsAtom)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const { openChat } = useChatSidebar()
  const setPendingMessage = useSetAtom(setPendingMessageAtom)
  // 获取数据 - 移除用户认证检查，因为接口是公开的
  useEffect(() => {
    if (workflowsState.items.length === 0 && !workflowsState.isLoading) {
      fetchWorkflows(false).catch(error => {
        console.error('Failed to fetch featured workflows:', error)
      })
    }
  }, [workflowsState.items.length, workflowsState.isLoading])

  // 检查滚动状态
  const checkScrollStatus = () => {
    if (!scrollContainerRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  // 滚动处理
  const scrollTo = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return
    const scrollAmount = 300 // 滚动距离
    const currentScroll = scrollContainerRef.current.scrollLeft
    const targetScroll = direction === 'left' 
      ? currentScroll - scrollAmount 
      : currentScroll + scrollAmount

    scrollContainerRef.current.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    })
  }

  useEffect(() => {
    checkScrollStatus()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScrollStatus)
      return () => container.removeEventListener('scroll', checkScrollStatus)
    }
  }, [workflowsState.items])

  // 处理工作流点击 - 导航到详情页面
  const handleWorkflowClick = (workflowId: number) => {
    navigate(withLangPrefix(lang, `/workflow/${workflowId}`))
  }

  // 处理使用工作流
  const handleUseWorkflow = (workflowId: number) => {
    console.log('Use workflow:', workflowId)
    // 1. 设置延迟发送的消息
    setPendingMessage('I want to use this workflow.')
    // 2. 打开详情页面（详情数据加载完成后会自动发送消息）
    navigate(withLangPrefix(lang, `/workflow/${workflowId}`))
    // 3. 打开右侧聊天窗口（包含登录检查）
    openChat()
  }

  // 加载状态
  if (workflowsState.isLoading && workflowsState.items.length === 0) {
    return (
      <div className="w-full h-[33.3125rem] px-8 pb-10 gap-4">
        <SectionHeader title="Popular Workflows" />
        <div className="h-[17.5rem] md:h-[20rem] flex items-center justify-center">
          <span className="text-gray-500">Loading...</span>
        </div>
      </div>
    )
  }

  // 错误状态
  if (workflowsState.error && workflowsState.items.length === 0) {
    return (
      <div className="w-full h-[33.3125rem] px-8 pb-10 gap-4">
        <SectionHeader title="Popular Workflows" />
        <div className="h-[17.5rem] md:h-[20rem] flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-2">Failed to load workflows</p>
            <button 
              onClick={() => fetchWorkflows(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 没有数据
  if (workflowsState.items.length === 0) {
    return null
  }

  const handleViewAll = () => {
    // 导航到Recipes页面的Workflows标签
    navigate(withLangPrefix(lang, '/cases/workflows'))
  }

  return (
    <div className="w-full h-[33.3125rem] px-4 md:px-8 pb-10 gap-4"> {/* width: 1352px, height: 533px, padding: 32px 32px 40px 32px, gap: 16px */}
      <SectionHeader
        title="Popular Workflows"
        onPrevious={() => scrollTo('left')}
        onNext={() => scrollTo('right')}
        onViewAll={handleViewAll}
        canGoPrevious={canScrollLeft}
        canGoNext={canScrollRight}
      />
      
      {/* 滚动容器 - 间距24px，添加padding防止阴影被截断 */}
      <div 
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth px-4 py-2 -mx-4 -my-2"
      >
        {workflowsState.items.map((item) => (
          <WorkflowCard
            key={item.id}
            item={item}
            variant="workflow"
            onClick={() => handleWorkflowClick(item.id)}
            onUseClick={() => handleUseWorkflow(item.id)}
          />
        ))}
      </div>
    </div>
  )
}

export default PopularWorkflows