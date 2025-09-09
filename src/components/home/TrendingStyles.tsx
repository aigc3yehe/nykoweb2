import React, { useEffect, useRef, useState } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { featuredModelsAtom, fetchFeaturedModelsAtom } from '../../store/featuredStore'
import SectionHeader from './SectionHeader'
import WorkflowCard from './WorkflowCard'
import { useNavigate } from 'react-router-dom'
import { useLang, withLangPrefix } from '../../hooks/useLang'
import { useChatSidebar } from '../../hooks/useChatSidebar'
import { setPendingMessageAtom } from '../../store/assistantStore'
import { useI18n } from '../../hooks/useI18n'

const TrendingStyles: React.FC = () => {
  const { t } = useI18n()
  const [modelsState] = useAtom(featuredModelsAtom)
  const [, fetchModels] = useAtom(fetchFeaturedModelsAtom)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const navigate = useNavigate()
  const lang = useLang()
  const { openChat } = useChatSidebar()
  const setPendingMessage = useSetAtom(setPendingMessageAtom)
  // 获取数据 - 移除用户认证检查，因为接口是公开的
  useEffect(() => {
    if (modelsState.items.length === 0 && !modelsState.isLoading) {
      fetchModels(false).catch(error => {
        console.error('Failed to fetch featured models:', error)
      })
    }
  }, [modelsState.items.length, modelsState.isLoading])

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
    const scrollAmount = 300
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
  }, [modelsState.items])

  // 加载状态
  if (modelsState.isLoading && modelsState.items.length === 0) {
    return (
      <div className="w-full h-[31rem] md:h-[33.3125rem] px-8 pb-10 gap-4">
        <SectionHeader title={t('home.trendingStyles')} />
        <div className="h-[22.25rem] flex items-center justify-center">
          <span className="text-gray-500">{t('home.loading')}</span>
        </div>
      </div>
    )
  }

  // 错误状态
  if (modelsState.error && modelsState.items.length === 0) {
    return (
      <div className="w-full h-[31rem] md:h-[33.3125rem] px-8 pb-10 gap-4">
        <SectionHeader title={t('home.trendingStyles')} />
        <div className="h-[22.25rem] flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-2">{t('home.failedToLoad')} {t('style.name').toLowerCase()}</p>
            <button
              onClick={() => fetchModels(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              {t('home.retry')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 没有数据
  if (modelsState.items.length === 0) {
    return null
  }

  const handleViewAll = () => {
    // 导航到Recipes页面的Styles标签
    navigate(withLangPrefix(lang, '/cases/styles'))
  }

  const handleStyleClick = (styleId: number) => {
    navigate(withLangPrefix(lang, `/model/${styleId}`))
  }

  const handleUseStyle = (styleId: number) => {
    // 1. 设置延迟发送的消息
    setPendingMessage('I want to generate an image.')
    // 2. 打开详情页面（详情数据加载完成后会自动发送消息）
    navigate(withLangPrefix(lang, `/model/${styleId}`))
    // 3. 打开右侧聊天窗口（包含登录检查）
    openChat()
  }

  return (
    <div className="w-full h-[31rem] md:h-[33.3125rem] px-4 md:px-8 pb-10 gap-4"> {/* 移动端: height: 496px, PC端: height: 533px, padding: 32px 32px 40px 32px, gap: 16px */}
      <SectionHeader
        title={t('home.trendingStyles')}
        onPrevious={() => scrollTo('left')}
        onNext={() => scrollTo('right')}
        onViewAll={handleViewAll}
        canGoPrevious={canScrollLeft}
        canGoNext={canScrollRight}
      />
      
      {/* 滚动容器 - 间距24px，添加padding防止阴影被截断 */}
      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth px-4 py-8 -mx-4 -my-8"
      >
        {modelsState.items.map((item) => (
          <WorkflowCard
            key={item.id}
            item={item}
            variant="style"
            onClick={() => handleStyleClick(item.id)}
            onUseClick={() => handleUseStyle(item.id)}
          />
        ))}
      </div>
    </div>
  )
}

export default TrendingStyles