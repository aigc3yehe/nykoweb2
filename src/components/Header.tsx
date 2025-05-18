import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
import XIcon from '../assets/x.svg';
import DocIcon from '../assets/doc.svg';
import DiscordIcon from '../assets/discord.svg';
import DEXScreenerIcon from '../assets/DEXScreener.svg';
import S1ActivityIcon from '../assets/s1_activity.svg';
import LoginButton from './LoginButton';
import {useLogin, usePrivy} from "@privy-io/react-auth";

const Header: React.FC = () => {
  const { authenticated } = usePrivy();
  const navigate = useNavigate();

  const handleDexscreenerClick = () => {
      window.open('https://dexscreener.com/base/0xbf2351085f543ff623441c4330d145f94f513542', '_blank');
  }

  const handleDiscordClick = () => {
      window.open('https://discord.gg/3aEQun7TBC', '_blank');
  }

  const handleTwitterClick = () => {
      window.open('https://x.com/niyoko_agent', '_blank');
  }

  const handleDocClick = () => {
      window.open('https://nyko.cool', '_blank');
  }

  const handleLogin = () => {
      try {
          login();
      } catch (error) {
          console.error("login Twitter failed:", error);
      }
  };

  const handleActivityClick = () => {
      if (authenticated) {
          navigate('/primedatas1');
      } else {
          handleLogin();
      }
  }
  const { login } = useLogin();

  const goHome = () => {
      navigate('/');
  }

  return (
    <header className={styles.header}>
      <div className={styles.logoSection} onClick={goHome}>
        <h1 className={styles.title}>NYKO</h1>
      </div>
      <div className={styles.actionSection}>
        {/* Dexscreener 按钮 */}
        <button className={styles.iconButton} onClick={handleDexscreenerClick}>
          <img src={DEXScreenerIcon} alt="dexscreener" className={styles.dexscreenerIcon}/>
        </button>

        {/* Discord按钮 */}
        <button className={styles.iconButton} onClick={handleDiscordClick}>
          <img src={DiscordIcon} alt="discord" className={styles.discordIcon}/>
        </button>

        {/* X按钮 */}
        <button className={styles.iconButton} onClick={handleTwitterClick}>
          <img src={XIcon} alt="x" className={styles.twitterIcon}/>
        </button>

        {/* Doc按钮 */}
        <button className={styles.docButton} onClick={handleDocClick}>
          <img src={DocIcon} alt="Documentation" className={styles.docIcon}/>
        </button>

        {/* 活动按钮 */}
        <button className={styles.activityButton} onClick={handleActivityClick}>
          <img src={S1ActivityIcon} alt="Activity" className={styles.activityIcon}/>
          <span className="hidden pc:inline">Primedata S1</span>
          <span className="inline pc:hidden">S1</span>
        </button>

        {/* 登录按钮组件 */}
        <LoginButton />
      </div>
    </header>
  );
};

export default Header;