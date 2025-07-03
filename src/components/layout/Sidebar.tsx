import React, { useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useAtom, useSetAtom } from 'jotai'
import { sidebarOpenAtom, closeSidebarAtom } from '../../store/sidebarStore'
import { useI18n } from '../../hooks/useI18n'
import { cn } from '../../utils/cn'

// 导入SVG图标
import HomeIcon from '../../assets/web2/home.svg'
import HomeSelectedIcon from '../../assets/web2/home_selected.svg'
import RecipesIcon from '../../assets/web2/recipes_normal.svg'
import RecipesSelectedIcon from '../../assets/web2/recipes_selected.svg'
import CreatorsIcon from '../../assets/web2/creators.svg'
import CreatorsSelectedIcon from '../../assets/web2/creators_selected.svg'
import GeneratorIcon from '../../assets/web2/generator.svg'
import WorkflowBuilderIcon from '../../assets/web2/workflows_builder.svg'
import StyleTrainerIcon from '../../assets/web2/style_trainer.svg'
import MyAssetsIcon from '../../assets/web2/my_assets.svg'
import MyAssetsSelectedIcon from '../../assets/web2/my_assets_selected.svg'

interface NavItem {
  key: string
  label: string
  icon: React.ReactNode
  selectedIcon: React.ReactNode
  path: string
  badge?: string
}

interface NavSection {
  title: string
  items: NavItem[]
}

const Sidebar: React.FC = () => {
  const { t } = useI18n()
  const location = useLocation()
  const [isOpen] = useAtom(sidebarOpenAtom)
  const closeSidebar = useSetAtom(closeSidebarAtom)

  // 路由变化时关闭移动端侧边栏
  useEffect(() => {
    closeSidebar()
  }, [location.pathname, closeSidebar])

  // Discover 组 - 20x20 图标
  const discoverItems: NavItem[] = [
    {
      key: 'home',
      label: t('nav.home'), // en: Home / zh: 首页
      icon: <img src={HomeIcon} alt="Home" className="w-5 h-5" />,
      selectedIcon: <img src={HomeSelectedIcon} alt="Home" className="w-5 h-5" />,
      path: '/'
    },
    {
      key: 'recipes',
      label: t('nav.recipes'), // en: Recipes / zh: 组合
      icon: <img src={RecipesIcon} alt="Recipes" className="w-5 h-5" />,
      selectedIcon: <img src={RecipesSelectedIcon} alt="Recipes" className="w-5 h-5" />,
      path: '/recipes'
    },
  ]

  // Creative tools 组 - 32x32 图标
  const creativeToolsItems: NavItem[] = [
    {
      key: 'generator',
      label: t('nav.generator'), // en: Generator / zh: 生成器
      icon: <img src={GeneratorIcon} alt="Generator" className="w-8 h-8" />,
      selectedIcon: <img src={GeneratorIcon} alt="Generator" className="w-8 h-8" />,
      path: '/generator'
    },
    {
      key: 'workflow-builder',
      label: t('nav.workflowBuilder'), // en: Workflow Builder / zh: 工作流构建器
      icon: <img src={WorkflowBuilderIcon} alt="Workflow Builder" className="w-8 h-8" />,
      selectedIcon: <img src={WorkflowBuilderIcon} alt="Workflow Builder" className="w-8 h-8" />,
      path: '/workflow-builder'
    },
    {
      key: 'style-trainer',
      label: t('nav.styleTrainer'), // en: Style Trainer / zh: 风格训练器
      icon: <img src={StyleTrainerIcon} alt="Style Trainer" className="w-8 h-8" />,
      selectedIcon: <img src={StyleTrainerIcon} alt="Style Trainer" className="w-8 h-8" />,
      path: '/style-trainer'
    }
  ]

  // My 组 - 16x16 图标
  const myItems: NavItem[] = [
    {
      key: 'assets',
      label: t('nav.assets'), // en: My Assets / zh: 我的资产
      icon: <img src={MyAssetsIcon} alt="My Assets" className="w-4 h-4" />,
      selectedIcon: <img src={MyAssetsSelectedIcon} alt="My Assets" className="w-4 h-4" />,
      path: '/assets'
    }
  ]

  const sections: NavSection[] = [
    {
      title: t('nav.discover'), // en: Discover / zh: 发现
      items: discoverItems
    },
    {
      title: t('nav.creativeTools'), // en: Creative Tools / zh: 创意工具
      items: creativeToolsItems
    },
    {
      title: t('nav.my'), // en: My / zh: 我的
      items: myItems
    }
  ]

  return (
    <>
      {/* 遮罩层 - 移动端显示 */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => closeSidebar()}
        />
      )}
      
      {/* 侧边栏 */}
      <aside className={cn(
        "fixed md:relative inset-y-0 left-0 z-50 md:z-auto",
        "w-64 border-r border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700",
        "pt-6 pr-4 pb-6 pl-4",
        "transform transition-transform duration-300 ease-in-out md:transform-none",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* 移动端关闭按钮 */}
        <div className="flex md:hidden justify-end mb-4">
          <button
            onClick={() => closeSidebar()}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex flex-col h-full">
          <nav className="flex-1 space-y-4">
            {sections.map((section, sectionIndex) => (
              <div key={section.title}>
                {/* 分组标题 - 按设计规范样式 */}
                <h3 className="h-3 px-3 font-lexend font-normal text-xs leading-none tracking-normal text-gray-400 dark:text-gray-500 mb-4">
                  {section.title}
                </h3>

                {/* 分组导航项 - 第一组高度94px，间距6px；第二组高度180px，间距6px */}
                <div className={cn(
                  "space-y-1.5",
                  sectionIndex === 0 && "h-24", // 94px ≈ h-24
                  sectionIndex === 1 && "h-45" // 180px ≈ h-45
                )}>
                  {section.items.map((item) => (
                    <Link
                      key={item.key}
                      to={item.path}
                      className={cn(
                        "flex items-center transition-all duration-200 font-lexend text-sm leading-none tracking-normal",
                        // 第二组 Creative tools 的特殊样式
                        sectionIndex === 1
                          ? "gap-2 h-14 rounded-xl p-3 border border-design-line-light-gray dark:border-design-dark-line-light-gray text-design-main-text dark:text-design-dark-main-text font-normal hover:bg-gray-50 dark:hover:bg-gray-800"
                          : "gap-1 h-11 rounded-xl p-3",
                        // 第一组和第三组的选中效果
                        sectionIndex !== 1 && location.pathname === item.path
                          ? "bg-design-bg-light-blue font-bold text-design-main-blue"
                          : sectionIndex !== 1
                          ? "text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 font-normal"
                          : ""
                      )}
                    >
                      <div className="flex-shrink-0">
                        {sectionIndex !== 1 && location.pathname === item.path ? item.selectedIcon : item.icon}
                      </div>
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </>
  )
}

export default React.memo(Sidebar)