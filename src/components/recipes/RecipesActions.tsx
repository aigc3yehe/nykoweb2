import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang, withLangPrefix } from '../../hooks/useLang'
import { RecipeType } from '../../pages/Recipes'
import { cn } from '../../utils/cn'
import CreditBtnIcon from '../../assets/mavae/credit_btn.svg'
import StyleCreateIcon from '../../assets/mavae/style_create.svg'
import StyleCreateIconDark from '../../assets/mavae/dark/style_create.svg'
import ThemeAdaptiveIcon from '../ui/ThemeAdaptiveIcon'

interface RecipesActionsProps {
  activeTab: RecipeType
  onSortChange?: (sortOption: string) => void
}

const RecipesActions: React.FC<RecipesActionsProps> = ({ activeTab, onSortChange }) => {
  const navigate = useNavigate()
  const lang = useLang()
  const [selectedOption, setSelectedOption] = useState('All')

  const options = ['All', 'Popular', 'Recent']

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option)
    
    // 调用父组件的排序回调
    if (onSortChange) {
      onSortChange(option)
    }
  }

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
    <div className="w-full h-auto md:h-9 flex items-center justify-between pt-3 pb-6 md:pt-0 md:pb-0"> {/* 移动端: height: auto, padding: 12px 16px 24px 16px, PC端: height: 36px */}
      {/* 左侧分段选择器 */}
      <div className="w-full md:w-auto h-9 px-px py-px rounded-full bg-quaternary dark:bg-quaternary-dark border border-line-subtle dark:border-line-subtle-dark"> {/* 移动端: 宽度占满, PC端: 自适应宽度 */}
        {options.map((option) => (
          <button
            key={option}
            onClick={() => handleOptionSelect(option)}
                         className={cn(
               "h-8 px-4 rounded-full transition-all duration-200", // height: 32px, padding: 16px
               "md:min-w-[6.875rem]", // PC端: min-width: 110px
               "w-1/3 md:w-auto md:flex-none", // 移动端: 平分1/3宽度, PC端: 自适应
              selectedOption === option
                ? "bg-btn-selected dark:bg-btn-selected-dark shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.1)]" // 选中状态
                : "hover:bg-quaternary dark:hover:bg-quaternary-dark" // 未选中状态
            )}
          >
            <span className={cn(
              "font-switzer font-medium text-sm leading-[1.375rem] text-center", // font-size: 14px, line-height: 22px
              selectedOption === option
                ? "text-text-main dark:text-text-main-dark" // 选中状态字体颜色
                : "text-text-secondary dark:text-text-secondary-dark" // 未选中状态字体颜色
            )}>
              {option}
            </span>
          </button>
        ))}
      </div>

      {/* PC端新建按钮 - 移动端隐藏 */}
      <button 
        onClick={handleNewClick}
        className={cn(
          "hidden md:flex h-9 px-4 items-center gap-1 rounded-full transition-colors",
          activeTab === 'workflows' 
            ? "bg-[#84CC161A] hover:bg-[#84CC1626]" 
            : "bg-[#0DA3A31A] hover:bg-[#0DA3A326]"
        )}
      >
        {activeTab === 'workflows' ? (
          <>
            <img src={CreditBtnIcon} alt="Builder" className="w-4 h-4" />
            <span className="h-6 font-switzer font-medium text-sm leading-6 text-[#65A30D]">
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
            <span className="h-6 font-switzer font-medium text-sm leading-6 text-[#0DA3A3]">
              New Style
            </span>
          </>
        )}
      </button>
    </div>
  )
}

export default RecipesActions