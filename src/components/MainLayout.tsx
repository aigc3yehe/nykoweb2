import React, { useState } from 'react';
import Header from './Header';
import ContentDisplay from './ContentDisplay';
import ChatWindow from './ChatWindow';
import { pxToRem, spacing } from '../utils';
import styles from './MainLayout.module.css';

const MainLayout: React.FC = () => {
  // 生成一个随机的UUID作为用户标识
  // 在实际应用中，这应该从用户认证系统获取或使用更可靠的方法生成
  const userUuid = React.useMemo(() => {
    return 'user-' + Math.random().toString(36).substring(2, 15);
  }, []);

  // 模拟用户登录状态
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // 模拟用户信息
  const userInfo = {
    walletAddress: '0x1234567890abcdef1234',
    credits: 1000000
  };

  // 切换登录状态的函数（用于测试两种UI状态）
  const toggleLoginStatus = () => {
    setIsLoggedIn(prev => !prev);
  };

  return (
    <div className={styles.mainLayout}>
      <Header 
        isLoggedIn={isLoggedIn} 
        walletAddress={userInfo.walletAddress}
        credits={userInfo.credits}
      />
      <div className={styles.contentContainer}>
        <div className={styles.contentSection}>
          <ContentDisplay />
        </div>
        <div className={styles.chatSection}>
          <ChatWindow uuid={userUuid} />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;