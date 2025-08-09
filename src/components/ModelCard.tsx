import React, {useState} from 'react';
import styles from './ModelCard.module.css';
import {fetchToggleView, Model} from '../store/modelStore';
import avatarSvg from '../assets/Avatar.svg';
import costCreditSvg from '../assets/cost_credit.svg';
import showSvg from '../assets/show.svg';
import hideSvg from '../assets/hidden.svg';
import {useAtom, useSetAtom} from 'jotai';
import {showDialogAtom} from '../store/dialogStore';
import {accountAtom} from '../store/accountStore';
import {showToastAtom} from "../store/imagesStore";
import {formatNumber} from "../utils/format.ts";
import { isVideoUrl } from '../utils/tools';

interface ModelCardProps {
  model: Model;
}

const ModelCard: React.FC<ModelCardProps> = ({ model }) => {
  const [accountState] = useAtom(accountAtom);
  const [, toggleView] = useAtom(fetchToggleView);
  const showDialog = useSetAtom(showDialogAtom);
  const showToast = useSetAtom(showToastAtom);
  const [isProcessing, setIsProcessing] = useState(false);
  const [localModel, setLocalModel] = useState(model);

  // 从model中获取可见性状态
  const isPublic = localModel.public === 1;
  const isAdminHidden = localModel.public === -1;

  // 检查当前用户是否有权限切换模型可见性
  // 只有管理员或模型创建者可以切换
  const canToggleVisibility =
    accountState.role === 'admin' ||
    (accountState.did && accountState.did === localModel.creator);

  // 检查是否在训练中
  const isTraining = localModel.model_tran[0]?.train_state === 0 || localModel.model_tran[0]?.train_state === 1;
  // isTokenization
  const isTokenization = localModel.model_tran[0]?.train_state === 2 && localModel.model_tokenization && localModel.model_tokenization?.metadata?.symbol;

  // 获取Twitter显示名称
  const getDisplayName = () => {
    if (localModel.users.twitter?.name) {
      return localModel.users.twitter.name;
    } else if (localModel.users.twitter?.username) {
      return localModel.users.twitter.username;
    } else {
      // 如果没有Twitter信息，显示缩略的钱包地址
      return localModel.creator.substring(0, 6) + '...' + localModel.creator.substring(localModel.creator.length - 4);
    }
  };

  // 获取头像URL
  const getAvatarUrl = () => {
    // 检查是否有有效的头像URL，排除占位地址
    if (localModel.users.twitter?.profilePictureUrl &&
        !localModel.users.twitter.profilePictureUrl.includes('example.com') &&
        !localModel.users.twitter.profilePictureUrl.includes('placeholder')) {
      return localModel.users.twitter.profilePictureUrl;
    } else if (localModel.users.twitter?.username) {
      // 备用方案：如果有username但没有profilePictureUrl，使用第三方服务
      return `https://unavatar.io/twitter/${localModel.users.twitter.username}`;
    } else {
      // 使用本地默认头像
      return avatarSvg;
    }
  };

  // 获取cover
  const getCoverUrl = () => {
    const cover = localModel.cover
    return `https://ik.imagekit.io/xenoai/niyoko/${cover}?tr=w-335,h-344,q-95`
  }

  // 获取可见性图标
  const getVisibilityIcon = () => {
    return isPublic ? showSvg : hideSvg;
  };

  // 处理可见性切换事件
  const handleToggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发模型点击

    if (isProcessing) return; // 如果正在处理中，不响应点击

    // 如果模型被管理员隐藏，且当前用户不是管理员
    if (isAdminHidden && accountState.role !== 'admin') {
      showDialog({
        open: true,
        message: 'This model has been hidden by administrators. Please contact our community team to restore visibility.',
        confirmText: 'OK',
        cancelText: 'Cancel',
        onConfirm: () => {},
        onCancel: () => {},
        confirmButtonColor: '#6366F1',
        cancelButtonColor: '#6366F1'
      });
      return;
    }

    if (isPublic) {
      showDialog({
        open: true,
        message: 'Are you sure you want to hide this model?',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        onConfirm: () => {
          setIsProcessing(true); // 设置处理中状态

          // 调用接口，将模型设为私有
          toggleView('model', localModel.id, false)
            .then(() => {
              // 根据角色设置新的可见性状态
              const newPublicValue = accountState.role === 'admin' ? -1 : 0;

              // 更新本地模型数据
              setLocalModel({
                ...localModel,
                public: newPublicValue
              });

              // 显示成功提示
              showToast({
                message: 'Model has been hidden successfully',
                severity: 'success'
              });
            })
            .catch((error) => {
              console.error('Failed to change visibility:', error);
              showToast({
                message: 'Failed to hide the model. Please try again.',
                severity: 'error'
              });
            })
            .finally(() => {
              setIsProcessing(false); // 结束处理状态
            });
        },
        onCancel: () => {},
        confirmButtonColor: '#FF3C3D',
        cancelButtonColor: '#6366F1'
      });
    } else {
      showDialog({
        open: true,
        message: 'Are you sure you want to make this model visible?',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        onConfirm: () => {
          setIsProcessing(true); // 设置处理中状态

          // 调用接口，将模型设为公开
          toggleView('model', localModel.id, true)
            .then(() => {
              // 设置新的可见性状态
              setLocalModel({
                ...localModel,
                public: 1
              });

              // 显示成功提示
              showToast({
                message: 'Model has been made visible successfully',
                severity: 'success'
              });
            })
            .catch((error) => {
              console.error('Failed to change visibility:', error);
              showToast({
                message: 'Failed to make the model visible. Please try again.',
                severity: 'error'
              });
            })
            .finally(() => {
              setIsProcessing(false); // 结束处理状态
            });
        },
        onCancel: () => {},
        confirmButtonColor: '#6366F1',
        cancelButtonColor: '#6366F1'
      });
    }
  };

  return (
    <div className={styles.modelCard} style={{
      background: 'linear-gradient(121.69deg, rgba(31, 41, 55, 0.2) 22.31%, rgba(63, 79, 103, 0.2) 86.22%, rgba(70, 125, 206, 0.2) 106.88%)',
      backgroundColor: 'rgba(31, 41, 55, 0.2)',
      borderRadius: '0.5rem',
      backdropFilter: 'blur(1.875rem)'
    }}>
      <div className={styles.modelCover}>
        {isVideoUrl(localModel.cover) ? (
          <video 
            src={getCoverUrl()} 
            className={styles.modelCover}
            controls={false}
            muted
            playsInline
            preload="metadata"
            style={{ 
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '0.5rem 0.5rem 0.5rem 1.875rem'
            }}
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <img 
            src={getCoverUrl()} 
            alt={localModel.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '0.5rem 0.5rem 0.5rem 1.875rem',
              transition: 'transform 0.3s ease',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none',
              pointerEvents: 'none'
            }}
          />
        )}

        <div className={styles.tagsContainer}>
          {isTraining && (
            <div className={styles.trainingTag}>
              Training
            </div>
          )}

          {isTokenization && (
            <>
              <div className={styles.completedTag}>${localModel.model_tokenization?.metadata?.symbol}</div>
            </>
          )}
        </div>
      </div>

      <div className={styles.modelInfo}>
        <h3 className={styles.modelName}>{localModel.name}</h3>

        <div className={styles.modelMeta}>
          <div className={styles.twitterInfo} style={{ marginTop: '6px' }}>
            <img
              src={getAvatarUrl()}
              alt="Avatar"
              className={styles.twitterAvatar}
              onError={(e) => {
                (e.target as HTMLImageElement).src = avatarSvg;
              }}
            />
            <span className={styles.twitterName}>
              {getDisplayName()}
            </span>
          </div>

          <div className={styles.creditInfo}>
            <img src={costCreditSvg} alt="Credit" className={styles.creditIcon} />
            <span className={styles.creditCount}>{formatNumber(localModel.usage * 5)}</span>
          </div>
        </div>
      </div>

      {/* 确保overlay是modelCard的直接子元素 */}
      {canToggleVisibility && (
        <div className={`${styles.overlay} ${isProcessing ? styles.showOverlay : ''}`}>
          {isProcessing ? (
            <div className={styles.processingIndicator}>
              <div className={styles.typingIndicator}>
                <span></span><span></span><span></span>
              </div>
            </div>
          ) : (
            <div className={styles.visibilityControl} onClick={handleToggleVisibility}>
              <img
                src={getVisibilityIcon()}
                alt={isPublic ? "Visible" : "Hidden"}
                className={styles.visibilityIcon}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ModelCard;