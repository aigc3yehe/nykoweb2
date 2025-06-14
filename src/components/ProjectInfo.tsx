import React from 'react';
import { ProjectInfo as ProjectInfoData } from '../store/topicStore';
import styles from './ProjectInfo.module.css';

// 导入图标
import kaitoIcon from '../assets/kaito.svg';
import cookieIcon from '../assets/cookie.svg';
import dexscreenerIcon from '../assets/dexscreener2.svg';
import linksIcon from '../assets/links2.svg';

interface ProjectInfoProps {
  projectInfo: ProjectInfoData | null;
  isLoading: boolean;
}

const ProjectInfo: React.FC<ProjectInfoProps> = ({ projectInfo, isLoading }) => {
  // 简化日志，只在关键状态变化时输出
  if (isLoading) {
    return (
      <div className={styles.projectInfoContainer}>
        <div className={styles.loadingPlaceholder}>Loading project info...</div>
      </div>
    );
  }

  if (!projectInfo) {
    return null; // 不显示任何内容，保持页面简洁
  }

  console.log('[ProjectInfo] ✅ Rendering with data:', {
    hasTwitter: !!projectInfo.twitter,
    linkCount: Object.keys(projectInfo.links || {}).length
  });

  // 检查links中是否包含twitter链接
  const twitterLink = projectInfo.links && Object.entries(projectInfo.links).find(([key]) => 
    key.toLowerCase().includes('twitter')
  );
  const hasTwitterLink = !!twitterLink;

  // 图标映射函数 - 按优先级排序
  const getIconForLink = (key: string) => {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('kaito')) return kaitoIcon;
    if (lowerKey.includes('cookie')) return cookieIcon;
    if (lowerKey.includes('dexscreener')) return dexscreenerIcon;
    return linksIcon; // 默认图标
  };

  // 背景色映射函数
  const getBackgroundForLink = (key: string) => {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('kaito')) return '#32FFDC';
    if (lowerKey.includes('cookie')) return '#B9F8CF';
    if (lowerKey.includes('dexscreener')) return '#FFFFFF';
    return '#FFFFFF'; // 默认白色背景
  };

  // 获取链接优先级
  const getLinkPriority = (key: string) => {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('kaito')) return 1;
    if (lowerKey.includes('cookie')) return 2;
    if (lowerKey.includes('dexscreener')) return 3;
    if (lowerKey.includes('twitter')) return 999; // Twitter链接不在这里显示
    return 4; // 其他链接使用links2图标
  };

  const handleTwitterClick = () => {
    if (twitterLink) {
      window.open(twitterLink[1], '_blank');
    }
  };

  const handleLinkClick = (url: string) => {
    window.open(url, '_blank');
  };

  // 过滤和排序links，排除twitter链接
  const filteredAndSortedLinks = projectInfo.links 
    ? Object.entries(projectInfo.links)
        .filter(([key]) => !key.toLowerCase().includes('twitter')) // 排除twitter链接
        .sort(([keyA], [keyB]) => getLinkPriority(keyA) - getLinkPriority(keyB)) // 按优先级排序
    : [];

  return (
    <div className={styles.projectInfoContainer}>
      {/* 用户头像 */}
      <div 
        className={styles.userAvatar}
        style={{
          backgroundImage: projectInfo.twitter.profilePictureUrl 
            ? `url(${projectInfo.twitter.profilePictureUrl})` 
            : undefined
        }}
      />

      {/* Twitter用户名按钮 - 只在有twitter链接时显示，并放在头像后面 */}
      {hasTwitterLink && (
        <div className={styles.usernameButton} onClick={handleTwitterClick}>
          <div className={styles.nameContainer}>
            <span className={styles.twitterUsername}>
              @{projectInfo.twitter.username || projectInfo.twitter.name || 'Unknown'}
            </span>
            <div className={styles.twitterIcon}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path 
                  d="M9.52 6.77L15.48 0H14.06L8.89 5.88L4.76 0H0L6.24 8.89L0 16H1.42L6.86 9.78L11.24 16H16L9.52 6.77ZM7.58 8.97L6.95 8.09L1.92 1.03H4.08L8.15 6.72L8.78 7.6L14.06 15.01H11.9L7.58 8.97Z" 
                  fill="#000000"
                />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* 社交媒体链接 - 使用排序后的链接，排除twitter */}
      {filteredAndSortedLinks.map(([key, url]) => (
        <div 
          key={key}
          className={styles.linkButton}
          style={{
            backgroundColor: getBackgroundForLink(key)
          }}
          title={key}
          onClick={() => handleLinkClick(url)}
        >
          <img 
            src={getIconForLink(key)} 
            alt={key}
            className={styles.linkIcon}
          />
        </div>
      ))}
    </div>
  );
};

export default ProjectInfo; 