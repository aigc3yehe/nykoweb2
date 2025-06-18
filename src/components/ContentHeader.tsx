import React, { useState, useRef, useEffect } from 'react';
import styles from './ContentHeader.module.css';
import dropdownIcon from '../assets/dropdown.svg';
import backIcon from '../assets/back.svg';
import checkboxNormal from '../assets/checkbox_normal.svg';
import checkboxSelected from '../assets/checkbox_selected.svg';
import shareIcon from '../assets/share_2.svg';
import editIcon from '../assets/edit.svg';
import { useAtom } from 'jotai';
import { accountAtom } from '../store/accountStore';
import { modelDetailAtom } from '../store/modelStore';
import { workflowDetailAtom } from '../store/workflowStore';
import { useNavigate } from 'react-router-dom';
import { encodeTopicName } from '../store/topicStore';

interface ContentHeaderProps {
  activeTab: 'models' | 'workflows' |'images' | 'agentApps';
  setActiveTab: (tab: 'models' | 'workflows' | 'images' | 'agentApps') => void;
  ownedOnly: boolean;
  setOwnedOnly: (owned: boolean) => void;
  sortOption: 'Newest' | 'Popular';
  setSortOption: (option: 'Newest' | 'Popular') => void;
  isModelDetailMode?: boolean;
  isWorkflowDetailMode?: boolean;
  modelName?: string;
  onBackClick?: () => void;
  tags?: string[];
  onShareClick?: () => void;
  onEditClick?: () => void;
}

