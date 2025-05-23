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
  // const setModelIdAndNameAction = useSetAtom(setModelIdAndName);
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
    // 优先使用详细信息中的数据
    if (localImageDetail?.users?.twitter?.profilePictureUrl) {
      return localImageDetail.users.twitter.profilePictureUrl;
    } else if (localImageDetail?.users?.twitter?.username) {
      return `https://unavatar.io/twitter/${localImageDetail.users.twitter.username}`;
    } else if (image.users.twitter?.profilePictureUrl) {
      return image.users.twitter.profilePictureUrl;
    } else if (image.users.twitter?.username) {
      return `https://unavatar.io/twitter/${image.users.twitter.username}`;
    } else {
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

  // 计算图片高度，保持原始宽高比
  const calculateImageHeight = () => {
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
    const modelId = localImageDetail?.source_info?.id || image.model_id;
    // 获取模型名称
    const modelName = getModelName();

    // 首先关闭当前模态框
    onClose();

    // 如果提供了导航函数且有有效的模型ID，则导航到模型详情
    if (modelId) {
      // setModelIdAndNameAction({ modelId, modelName });
      navigate(`/?model_id=${modelId}&model_name=${encodeURIComponent(modelName)}`);
    }
  };

  const handleTwitterClick = () => {
    if (localImageDetail?.users?.twitter?.username || image.users.twitter?.username) {
      window.open(`https://twitter.com/${localImageDetail?.users?.twitter?.username || image.users.twitter?.username}`, '_blank');
    }
  };

  // 获取图片URL
  const getImageUrl = () => {
    const url = localImageDetail?.url || image.url || undefined;
    if (url != undefined) {
      return `https://ik.imagekit.io/xenoai/niyoko/${url}?tr=w-615,q-100`;
    }
    return undefined;
  };

  // 获取模型名称
  const getModelName = () => {
    return localImageDetail?.source_info?.name
      ? localImageDetail.source_info.name
      : `AI Model #${image.model_id}`;
  };

  // 阻止事件冒泡，避免点击内容区域时关闭模态框
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <button className={styles.closeButton} onClick={onClose}>
        <img src={closeImgSvg} alt="关闭" />
      </button>

      <div className={styles.modalContent} onClick={handleContentClick}>
        <div className={styles.imageContainer} style={{ height: `${calculateImageHeight()}rem` }}>
          {getImageUrl() ? (
            <img src={getImageUrl()} alt={`图片 ${image.id}`} className={styles.image} />
          ) : (
            <div className={styles.placeholderImage}>
              {image.state === -1 ? 'Failed to generate' : 'Generating...'}
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
            <div className={styles.authorInfo}>
              <img
                src={getAvatarUrl()}
                alt="作者头像"
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
            <div className={styles.modelInfoHeader}>Using Model</div>
            <div className={styles.modelInfoContent}>
              <span className={styles.modelName}>{getModelName()}</span>
              <img src={goSvg} alt="Go" className={styles.goIcon} onClick={handleGoClick}/>
              {error && <div className={styles.errorIndicator} title={`加载失败: ${error}`}>!</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageDetailsModal;