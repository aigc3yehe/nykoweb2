import React from 'react'
import { RecipeType } from '../../pages/Recipes'
import { useNavigate } from 'react-router-dom'
import { useLang, withLangPrefix } from '../../hooks/useLang'
import CreditBtnIcon from '../../assets/mavae/credit_btn.svg'
import StyleCreateIcon from '../../assets/mavae/style_create.svg'
import StyleCreateIconDark from '../../assets/mavae/dark/style_create.svg'
import ThemeAdaptiveIcon from '../ui/ThemeAdaptiveIcon'

interface RecipesTabProps {
  activeTab: RecipeType
  onTabChange: (tab: RecipeType) => void
}

const RecipesTab: React.FC<RecipesTabProps> = ({ activeTab, onTabChange }) => {
  const navigate = useNavigate()
  const lang = useLang()
  
  const tabs = [
    { key: 'workflows' as RecipeType, label: 'Workflows' },
    { key: 'styles' as RecipeType, label: 'Styles' }
  ]

  // 处理新建按钮点击事件
  const handleNewClick = () => {
    if (activeTab === 'workflows') {
      // 导航到工作流构建器页面
      navigate(withLangPrefix(lang, '/workflow/builder'))
    } else if (activeTab === 'styles') {
      // 导航到风格训练器页面
      navigate(withLangPrefix(lang, '/style/trainer'))
    }
  }

  return (
    <div className="w-full h-10 flex items-center justify-between border-b border-line-subtle dark:border-line-subtle-dark"> {/* width: full, height: 40px, justify-content: space-between, border-bottom: 1px solid #E2E4E8 */}
      {/* 左侧Tab按钮 */}
      <div className="flex gap-6">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`
              h-10 flex items-center gap-2.5 py-2 relative
              font-switzer font-semibold text-base leading-6
              ${activeTab === tab.key 
                ? 'text-text-main dark:text-text-main-dark' 
                : 'text-text-secondary dark:text-text-secondary-dark'
              }
            `}
          >
            {/* 文本 */}
            <span className="h-6 font-switzer font-semibold text-base leading-6"> {/* height: 24px, font-size: 16px, line-height: 24px */}
              {tab.label}
            </span>
            
            {/* 选中状态的下划线指示条 */}
            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-text-main dark:bg-text-main-dark rounded-xl"></div>
            )}
          </button>
        ))}
      </div>

      {/* 移动端新建按钮 - PC端隐藏 */}
      <button 
        onClick={handleNewClick}
        className={`
          md:hidden h-8 px-3 flex items-center gap-1 rounded-full transition-colors
          ${activeTab === 'workflows' 
            ? 'bg-[#84CC161A] hover:bg-[#84CC1626]' 
            : 'bg-[#0DA3A31A] hover:bg-[#0DA3A326]'
          }
        `}
      >
        {activeTab === 'workflows' ? (
          <>
            <img src={CreditBtnIcon} alt="Builder" className="w-4 h-4" />
            <span className="font-switzer font-medium text-sm leading-6 text-[#65A30D]">
              Builder
            </span>
          </>
        ) : (
          <>
            <ThemeAdaptiveIcon
              lightIcon={StyleCreateIcon}
              darkIcon={StyleCreateIconDark}
              alt="New Style"
              size="sm"
              className="w-4 h-4"
            />
            <span className="font-switzer font-medium text-sm leading-6 text-[#0DA3A3]">
              New Style
            </span>
          </>
        )}
      </button>
    </div>
  )
}

export default RecipesTab