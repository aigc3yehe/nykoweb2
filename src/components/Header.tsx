import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
import XIcon from '../assets/x.svg';
import DocIcon from '../assets/doc.svg';
import S1ActivityIcon from '../assets/s1_activity.svg';
import LoginButton from './LoginButton';

const Header: React.FC = () => {
  const navigate = useNavigate();

  const handleTwitterClick = () => {
      window.open('https://x.com/niyoko_agent', '_blank');
  }

  const handleDocClick = () => {
      window.open('https://nyko.cool', '_blank');
  }

  const handleActivityClick = () => {
      navigate('/activity');
  }

  return (
    <header className={styles.header}>
      <div className={styles.logoSection}>
        <h1 className={styles.title}>NYKO</h1>
      </div>
      <div className={styles.actionSection}>
        {/* X按钮 */}
        <button className={styles.iconButton} onClick={handleTwitterClick}>
          <img src={XIcon} alt="Close" className={styles.twitterIcon}/>
        </button>

        {/* Doc按钮 */}
        <button className={styles.docButton} onClick={handleDocClick}>
          <img src={DocIcon} alt="Documentation" className={styles.docIcon}/>
          <span>Doc</span>
        </button>

        {/* 活动按钮 */}
        <button className={styles.activityButton} onClick={handleActivityClick}>
          <img src={S1ActivityIcon} alt="Activity" className={styles.activityIcon}/>
          <span>Primedata S1</span>
        </button>

        {/* 登录按钮组件 */}
        <LoginButton />
      </div>
    </header>
  );
};

export default Header;