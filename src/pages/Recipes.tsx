import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLang, withLangPrefix } from '../hooks/useLang'
import { useI18n } from '../hooks/useI18n'
import RecipesTab from '../components/recipes/RecipesTab'
import RecipesActions from '../components/recipes/RecipesActions'
import WorkflowsList from '../components/recipes/WorkflowsList'
import StylesList from '../components/recipes/StylesList'

export type RecipeType = 'workflows' | 'styles'

const Recipes: React.FC = () => {
  const { t } = useI18n()
  const navigate = useNavigate()
  const lang = useLang()
  const { tab } = useParams<{ tab?: string }>()
  const [activeTab, setActiveTab] = useState<RecipeType>('workflows')
  const [sortOption, setSortOption] = useState('All')

  // 从URL参数初始化activeTab
  useEffect(() => {
    if (tab === 'workflows' || tab === 'styles') {
      setActiveTab(tab)
    } else if (tab) {
      // 如果URL参数不正确，重定向到workflows
      navigate(withLangPrefix(lang, '/cases/workflows'), { replace: true })
    }
  }, [tab, navigate])

  // 处理tab切换
  const handleTabChange = (newTab: RecipeType) => {
    setActiveTab(newTab)
    navigate(withLangPrefix(lang, `/cases/${newTab}`))
  }

  // 处理排序变化
  const handleSortChange = (newSortOption: string) => {
    setSortOption(newSortOption)
  }

  // 如果没有tab参数，默认重定向到workflows
  useEffect(() => {
    if (!tab) {
      navigate(withLangPrefix(lang, '/cases/workflows'), { replace: true })
    }
  }, [tab, navigate])

  return (
    <div className="w-full px-4 md:px-8 pb-10 flex flex-col md:gap-6"> {/* width: 1352px (full), padding: 32px 32px 40px 32px, gap: 24px */}
      {/* 移动端标题 */}
      <h1 className="md:hidden h-16 py-4 font-switzer font-bold text-2xl leading-8 text-text-main dark:text-text-main-dark"> {/* height: 64px, padding: 16px, font-size: 24px, line-height: 32px */}
        {t('pages.recipes')}
      </h1>

      {/* Tab 导航 */}
      <RecipesTab activeTab={activeTab} onTabChange={handleTabChange} />

      {/* 快捷操作组件 */}
      <RecipesActions activeTab={activeTab} onSortChange={handleSortChange} />

      {/* 内容区域 */}
      <div className="min-h-96">
        {activeTab === 'workflows' && <WorkflowsList sortOption={sortOption} />}
        {activeTab === 'styles' && <StylesList sortOption={sortOption} />}
      </div>
    </div>
  )
}

export default Recipes