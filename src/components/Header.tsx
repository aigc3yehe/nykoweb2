import React from 'react';
import styles from './Header.module.css';
import XIcon from '../assets/x.svg';
import DocIcon from '../assets/doc.svg';
import LoginButton from './LoginButton';

const Header: React.FC = () => {

  const handleTwitterClick = () => {
      window.open('https://x.com/niyoko_agent', '_blank');
  }
  return (
    <header className={styles.header}>
      <div className={styles.logoSection}>
        <h1 className={styles.title}>NIYOKO</h1>
      </div>
      <div className={styles.actionSection}>
        {/* X按钮 */}
        <button className={styles.iconButton} onClick={handleTwitterClick}>
          <img src={XIcon} alt="Close" className={styles.twitterIcon}/>
        </button>

        {/* Doc按钮 */}
        <button className={styles.docButton}>
          <img src={DocIcon} alt="Documentation" className={styles.docIcon}/>
          <span>Doc</span>
        </button>

        {/* 登录按钮组件 */}
        <LoginButton />
      </div>
    </header>
  );
};

export default Header;