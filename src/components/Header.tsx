import React from 'react';
import styles from './Header.module.css';
import XIcon from '../assets/x.svg';
import DocIcon from '../assets/doc.svg';
import LoginButton from './LoginButton';

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <div className={styles.logoSection}>
        <h1 className={styles.title}>NIYOKO</h1>
      </div>
      <div className={styles.actionSection}>
        {/* X按钮 */}
        <button className={styles.iconButton}>
          <img src={XIcon} alt="Close" width="16" height="16" />
        </button>
        
        {/* Doc按钮 */}
        <button className={styles.docButton}>
          <img src={DocIcon} alt="Documentation" width="17" height="16" />
          <span>Doc</span>
        </button>
        
        {/* 登录按钮组件 */}
        <LoginButton />
      </div>
    </header>
  );
};

export default Header; 