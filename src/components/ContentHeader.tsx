import React, { useState, useRef, useEffect } from 'react';
import styles from './ContentHeader.module.css';
import dropdownIcon from '../assets/dropdown.svg';

interface ContentHeaderProps {
  activeTab: 'models' | 'images';
  setActiveTab: (tab: 'models' | 'images') => void;
  ownedOnly: boolean;
  setOwnedOnly: (owned: boolean) => void;
  sortOption: 'New Model' | 'MKT CAP' | 'Popular';
  setSortOption: (option: 'New Model' | 'MKT CAP' | 'Popular') => void;
}

const ContentHeader: React.FC<ContentHeaderProps> = ({
  activeTab,
  setActiveTab,
  ownedOnly,
  setOwnedOnly,
  sortOption,
  setSortOption
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
        <div className={styles.checkboxContainer}>
          <input 
            type="checkbox" 
            id="owned-check" 
            checked={ownedOnly}
            onChange={() => setOwnedOnly(!ownedOnly)}
          />
          <label htmlFor="owned-check" className={styles.checkboxLabel}>Owned</label>
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
                {['New Model', 'MKT CAP', 'Popular'].map((option) => (
                  <div 
                    key={option} 
                    className={styles.dropdownItem}
                    onClick={() => {
                      setSortOption(option as 'New Model' | 'MKT CAP' | 'Popular');
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