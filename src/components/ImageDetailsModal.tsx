import React, { useEffect, useState } from 'react';
import styles from './ImageDetailsModal.module.css';
import { Image, ImageDetail } from '../store/imageStore';
import avatarSvg from '../assets/Avatar.svg';
import twitterSvg from '../assets/twitter.svg';
import goSvg from '../assets/go.svg';
import closeImgSvg from '../assets/close_img.svg';
import {useNavigate} from "react-router-dom";

interface ImageDetailsModalProps {
  image: Image;
  imageDetail: ImageDetail | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
}

const ImageDetailsModal: React.FC<ImageDetailsModalProps> = ({
  image,
  imageDetail,
  isLoading,
  error,
  onClose
}) => {
  // 使用内部状态来确保组件重新渲染
  const [localImageDetail, setLocalImageDetail] = useState<ImageDetail | null>(imageDetail);
  const navigate = useNavigate();
  // 当外部imageDetail变化时更新内部状态
  useEffect(() => {
    if (imageDetail) {
      setLocalImageDetail(imageDetail);
    }
  }, [imageDetail]);

  // 获取Twitter显示名称
  const getDisplayName = () => {
    // 优先使用详细信息中的数据
    if (localImageDetail?.users?.twitter?.name) {
      return localImageDetail.users.twitter.name;
    } else if (localImageDetail?.users?.twitter?.username) {
      return localImageDetail.users.twitter.username;
    } else if (image.users.twitter?.name) {
      return image.users.twitter.name;
    } else if (image.users.twitter?.username) {
      return image.users.twitter.username;
    } else {
      // 使用钱包地址
      const address = localImageDetail?.users?.did || image.creator;
      return address.substring(0, 6) + '...' + address.substring(address.length - 4);
    }
  };

  // 获取头像URL
  const getAvatarUrl = () => {
    // 优先使用详细信息中的数据，排除占位地址
    if (localImageDetail?.users?.twitter?.profilePictureUrl &&
        !localImageDetail.users.twitter.profilePictureUrl.includes('example.com') &&
        !localImageDetail.users.twitter.profilePictureUrl.includes('placeholder')) {
      return localImageDetail.users.twitter.profilePictureUrl;
    } else if (localImageDetail?.users?.twitter?.username) {
      return `https://unavatar.io/twitter/${localImageDetail.users.twitter.username}`;
    } else if (image.users.twitter?.profilePictureUrl &&
               !image.users.twitter.profilePictureUrl.includes('example.com') &&
               !image.users.twitter.profilePictureUrl.includes('placeholder')) {
      return image.users.twitter.profilePictureUrl;
    } else if (image.users.twitter?.username) {
      return `https://unavatar.io/twitter/${image.users.twitter.username}`;
    } else {
      // 使用本地默认头像
      return avatarSvg;
    }
  };

  // 格式化时间戳
  const formatCreationTime = () => {
    if (localImageDetail?.created_at) {
      const date = new Date(localImageDetail.created_at);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\//g, '.') + ' ' +
      date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    }

    // 没有详细信息时，使用当前时间作为回退
    const date = new Date();
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '.') + ' ' +
    date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  // 新增：判断是否为视频类型
  const isVideo = () => {
    return localImageDetail?.type === 'video' || image.type === 'video';
  };

  // 获取媒体URL（图片或视频）
  const getMediaUrl = () => {
    const url = localImageDetail?.url || image.url || undefined;
    if (url != undefined) {
      // 对于视频，不需要ImageKit的图片处理参数
      if (isVideo()) {
        return url;
      } else {
        return `https://ik.imagekit.io/xenoai/niyoko/${url}?tr=w-615,q-100`;
      }
    }
    return undefined;
  };

  // 计算媒体高度，保持原始宽高比
  const calculateMediaHeight = () => {
    // 优先使用详细信息中的宽高
    if (localImageDetail?.width && localImageDetail?.height) {
      const aspectRatio = localImageDetail.height / localImageDetail.width;
      return 25.625 * aspectRatio;
    }

    if (image.width && image.height) {
      const aspectRatio = image.height / image.width;
      return 25.625 * aspectRatio;
    }

    return 25.625; // 默认高度
  };

  const handleGoClick = () => {
    // 获取模型ID，优先使用imageDetail中的数据
    // 首先关闭当前模态框
    onClose();
    if (image.model_id) {
      const modelId = image.model_id;
      const modelName = localImageDetail?.source_info?.name || "";
      navigate(`/?model_id=${modelId}&model_name=${encodeURIComponent(modelName)}`);
    } else if (image.workflow_id) {
      const workflowId = image.workflow_id;
      const workflowName = localImageDetail?.source_info?.name || "";
      navigate(`/?workflow_id=${workflowId}&workflow_name=${encodeURIComponent(workflowName)}`);
    }
  };

  const handleTwitterClick = () => {
    if (localImageDetail?.users?.twitter?.username || image.users.twitter?.username) {
      window.open(`https://twitter.com/${localImageDetail?.users?.twitter?.username || image.users.twitter?.username}`, '_blank');
    }
  };

  // 获取模型名称
  const getModelName = () => {
    let defaultName = ""
    if (image.model_id) {
      defaultName = `AI Model #${image.model_id}`
    } else if (image.workflow_id) {
      defaultName = `AI Workflow #${image.workflow_id}`
    }
    return localImageDetail?.source_info?.name
      ? localImageDetail.source_info.name
      : defaultName;
  };

  // 阻止事件冒泡，避免点击内容区域时关闭模态框
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <button className={styles.closeButton} onClick={onClose}>
        <img src={closeImgSvg} alt="close" />
      </button>

      <div className={styles.modalContent} onClick={handleContentClick}>
        <div className={styles.imageContainer} style={{ height: `${calculateMediaHeight()}rem` }}>
          {getMediaUrl() ? (
            isVideo() ? (
              // 视频渲染 - 带完整控件
              <video
                src={getMediaUrl()}
                className={styles.image}
                controls={true}
                playsInline
                preload="metadata"
                style={{ objectFit: 'contain' }}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              // 图片渲染
              <img src={getMediaUrl()} alt={`image ${image.id}`} className={styles.image} />
            )
          ) : (
            <div className={styles.placeholderImage}>
              {image.state === -1 ?
                (isVideo() ? 'Failed to generate video' : 'Failed to generate') :
                (isVideo() ? 'Generating video...' : 'Generating...')
              }
            </div>
          )}
          {isLoading && (
            <div className={styles.loadingOverlay}>
              <div className={styles.loadingSpinner}></div>
            </div>
          )}
        </div>

        <div className={styles.imageInfo}>
          <div className={styles.infoHeader}>
            <div className={styles.authorInfo} style={{ marginTop: '6px' }}>
              <img
                src={getAvatarUrl()}
                alt="authorAvatar"
                className={styles.authorAvatar}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = avatarSvg;
                }}
              />
              <span className={styles.authorName}>{getDisplayName()}</span>
              {(localImageDetail?.users?.twitter?.username || image.users.twitter?.username) && (
                <img src={twitterSvg} alt="Twitter" className={styles.twitterIcon} onClick={handleTwitterClick}/>
              )}
            </div>

            <div className={styles.creationTime}>
              {formatCreationTime()}
            </div>
          </div>

          <div className={styles.modelInfo}>
            <div className={styles.modelInfoHeader}>Using AICC</div>
            <div className={styles.modelInfoContent}>
              <span className={styles.modelName}>{getModelName()}</span>
              <img src={goSvg} alt="Go" className={styles.goIcon} onClick={handleGoClick}/>
              {error && <div className={styles.errorIndicator} title={`loading failed: ${error}`}>!</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageDetailsModal;