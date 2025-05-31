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

interface ContentHeaderProps {
  activeTab: 'models' | 'workflows' |'images';
  setActiveTab: (tab: 'models' | 'workflows' | 'images') => void;
  ownedOnly: boolean;
  setOwnedOnly: (owned: boolean) => void;
  sortOption: 'New Model' | 'Popular';
  setSortOption: (option: 'New Model' | 'Popular') => void;
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [modelDetailState] = useAtom(modelDetailAtom);
  const [workflowDetailState] = useAtom(workflowDetailAtom);

  const [accountState] = useAtom(accountAtom);
  const [canEdit, setCanEdit] = useState(false);

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
  }, [isModelDetailMode, isWorkflowDetailMode, modelDetailState.currentModel, workflowDetailState.currentWorkflow]);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
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
                  <span key={index} className={styles.tag}>
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
      </div>

      <div className={styles.controlsGroup}>
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
                {['New Model', 'Popular'].map((option) => (
                  <div
                    key={option}
                    className={styles.dropdownItem}
                    onClick={() => {
                      setSortOption(option as 'New Model' | 'Popular');
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