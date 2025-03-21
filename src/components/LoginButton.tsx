import React from 'react';
import { useLoginWithOAuth, usePrivy } from '@privy-io/react-auth';
import styles from './LoginButton.module.css';
import twitterIcon from '../assets/twitter-icon.svg'; // 确保有此资源或替换为合适的图标
import GoldIcon from '../assets/gold.svg';
import { useAtom } from 'jotai';
import { accountAtom } from '../store/accountStore';

interface LoginButtonProps {
  className?: string;
}

const LoginButton: React.FC<LoginButtonProps> = ({ className }) => {
  const { login, authenticated, logout } = usePrivy();
  const [accountState] = useAtom(accountAtom);
  const { walletAddress, credits } = accountState;
  const { initOAuth, loading } = useLoginWithOAuth({
    onComplete: ({ user, isNewUser }) => {
      console.log('登录成功', user);
      if (isNewUser) {
        console.log('新用户', user);
        // 这里可以添加新用户的初始化逻辑
      }
    },
    onError: (error) => {
      console.error('登录失败', error);
    }
  });

  // 格式化钱包地址，显示前4位和后4位
  const formatAddress = (address: string | null) => {
    if (!address || address.length < 10) return address || '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // 格式化数字，添加千位分隔符
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const handleTwitterLogin = async () => {
    try {
      // 使用Twitter作为OAuth提供者
      await initOAuth({ provider: 'twitter' });
    } catch (error) {
      console.error('启动Twitter登录时出错:', error);
    }
  };

  // 处理通用登录
  const handleLogin = () => {
    login();
  };

  // 用户已登录，显示账户信息
  if (authenticated) {
    return (
      <div className={styles.loggedInContainer}>
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
        
        <button 
          className={`${styles.logoutButton} ${className}`} 
          onClick={logout}
        >
          登出
        </button>
      </div>
    );
  }

  // 用户未登录，显示登录选项
  return (
    <div className={styles.loginContainer}>
      {/* Twitter登录按钮 */}
      <button 
        className={`${styles.loginButton} ${className}`} 
        onClick={handleTwitterLogin}
        disabled={loading}
      >
        {loading ? 'Logining...' : 'Login'}
      </button>
    </div>
  );
};

export default LoginButton; 