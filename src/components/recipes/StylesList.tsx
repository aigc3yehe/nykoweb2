import React, { useEffect, useCallback, useRef } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import WorkflowCard from '../home/WorkflowCard'
import {
  recipesModelsAtom,
  fetchRecipesModelsAtom,
  loadMoreRecipesModelsAtom
} from '../../store/recipesModelStore'
import type { FetchModelDto } from '../../services/api/types'
import type { FeaturedItem } from '../../store/featuredStore'
import { useNavigate } from 'react-router-dom'
import { useLang, withLangPrefix } from '../../hooks/useLang'
import { useChatSidebar } from '../../hooks/useChatSidebar'
import { setPendingMessageAtom } from '../../store/assistantStore'
import { useI18n } from '../../hooks/useI18n'

// 数据转换器：将 FetchModelDto 转换为 FeaturedItem 格式
const convertModelToFeaturedItem = (model: FetchModelDto): FeaturedItem => ({
  id: model.model_id,
  source: 'model' as const,
  name: model.name || '',
  tags: model.tags || [],
  usage: model.usage || 0,
  cover: model.cover || '',
  like_count: model.like_count || 0,
  description: model.description,
  user: model.user || {
    did: '',
    name: 'Anonymous', // 这个将在组件中被替换为多语言
    avatar: '',
    email: ''
  }
})

interface StylesListProps {
  sortOption?: string
}

const StylesList: React.FC<StylesListProps> = ({ sortOption = 'All' }) => {
  const { t } = useI18n()
  const [modelState] = useAtom(recipesModelsAtom)
  const [, fetchData] = useAtom(fetchRecipesModelsAtom)
  const [, loadMore] = useAtom(loadMoreRecipesModelsAtom)
  const isLoadingRef = useRef(false)
  const navigate = useNavigate()
  const lang = useLang()
  const { openChat } = useChatSidebar()
  const setPendingMessage = useSetAtom(setPendingMessageAtom)

  // 将排序选项转换为API参数
  const getSortParams = (option: string) => {
    switch (option) {
      case 'All':
        return { order: 'created_at' as const, desc: 'desc' as const } // 默认排序
      case 'Popular':
        return { order: 'usage' as const, desc: 'desc' as const }
      case 'Recent':
        return { order: 'created_at' as const, desc: 'desc' as const }
      default:
        return { order: 'created_at' as const, desc: 'desc' as const }
    }
  }

  // 初始加载数据
  useEffect(() => {
    if (modelState.items.length === 0 && !modelState.isLoading) {
      console.log('StylesList: Starting initial load')
      const sortParams = getSortParams(sortOption)
      fetchData({ reset: true, ...sortParams }).catch(error => {
        console.error('StylesList: Initial load failed:', error)
      })
    }
  }, [fetchData, modelState.items.length, modelState.isLoading, sortOption])

  // 处理排序变化
  useEffect(() => {
    if (modelState.items.length > 0) {
      console.log('StylesList: Sorting changed to', sortOption)
      const sortParams = getSortParams(sortOption)
      fetchData({ reset: true, ...sortParams }).catch(error => {
        console.error('StylesList: Sort change failed:', error)
      })
    }
  }, [sortOption, fetchData, modelState.items.length])

  const handleStyleClick = (styleId: number) => {
    navigate(withLangPrefix(lang, `/model/${styleId}`))
  }

  const handleUseClick = (styleId: number) => {
    // 1. 设置延迟发送的消息
    setPendingMessage('I want to generate an image.')
    // 2. 打开详情页面（详情数据加载完成后会自动发送消息）
    navigate(withLangPrefix(lang, `/model/${styleId}`))
    // 3. 打开右侧聊天窗口（包含登录检查）
    openChat()
  }

  // 处理加载更多
  const handleLoadMore = useCallback(() => {
    if (modelState.hasMore && !modelState.isLoading && !isLoadingRef.current) {
      isLoadingRef.current = true
      console.log('StylesList: Loading more styles')
      loadMore().finally(() => {
        isLoadingRef.current = false
      })
    }
  }, [modelState.hasMore, modelState.isLoading, loadMore])

  // 监听滚动，当接近底部时加载更多
  const handleScroll = useCallback(() => {
    const mainContent = document.querySelector('main')
    if (!mainContent) return

    const scrollTop = mainContent.scrollTop
    const scrollHeight = mainContent.scrollHeight
    const clientHeight = mainContent.clientHeight

    // 当滚动到距离底部200px时触发加载
    if (scrollHeight - scrollTop <= clientHeight + 200) {
      handleLoadMore()
    }
  }, [handleLoadMore])

  useEffect(() => {
    const mainContent = document.querySelector('main')
    if (mainContent) {
      mainContent.addEventListener('scroll', handleScroll)
      return () => mainContent.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  // 加载状态
  if (modelState.isLoading && modelState.items.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">{t('recipes.loadingStyles')}</div>
      </div>
    )
  }

  // 错误状态
  if (modelState.error && modelState.items.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <p className="text-red-500 mb-2">{t('recipes.errorLoadingStyles')} {modelState.error}</p>
          <button
            onClick={() => fetchData({ reset: true })}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            {t('recipes.retry')}
          </button>
        </div>
      </div>
    )
  }

  // 空状态
  if (modelState.items.length === 0 && !modelState.isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">{t('recipes.noStylesFound')}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 风格网格列表 - 移动端1列，PC端5列，gap 24px */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {modelState.items.map((model, index) => (
          <div key={`${model.model_id}-${index}`} className="flex justify-center lg:justify-start">
            <WorkflowCard
              item={convertModelToFeaturedItem(model)}
              variant="recipes_style"
              onClick={() => handleStyleClick(model.model_id)}
              onUseClick={() => handleUseClick(model.model_id)}
            />
          </div>
        ))}
      </div>

      {/* 加载更多状态 */}
      {modelState.isLoading && modelState.items.length > 0 && (
        <div className="flex justify-center py-6">
          <div className="text-gray-500">{t('recipes.loadingMoreStyles')}</div>
        </div>
      )}

      {/* 手动加载更多按钮 */}
      {modelState.hasMore && !modelState.isLoading && modelState.items.length > 0 && (
        <div className="flex justify-center py-6">
          <button
            onClick={handleLoadMore}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {t('home.loadMore')}
          </button>
        </div>
      )}

      {/* 无更多数据提示 */}
      {!modelState.hasMore && modelState.items.length > 0 && (
        <div className="flex justify-center py-6">
          <div className="text-gray-400">{t('recipes.noMoreStyles')}</div>
        </div>
      )}
    </div>
  )
}

export default StylesList