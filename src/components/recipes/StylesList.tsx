import React, { useEffect, useCallback, useRef } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import WorkflowCard from '../home/WorkflowCard'
import { 
  recipesModelsAtom, 
  fetchRecipesModelsAtom, 
  loadMoreRecipesModelsAtom 
} from '../../store/recipesModelStore'
import { userStateAtom, showLoginModalAtom } from '../../store/loginStore'
import type { FetchModelDto } from '../../services/api/types'
import type { FeaturedItem } from '../../store/featuredStore'

// 数据转换器：将 FetchModelDto 转换为 FeaturedItem 格式
const convertModelToFeaturedItem = (model: FetchModelDto): FeaturedItem => ({
  id: model.model_id,
  source: 'model' as const,
  name: model.name || '',
  tags: model.tags || [],
  usage: model.usage || 0,
  cover: model.cover || '',
  description: model.description,
  user: model.user || {
    did: '',
    name: 'Anonymous',
    avatar: '',
    email: ''
  }
})

const StylesList: React.FC = () => {
  const [modelState] = useAtom(recipesModelsAtom)
  const [userState] = useAtom(userStateAtom)
  const [, fetchData] = useAtom(fetchRecipesModelsAtom)
  const [, loadMore] = useAtom(loadMoreRecipesModelsAtom)
  const showLoginModal = useSetAtom(showLoginModalAtom)
  const isLoadingRef = useRef(false)

  // 初始加载数据（仅当用户已登录）
  useEffect(() => {
    if (userState.isAuthenticated && modelState.items.length === 0 && !modelState.isLoading) {
      console.log('StylesList: Starting initial load')
      fetchData({ reset: true }).catch(error => {
        console.error('StylesList: Initial load failed:', error)
      })
    }
  }, [fetchData, modelState.items.length, modelState.isLoading, userState.isAuthenticated])

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

  // 未登录状态
  if (!userState.isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-center max-w-md">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Login Required
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please log in to view and use styles. Discover amazing AI models for your creative projects.
          </p>
          <button
            onClick={() => showLoginModal()}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Log In
          </button>
        </div>
      </div>
    )
  }

  // 加载状态
  if (modelState.isLoading && modelState.items.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Loading styles...</div>
      </div>
    )
  }

  // 错误状态
  if (modelState.error && modelState.items.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading styles: {modelState.error}</p>
          <button 
            onClick={() => fetchData({ reset: true })}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // 空状态
  if (modelState.items.length === 0 && !modelState.isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">No styles found</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 风格网格列表 - 移动端2列，PC端4列，每个卡片269px宽度，gap 20px */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {modelState.items.map((model, index) => (
          <div key={`${model.model_id}-${index}`} className="flex justify-center">
            <WorkflowCard
              item={convertModelToFeaturedItem(model)}
              variant="recipes_style"
              onClick={() => {
                // TODO: 导航到模型详情页
                console.log('Navigate to model:', model.model_id)
              }}
              onUseClick={() => {
                // TODO: 使用模型
                console.log('Use model:', model.model_id)
              }}
            />
          </div>
        ))}
      </div>

      {/* 加载更多状态 */}
      {modelState.isLoading && modelState.items.length > 0 && (
        <div className="flex justify-center py-6">
          <div className="text-gray-500">Loading more styles...</div>
        </div>
      )}

      {/* 手动加载更多按钮 */}
      {modelState.hasMore && !modelState.isLoading && modelState.items.length > 0 && (
        <div className="flex justify-center py-6">
          <button
            onClick={handleLoadMore}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Load More
          </button>
        </div>
      )}

      {/* 无更多数据提示 */}
      {!modelState.hasMore && modelState.items.length > 0 && (
        <div className="flex justify-center py-6">
          <div className="text-gray-400">No more styles to load</div>
        </div>
      )}
    </div>
  )
}

export default StylesList 