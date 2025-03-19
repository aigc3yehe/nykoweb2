import React, { useState } from 'react';
import styles from './Header.module.css';
import { pxToRem } from '../utils';
import XIcon from '../assets/x.svg';
import DocIcon from '../assets/doc.svg';
import GoldIcon from '../assets/gold.svg';

interface HeaderProps {
  isLoggedIn?: boolean;
  walletAddress?: string;
  credits?: number;
}

const Header: React.FC<HeaderProps> = ({ 
  isLoggedIn = true, 
  walletAddress = '0x1234567890abcdef1234', 
  credits = 1000000 
}) => {
  // 格式化钱包地址，显示前4位和后4位
  const formatAddress = (address: string) => {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // 格式化数字，添加千位分隔符
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

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
        
        {/* 根据登录状态显示不同按钮 */}
        {isLoggedIn ? (
          <>
            {/* Credits显示 */}
            <div className={styles.creditsContainer}>
              <span className={styles.creditsAmount}>{formatNumber(credits)}</span>
              <span className={styles.creditsLabel}>Credits</span>
            </div>
            
            {/* 账户显示 */}
            <div className={styles.accountContainer}>
              <img src={GoldIcon} alt="Account" width="16" height="16" />
              <span className={styles.accountAddress}>{formatAddress(walletAddress)}</span>
            </div>
          </>
        ) : (
          // 未登录状态显示Login按钮
          <button className={styles.loginButton}>Login</button>
        )}
      </div>
    </header>
  );
};

export default Header; 