const ContentHeader: React.FC<ContentHeaderProps> = ({
  activeTab,
  setActiveTab,
  ownedOnly,
  setOwnedOnly,
  sortOption,
  setSortOption,
  isModelDetailMode = false,
  isWorkflowDetailMode = false,
  modelName = '',
  onBackClick,
  tags = [],
  onShareClick,
  onEditClick
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [tabDropdownOpen, setTabDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const tabDropdownRef = useRef<HTMLDivElement>(null);
  const [modelDetailState] = useAtom(modelDetailAtom);
  const [workflowDetailState] = useAtom(workflowDetailAtom);

  const [accountState] = useAtom(accountAtom);
  const [canEdit, setCanEdit] = useState(false);
  const navigate = useNavigate();

  // hashtag点击处理函数
  const handleTagClick = (tag: string) => {
    navigate(`/?topic=${encodeTopicName(tag)}`);
  };

  // 移动端tab选项配置
  const tabOptions = [
    { key: 'workflows', label: 'Workflows' },
    { key: 'models', label: 'Models' },
    { key: 'images', label: 'Images' },
    { key: 'agentApps', label: 'Agent Apps' }
  ] as const;

  // 获取当前选中tab的显示文本
  const getCurrentTabLabel = () => {
    const currentTab = tabOptions.find(tab => tab.key === activeTab);
    return currentTab?.label || 'Select Tab';
  };

  // 处理移动端tab选择
  const handleTabSelect = (tabKey: 'models' | 'workflows' | 'images' | 'agentApps') => {
    setActiveTab(tabKey);
    setTabDropdownOpen(false);
  };

  useEffect(() => {
    console.log('isModelDetailMode', isModelDetailMode);
    console.log('isWorkflowDetailMode', isWorkflowDetailMode);
    console.log('modelDetailState.currentModel', modelDetailState.currentModel);
    console.log('workflowDetailState.currentWorkflow', workflowDetailState.currentWorkflow);
    console.log('accountState', accountState);
    if (isModelDetailMode) {
      setCanEdit(accountState.role === 'admin' || accountState.did === modelDetailState.currentModel?.creator);
    } else if (isWorkflowDetailMode) {
      setCanEdit(accountState.role === 'admin' || accountState.did === workflowDetailState.currentWorkflow?.creator);
    }
  }, [accountState, isModelDetailMode, isWorkflowDetailMode, modelDetailState.currentModel, workflowDetailState.currentWorkflow]);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (tabDropdownRef.current && !tabDropdownRef.current.contains(event.target as Node)) {
        setTabDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 如果是详情模式，显示返回导航
  if (isModelDetailMode || isWorkflowDetailMode) {
    return (
      <div className={styles.contentHeader}>
        <div className={styles.detailNavigation}>
          <div className={styles.navigationLeft}>
            <img src={backIcon} alt="Back" className={styles.backIcon} onClick={onBackClick}/>
            <span className={styles.modelsLabel}>{isModelDetailMode ? 'Models' : 'Workflows'}</span>
            <div className={styles.divider}></div>
            <span className={styles.modelName}>{modelName}</span>

            {tags.length > 0 && (
              <div className={styles.tagsContainer}>
                {tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className={styles.tag}
                    onClick={() => handleTagClick(tag)}
                    style={{ cursor: 'pointer' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className={styles.navigationRight}>
            <button className={styles.actionButton} onClick={onShareClick}>
              <img src={shareIcon} alt="Share" className={styles.actionIcon} />
            </button>
            {canEdit && (
              <button className={styles.actionButton} onClick={onEditClick}>
                <img src={editIcon} alt="Edit" className={styles.actionIcon} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 正常模式显示标签和控制
  return (
    <div className={styles.contentHeader}>
      {/* 移动端tab下拉选择器 */}
      <div className={styles.mobileTabDropdown} ref={tabDropdownRef}>
        <button
          className={styles.tabDropdownButton}
          onClick={() => setTabDropdownOpen(!tabDropdownOpen)}
        >
          {getCurrentTabLabel()} <img src={dropdownIcon} alt="dropdown" width={16} height={16} />
        </button>

        {tabDropdownOpen && (
          <div className={styles.tabDropdownMenu}>
            {tabOptions.map((option) => (
              <div
                key={option.key}
                className={`${styles.tabDropdownItem} ${activeTab === option.key ? styles.tabDropdownItemActive : ''}`}
                onClick={() => handleTabSelect(option.key)}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 桌面端tab组 */}
      <div className={styles.tabGroup}>
        <div
            className={`${styles.tab} ${activeTab === 'workflows' ? styles.active : styles.inactive}`}
            onClick={() => setActiveTab('workflows')}
        >
          Workflows
        </div>
        <div
            className={`${styles.tab} ${activeTab === 'models' ? styles.active : styles.inactive}`}
            onClick={() => setActiveTab('models')}
        >
          Models
        </div>
        <div
          className={`${styles.tab} ${activeTab === 'images' ? styles.active : styles.inactive}`}
          onClick={() => setActiveTab('images')}
        >
          Images
        </div>
        <div
          className={`${styles.tab} ${activeTab === 'agentApps' ? styles.active : styles.inactive}`}
          onClick={() => setActiveTab('agentApps')}
        >
          Agent Apps
        </div>
      </div>

      <div className={styles.controlsGroup}>
        {activeTab !== 'agentApps' && (
          <div
            className={styles.checkboxContainer}
            onClick={() => setOwnedOnly(!ownedOnly)}
          >
            <div className={styles.checkboxIcon}>
              <img
                src={ownedOnly ? checkboxSelected : checkboxNormal}
                alt="checkbox"
              />
            </div>
            <span className={styles.checkboxLabel}>Owned</span>
          </div>
        )}

        {(activeTab === 'models' || activeTab === 'workflows') && (
          <div className={styles.dropdownContainer} ref={dropdownRef}>
            <button
              className={styles.dropdown}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {sortOption} <img src={dropdownIcon} alt="dropdown" width={16} height={16} />
            </button>

            {dropdownOpen && (
              <div className={styles.dropdownMenu}>
                {['Newest', 'Popular'].map((option) => (
                  <div
                    key={option}
                    className={styles.dropdownItem}
                    onClick={() => {
                      setSortOption(option as 'Newest' | 'Popular');
                      setDropdownOpen(false);
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentHeader;