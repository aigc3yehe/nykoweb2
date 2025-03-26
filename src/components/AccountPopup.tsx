import React, { useState, useRef } from 'react';
import { useLogout } from '@privy-io/react-auth';
import styles from './AccountPopup.module.css';
import GoldIcon from '../assets/gold.svg';
import KeyIcon from '../assets/key.svg';
import LogoutIcon from '../assets/logout.svg';
import CopyIcon from '../assets/copy_address.svg';
import CloseIcon from '../assets/close_account.svg';
import WalletAssets from './WalletAssets';

interface AccountPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  onLogout: () => void;
  userData: {
    name?: string;
    username ?: string;
    profilePictureUrl?: string;
    walletAddress?: string;
  };
  anchorPosition?: DOMRect | null;
}

const AccountPopup: React.FC<AccountPopupProps> = ({
  isOpen,
  onClose,
  onExport,
  onLogout,
  userData,
  anchorPosition
}) => {
  const [activeTab, setActiveTab] = useState('Assets');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  
  // 使用 useLogout hook 实现带回调的登出功能
  const { logout } = useLogout({
    onSuccess: () => {
      console.log('用户成功退出登录');
      // 调用外部传入的登出回调
      onLogout();
      // 关闭弹窗
      onClose();
      // 可能的其他后续操作，如重定向到首页等
      setIsLoggingOut(false);
    }
  });
  
  // 处理登出按钮点击
  const handleLogout = () => {
    setIsLoggingOut(true);
    logout();
  };
  
  // 计算弹窗位置
  const calculatePosition = () => {
    if (!anchorPosition) return {};
    
    return {
      position: 'absolute' as const,
      top: `${anchorPosition.bottom + 8}px`,
      right: `${window.innerWidth - anchorPosition.right}px`,
    };
  };
  
  // 格式化钱包地址，显示前4位和后4位
  const formatAddress = (address: string | undefined) => {
    if (!address || address.length < 10) return address || '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  // 获取高清头像（去掉URL中的_normal）
  const getHDProfilePicture = (url: string | undefined) => {
    if (!url) return '';
    return url.replace('_normal.jpg', '.jpg').replace('_normal.png', '.png');
  };
  
  // 格式化用户名，添加@前缀
  const formatUsername = (username: string | undefined) => {
    if (!username) return `@${userData.name}`;
    return `@${username}`;
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div 
        ref={popupRef} 
        className={styles.accountPopup} 
        style={calculatePosition()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 第一部分：用户信息 */}
        <div className={styles.userInfoContainer}>
          <div className={styles.userInfoContent}>
            <img 
              src={getHDProfilePicture(userData.profilePictureUrl)} 
              alt="用户头像" 
              className={styles.popupAvatar} 
            />
            <div className={styles.userDetails}>
              <div className={styles.userNameRow}>
                <div className={styles.userNameContainer}>
                  <span className={styles.userName}>{formatUsername(userData.username)}</span>
                  <div className={styles.premiumBadge}>
                    <img src={GoldIcon} alt="Premium" width="14" height="14" />
                    <span className={styles.premiumText}>Premium</span>
                  </div>
                </div>
                <button 
                  className={styles.closeButton} 
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                >
                  <img src={CloseIcon} alt="关闭" width="24" height="24" />
                </button>
              </div>
              <div className={styles.walletAddressRow}>
                <span className={styles.walletAddress}>{formatAddress(userData.walletAddress)}</span>
                <button className={styles.copyButton} onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(userData.walletAddress || '');
                }}>
                  <img src={CopyIcon} alt="复制" width="20" height="20" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* 第二部分：标签页 */}
        <div className={styles.tabsContainer}>
          <button 
            className={`${styles.tabButton} ${activeTab === 'Assets' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('Assets')}
          >
            Assets
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'Activity' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('Activity')}
          >
            Activity
          </button>
        </div>
        
        {/* 第三部分：内容区域 */}
        <div className={styles.contentContainer}>
          {activeTab === 'Assets' ? (
            <div className={styles.assetsContent}>
              <WalletAssets walletAddress={userData.walletAddress} />
            </div>
          ) : (
            <div className={styles.activityContent}>
              {/* 活动内容占位符 */}
            </div>
          )}
        </div>
        
        {/* 第四部分：导出按钮 */}
        <div className={styles.exportContainer} onClick={() => {
          onClose();
          onExport();
        }}>
          <div className={styles.actionRow}>
            <img src={KeyIcon} alt="导出" width="16" height="16" />
            <span className={styles.exportText}>Export Private Key</span>
          </div>
        </div>
        
        {/* 第五部分：登出按钮 */}
        <div 
          className={`${styles.logoutContainer} ${isLoggingOut ? styles.disabled : ''}`} 
          onClick={isLoggingOut ? undefined : handleLogout}
        >
          <div className={styles.actionRow}>
            <img src={LogoutIcon} alt="登出" width="16" height="16" />
            <span className={styles.logoutText}>
              {isLoggingOut ? 'Logging Out...' : 'Log Out'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPopup; 