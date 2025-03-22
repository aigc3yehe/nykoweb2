import React from 'react';
import styles from './ImageCard.module.css';
import { Image } from '../store/imageStore';
import avatarSvg from '../assets/Avatar.svg';

interface ImageCardProps {
  image: Image;
}

const ImageCard: React.FC<ImageCardProps> = ({ image }) => {
  // 获取图片状态
  const getImageState = (state: number) => {
    switch (state) {
      case -1:
        return '生成失败';
      case 0:
        return '处理中';
      case 1:
        return '已完成';
      default:
        return '未知状态';
    }
  };
  
  // 检查是否处理中
  const isPending = image.state === 0;
  // 检查是否已完成
  const isSuccess = image.state === 1;
  // 检查是否失败
  const isFailed = image.state === -1;

  // 获取Twitter显示名称
  const getDisplayName = () => {
    if (image.users.twitter?.name) {
      return image.users.twitter.name;
    } else if (image.users.twitter?.username) {
      return image.users.twitter.username;
    } else {
      // 如果没有Twitter信息，显示缩略的钱包地址
      return image.creator.substring(0, 6) + '...' + image.creator.substring(image.creator.length - 4);
    }
  };

  // 获取头像URL
  const getAvatarUrl = () => {
    if (image.users.twitter?.profilePictureUrl) {
      return image.users.twitter.profilePictureUrl;
    } else if (image.users.twitter?.username) {
      // 备用方案：如果有username但没有profilePictureUrl，使用第三方服务
      return `https://unavatar.io/twitter/${image.users.twitter.username}`;
    } else {
      return avatarSvg;
    }
  };

  return (
    <div className={styles.imageCard}>
      <div className={styles.imageContainer}>
        {image.url ? (
          <img src={image.url} alt={`图片 ${image.id}`} className={styles.image} />
        ) : (
          <div className={styles.placeholderImage}>
            {isFailed ? 'Failed' : 'Generating...'}
          </div>
        )}
        
        <div className={styles.tagsContainer}>
          {isPending && (
            <div className={styles.pendingTag}>Generating</div>
          )}
          
          {isFailed && (
            <div className={styles.failedTag}>Failed</div>
          )}
        </div>
        
        {/* 悬停时显示的半透明黑色遮罩和作者信息 */}
        <div className={styles.overlay}>
          <div className={styles.creatorInfo}>
            <img 
              src={getAvatarUrl()} 
              alt="Creator Avatar" 
              className={styles.creatorAvatar}
              onError={(e) => {
                (e.target as HTMLImageElement).src = avatarSvg;
              }}
            />
            <span className={styles.creatorName}>
              {getDisplayName()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCard; 