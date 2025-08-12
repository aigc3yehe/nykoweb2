import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang, withLangPrefix } from '../../hooks/useLang'
import { RecipeType } from '../../pages/Recipes'
import DropdownIcon from '../../assets/web2/drop_down.svg'
import SearchIcon from '../../assets/web2/search.svg'
import AddIcon from '../../assets/web2/add.svg'

interface RecipesActionsProps {
  activeTab: RecipeType
}

const RecipesActions: React.FC<RecipesActionsProps> = ({ activeTab }) => {
  const navigate = useNavigate()
  const lang = useLang()
  const [selectedOption, setSelectedOption] = useState('All')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const options = ['All', 'Featured', 'Popular', 'Recent']

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option)
    setIsDropdownOpen(false)
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

  // 处理点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="h-9 flex items-center gap-3">
      {/* 左侧选项按钮 */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="min-w-[101px] h-9 flex items-center justify-between gap-1 px-3.5 py-2.5 rounded-md border border-gray-200 bg-white"
        >
          <span className="font-lexend font-normal text-sm leading-none text-[#4B5563]">
            {selectedOption}
          </span>
          <img src={DropdownIcon} alt="Dropdown" className="w-4 h-4" />
        </button>

        {/* 下拉菜单 */}
        {isDropdownOpen && (
          <div className="absolute top-full left-0 mt-1 min-w-[101px] bg-white border border-[#3741514D] rounded-md shadow-lg z-10">
            <div className="p-2 flex flex-col gap-1.5">
              {options.map(option => (
                <button
                  key={option}
                  onClick={() => handleOptionSelect(option)}
                  className={`
                    h-7.5 px-2.5 py-2 rounded-md text-sm font-lexend font-normal leading-none capitalize
                    ${selectedOption === option 
                      ? 'bg-[#EEF2FF] text-[#0900FF]' 
                      : 'text-[#4B5563] hover:bg-gray-50'
                    }
                  `}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* PC端spacer - 占满剩余空间把搜索框挤到右边 */}
      <div className="hidden md:block md:flex-1"></div>

      {/* 搜索框 - 移动端动态计算剩余宽度 */}
      <div className="w-[calc(100%-169px)] md:w-[218px] h-9 flex items-center gap-1.5 px-3.5 py-2.5 border border-gray-200 rounded-md bg-white">
        <img src={SearchIcon} alt="Search" className="w-4 h-4" />
        <input
          type="text"
          placeholder="Search"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="flex-1 h-3.5 font-lexend font-normal text-sm leading-none text-[#9CA3AF] placeholder-[#9CA3AF] bg-transparent border-none outline-none"
        />
      </div>

      {/* 新建按钮 - 移动端44*36px */}
      <button 
        onClick={handleNewClick}
        className="w-11 h-9 md:w-auto md:h-9 flex items-center justify-center gap-1.5 md:px-3.5 py-2.5 bg-[#0900FF] rounded-md hover:bg-[#0800E6] transition-colors"
      >
        <img src={AddIcon} alt="Add" className="w-4 h-4" />
        <span className="hidden md:inline font-lexend font-normal text-sm leading-none text-white">
          New {activeTab === 'workflows' ? 'Workflow' : 'Style'}
        </span>
      </button>
    </div>
  )
}

export default RecipesActions