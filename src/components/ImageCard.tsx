import React from 'react';
import styles from './ImageCard.module.css';
import { Image } from '../store/imageStore';
import avatarSvg from '../assets/Avatar.svg';
import { useSetAtom } from 'jotai';
import { openImageDetails } from '../store/modalStore';

interface ImageCardProps {
  image: Image;
}

const ImageCard: React.FC<ImageCardProps> = ({ image }) => {
  const handleOpenImageDetails = useSetAtom(openImageDetails);
  
  // 检查是否处理中
  const isPending = image.state === 0;
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

  // 只有当图片有URL时才能点击查看详情
  const handleImageClick = () => {
    if (image.url) {
      handleOpenImageDetails(image);
    }
  };

  return (
    <div className={styles.imageCard} onClick={handleImageClick}>
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
              alt="Twitter Avatar" 
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