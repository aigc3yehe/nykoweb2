import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useI18n } from '../hooks/useI18n'
import RecipesTab from '../components/recipes/RecipesTab'
import RecipesActions from '../components/recipes/RecipesActions'
import WorkflowsList from '../components/recipes/WorkflowsList'
import StylesList from '../components/recipes/StylesList'

export type RecipeType = 'workflows' | 'styles'

const Recipes: React.FC = () => {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { tab } = useParams<{ tab?: string }>()
  const [activeTab, setActiveTab] = useState<RecipeType>('workflows')

  // 从URL参数初始化activeTab
  useEffect(() => {
    if (tab === 'workflows' || tab === 'styles') {
      setActiveTab(tab)
    } else if (tab) {
      // 如果URL参数不正确，重定向到workflows
      navigate('/recipes/workflows', { replace: true })
    }
  }, [tab, navigate])

  // 处理tab切换
  const handleTabChange = (newTab: RecipeType) => {
    setActiveTab(newTab)
    navigate(`/recipes/${newTab}`)
  }

  // 如果没有tab参数，默认重定向到workflows
  useEffect(() => {
    if (!tab) {
      navigate('/recipes/workflows', { replace: true })
    }
  }, [tab, navigate])

  return (
    <div className="p-6">
      <div className="flex flex-col gap-5">
        {/* Tab 导航 */}
        <RecipesTab activeTab={activeTab} onTabChange={handleTabChange} />

        {/* 快捷操作组件 */}
        <RecipesActions activeTab={activeTab} />

        {/* 内容区域 */}
        <div className="min-h-96">
          {activeTab === 'workflows' && <WorkflowsList />}
          {activeTab === 'styles' && <StylesList />}
        </div>
      </div>
    </div>
  )
}

export default Recipes