import React from 'react';
import { useLoginWithOAuth, usePrivy } from '@privy-io/react-auth';
import styles from './LoginButton.module.css';
import GoldIcon from '../assets/gold.svg';
import { useAtom, useSetAtom } from 'jotai';
import { accountAtom, setUser } from '../store/accountStore';
import { createUser } from '../services/userService';

interface LoginButtonProps {
  className?: string;
}

const LoginButton: React.FC<LoginButtonProps> = ({ className }) => {
  const { login, authenticated, logout } = usePrivy();
  const [accountState] = useAtom(accountAtom);
  const { walletAddress, credits, twitter } = accountState;
  const setUserData = useSetAtom(setUser);
  
  const { initOAuth, loading } = useLoginWithOAuth({
    onComplete: async ({ user, isNewUser }) => {
      console.log('登录成功', user);
      
      // 如果有用户信息，则调用用户创建API
      if (user) {
        try {
          // 准备用户数据
          const userData = {
            did: user.id,
            address: user.wallet?.address,
            username: user.twitter?.username,
            subject: user.twitter?.subject,
            name: user.twitter?.name,
            profilePictureUrl: user.twitter?.profilePictureUrl
          };
          
          // 调用创建用户API
          await createUser(userData);
          console.log('用户创建/更新成功');
          
          // 特别处理新用户
          if (isNewUser) {
            console.log('新用户', user);
            // 这里可以添加新用户的其他初始化逻辑
          }
        } catch (error) {
          console.error('用户创建/更新失败', error);
        }
        
        // 更新全局用户状态
        setUserData(user);
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
    initOAuth();
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
          <img src={twitter?.profilePictureUrl || ''} alt="Twitter Avatar" className={styles.avatarIcon} />
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
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? '登录中...' : '登录/注册'}
      </button>
    </div>
  );
};

export default LoginButton; 