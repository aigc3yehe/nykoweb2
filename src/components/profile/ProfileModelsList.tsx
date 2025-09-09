import React, { useEffect, useCallback, useRef } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { useI18n } from '../../hooks/useI18n'
import WorkflowCard from '../home/WorkflowCard'
import {
  profileModelsAtom,
  fetchPublishedModelsAtom,
  fetchLikedModelsAtom,
  loadMorePublishedModelsAtom,
  type TimeGroup
} from '../../store/profileModelStore'
import type { FetchModelDto } from '../../services/api/types'
import type { FeaturedItem } from '../../store/featuredStore'
import { useNavigate } from 'react-router-dom'
import { useLang, withLangPrefix } from '../../hooks/useLang'
import { useChatSidebar } from '../../hooks/useChatSidebar'
import { setPendingMessageAtom } from '../../store/assistantStore'
import NanananaIcon from '../../assets/mavae/nananana.svg'
import NanananaIconDark from '../../assets/mavae/dark/nananana.svg'
import WorkflowBuilderIcon from '../../assets/mavae/WorkflowBuilder_white.svg'

interface ProfileModelsListProps {
  tab: 'published' | 'liked'
}

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

const ProfileModelsList: React.FC<ProfileModelsListProps> = ({ tab }) => {
  const { t } = useI18n()
  const [state] = useAtom(profileModelsAtom)
  const [, fetchPublished] = useAtom(fetchPublishedModelsAtom)
  const [, fetchLiked] = useAtom(fetchLikedModelsAtom)
  const [, loadMorePublished] = useAtom(loadMorePublishedModelsAtom)
  const isLoadingRef = useRef(false)
  const navigate = useNavigate()
  const lang = useLang()
  const { openChat } = useChatSidebar()
  const setPendingMessage = useSetAtom(setPendingMessageAtom)

  useEffect(() => {
    if (tab === 'published') {
      fetchPublished({ reset: false }).catch(error => {
        console.error('ProfileModelsList: Failed to fetch published models:', error)
      })
    } else {
      fetchLiked({ reset: false }).catch(error => {
        console.error('ProfileModelsList: Failed to fetch liked models:', error)
      })
    }
  }, [tab, fetchPublished, fetchLiked])

  // 处理加载更多
  const handleLoadMore = useCallback(() => {
    if (tab === 'published' && state.publishedHasMore && !state.isLoading && !isLoadingRef.current) {
      isLoadingRef.current = true
      console.log('ProfileModelsList: Loading more published models')
      loadMorePublished().finally(() => {
        isLoadingRef.current = false
      })
    }
  }, [tab, state.publishedHasMore, state.isLoading, loadMorePublished])

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

  const currentGroups = tab === 'published' ? state.publishedGroups : state.likedGroups
  const hasMore = tab === 'published' ? state.publishedHasMore : state.likedHasMore

  if (state.isLoading && currentGroups.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">{t('profile.loadingStyles')}</div>
      </div>
    )
  }

  if (state.error && currentGroups.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <p className="text-red-500 mb-2">{t('profile.errorLoadingStyles')} {state.error}</p>
          <button
            onClick={() => {
              if (tab === 'published') {
                fetchPublished({ reset: true })
              } else {
                fetchLiked({ reset: true })
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            {t('profile.retry')}
          </button>
        </div>
      </div>
    )
  }

  if (currentGroups.length === 0 && !state.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-6"> {/* padding-top: 40px, padding-bottom: 40px, gap: 24px */}
        {/* 图标 */}
        <img
          src={NanananaIcon}
          alt="Empty"
          className="w-[7.5rem] h-[7.5rem] dark:hidden" // 120x120px, 浅色模式显示
        />
        <img
          src={NanananaIconDark}
          alt="Empty"
          className="w-[7.5rem] h-[7.5rem] hidden dark:block" // 120x120px, 深色模式显示
        />

        {/* 文本提示 */}
        <div className="flex flex-col items-center gap-1"> {/* 两行文本间距4px */}
          <p className="font-switzer font-medium text-2xl leading-8 text-text-main dark:text-text-main-dark text-center"> {/* font-size: 24px, line-height: 32px */}
            {tab === 'published' ? t('profile.noPublishedStylesFound') : t('profile.noLikedStylesFound')}
          </p>
          <p className="font-switzer font-medium text-sm leading-5 text-[#9CA1AF] text-center"> {/* font-size: 14px, line-height: 20px */}
            {tab === 'published'
              ? t('profile.createFirstStyle')
              : t('profile.likeStyles')}
          </p>
        </div>

        {/* 创建按钮 */}
        <button className="w-40 h-9 min-w-40 px-4 flex items-center justify-center gap-1 rounded-full bg-link-default dark:bg-link-default-dark hover:bg-link-pressed dark:hover:bg-link-pressed-dark transition-colors"> {/* width: 160px, height: 36px, gap: 4px */}
          <img src={WorkflowBuilderIcon} alt={t('recipes.builder')} className="w-5 h-5" /> {/* 20x20px */}
          <span className="font-switzer font-medium text-sm leading-5 text-white"> {/* font-size: 14px, line-height: 20px */}
            {t('recipes.builder')}
          </span>
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {currentGroups.map((group: TimeGroup) => (
        <div key={group.groupKey} className="space-y-5">
          <div className="flex items-center">
            <h3 className="font-lexend font-semibold text-lg text-design-main-text dark:text-design-dark-main-text">
              {group.groupLabel}
            </h3>
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
              ({group.models.length})
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {group.models.map((model, index) => (
              <div key={`${model.model_id}-${index}`} className="flex justify-center">
                <WorkflowCard
                  item={convertModelToFeaturedItem(model)}
                  variant="profile_style"
                  profileTab={tab}
                  onClick={() => {
                    navigate(withLangPrefix(lang, `/model/${model.model_id}`))
                  }}
                  onUseClick={() => {
                    // 1. 设置延迟发送的消息
                    setPendingMessage('I want to generate an image.')
                    // 2. 打开详情页面（详情数据加载完成后会自动发送消息）
                    navigate(withLangPrefix(lang, `/model/${model.model_id}`))
                    // 3. 打开右侧聊天窗口（包含登录检查）
                    openChat()
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* 加载更多状态 */}
      {state.isLoading && currentGroups.length > 0 && (
        <div className="flex justify-center py-6">
          <div className="text-gray-500">{t('profile.loadingMoreStyles')}</div>
        </div>
      )}

      {/* 手动加载更多按钮 */}
      {hasMore && !state.isLoading && currentGroups.length > 0 && (
        <div className="flex justify-center py-6">
          <button
            onClick={handleLoadMore}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {t('profile.loadMore')}
          </button>
        </div>
      )}

      {/* 无更多数据提示 */}
      {!hasMore && currentGroups.length > 0 && (
        <div className="flex justify-center py-6">
          <div className="text-gray-400">{t('profile.noMoreStyles')}</div>
        </div>
      )}
    </div>
  )
}

export default ProfileModelsList 