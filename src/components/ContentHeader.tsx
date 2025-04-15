import React, { useState, useRef, useEffect } from 'react';
import styles from './ContentHeader.module.css';
import dropdownIcon from '../assets/dropdown.svg';
import backIcon from '../assets/back.svg';
import checkboxNormal from '../assets/checkbox_normal.svg';
import checkboxSelected from '../assets/checkbox_selected.svg';

interface ContentHeaderProps {
  activeTab: 'models' | 'images';
  setActiveTab: (tab: 'models' | 'images') => void;
  ownedOnly: boolean;
  setOwnedOnly: (owned: boolean) => void;
  sortOption: 'New Model' | 'Popular';
  setSortOption: (option: 'New Model' | 'Popular') => void;
  isDetailMode?: boolean;
  modelName?: string;
  onBackClick?: () => void;
}

const ContentHeader: React.FC<ContentHeaderProps> = ({
  activeTab,
  setActiveTab,
  ownedOnly,
  setOwnedOnly,
  sortOption,
  setSortOption,
  isDetailMode = false,
  modelName = '',
  onBackClick
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
  if (isDetailMode) {
    return (
      <div className={styles.contentHeader}>
        <div className={styles.detailNavigation} >
          <img src={backIcon} alt="Back" className={styles.backIcon} onClick={onBackClick}/>
          <span className={styles.modelsLabel}>Models</span>
          <div className={styles.divider}></div>
          <span className={styles.modelName}>{modelName}</span>
        </div>
      </div>
    );
  }

  // 正常模式显示标签和控制
  return (
    <div className={styles.contentHeader}>
      <div className={styles.tabGroup}>
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
        
        {activeTab === 'models' && (
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