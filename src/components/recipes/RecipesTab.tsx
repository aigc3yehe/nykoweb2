import React from 'react'
import { RecipeType } from '../../pages/Recipes'

interface RecipesTabProps {
  activeTab: RecipeType
  onTabChange: (tab: RecipeType) => void
}

const RecipesTab: React.FC<RecipesTabProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { key: 'workflows' as RecipeType, label: 'Workflows' },
    { key: 'styles' as RecipeType, label: 'Styles' }
  ]

  return (
    <div className="h-10 md:h-12 flex gap-8 md:border-b md:border-gray-200">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`
            h-10 md:h-12 flex items-center gap-1 px-0 py-3 
            border-b-2 font-lexend text-xl md:text-2xl leading-none
            ${activeTab === tab.key 
              ? 'border-b-[#0900FF] text-[#1F2937] font-medium' 
              : 'border-b-transparent text-[#4B5563] font-normal'
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export default RecipesTab