import React, { useState } from 'react';
import styles from './ContentDisplay.module.css';

const ContentDisplay: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'models' | 'images'>('models');
  const [ownedOnly, setOwnedOnly] = useState(false);

  return (
    <div className={styles.contentDisplay}>
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
          
          <button className={styles.dropdown}>
            New Model <span>▼</span>
          </button>
        </div>
      </div>
      
      <div className={styles.contentBody}>
        <div className={styles.placeholder}>
          <p>这里是内容展示区域，可以根据需求进行开发。</p>
          <p>当前显示: {activeTab === 'models' ? '模型' : '图片'}</p>
          <p>筛选条件: {ownedOnly ? '仅显示已拥有' : '显示全部'}</p>
        </div>
      </div>
    </div>
  );
};

export default ContentDisplay;