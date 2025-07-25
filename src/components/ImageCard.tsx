import React, { useState } from 'react';
import styles from './ImageCard.module.css';
import { Image } from '../store/imageStore';
import avatarSvg from '../assets/Avatar.svg';
import showSvg from '../assets/show.svg';
import hideSvg from '../assets/hidden.svg';
import coverSvg from '../assets/cover.svg';
import carouselSvg from '../assets/carousel.svg';
import heart01Svg from '../assets/heart_01.svg'; // 未点赞图标
import heart02Svg from '../assets/heart_02.svg'; // 点赞图标
import { useSetAtom, useAtom } from 'jotai';
import { openImageDetails } from '../store/modalStore';
import { fetchToggleView, fetchEditCover, fetchEditCarousel } from '../store/modelStore';
import { showDialogAtom } from '../store/dialogStore';
import { accountAtom } from '../store/accountStore';
import { showToastAtom } from "../store/imagesStore";
import { fetchToggleWorkflowView, fetchWorkflowEditCover, fetchWorkflowEditCarousel } from "../store/workflowStore.ts";
import { SOURCE_TYPE } from "../types/api.type.ts";
import { likeImageAtom } from '../store/imageStore';

interface ImageCardProps {
  image: Image;
  onVisibilityChange?: (updatedImage: Image) => void;
  showEditCover?: boolean;
  showCarousel?: boolean;
}

const ImageCard: React.FC<ImageCardProps> = ({ image, onVisibilityChange, showEditCover, showCarousel }) => {
  const handleOpenImageDetails = useSetAtom(openImageDetails);
  const [, toggleView] = useAtom(fetchToggleView);
  const [, editCover] = useAtom(fetchEditCover);
  const [, editCarousel] = useAtom(fetchEditCarousel);
  const [, toggleWorkflowView] = useAtom(fetchToggleWorkflowView);
  const [, editWorkflowCover] = useAtom(fetchWorkflowEditCover);
  const [, editWorkflowCarousel] = useAtom(fetchWorkflowEditCarousel);
  const [, likeImage] = useAtom(likeImageAtom);
  const showDialog = useSetAtom(showDialogAtom);
  const [accountState] = useAtom(accountAtom);
  const showToast = useSetAtom(showToastAtom);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [localImage, setLocalImage] = useState(image);

  // 检查是否处理中
  const isPending = localImage.state === 0;
  // 检查是否失败
  const isFailed = localImage.state === -1;
  // 检查是否因内容政策失败
  const isContentPolicyFailed = localImage.state === -2;
  // 是否可见
  const isPublic = localImage.public === 1;
  // 是否被管理员隐藏
  const isAdminHidden = localImage.public === -1;

  // 检查当前用户是否有权限切换图片可见性
  // 只有管理员或图片创建者或模型所有者可以切换
  const canToggleVisibility =
    accountState.role === 'admin' ||
    (accountState.did && accountState.did === localImage.creator)
    //(accountState.did && modelOwnerDid && accountState.did === modelOwnerDid);

  // 处理点赞
  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡

    if (isLiking || !accountState.did) return; // 如果正在处理中或用户未登录，不响应点击

    setIsLiking(true);

    try {
      const currentIsLiked = localImage.is_liked || false;
      const newIsLiked = !currentIsLiked;

      // 调用点赞API
      await likeImage(localImage.id, newIsLiked);

      // 更新本地状态
      const updatedImage = {
        ...localImage,
        is_liked: newIsLiked
      };

      setLocalImage(updatedImage);

      // 如果提供了回调，通知父组件图片已更新
      if (onVisibilityChange) {
        onVisibilityChange(updatedImage);
      }

    } catch (error) {
      console.error('Failed to toggle like:', error);
      // 静默失败，不显示toast通知
    } finally {
      setIsLiking(false);
    }
  };

  // 获取点赞图标
  const getLikeIcon = () => {
    return localImage.is_liked ? heart02Svg : heart01Svg;
  };

  // 获取Twitter显示名称
  const getDisplayName = () => {
    if (localImage.users.twitter?.name) {
      return localImage.users.twitter.name;
    } else if (localImage.users.twitter?.username) {
      return localImage.users.twitter.username;
    } else {
      // 如果没有Twitter信息，显示匿名
      return "Anonymous";
    }
  };

  // 获取头像URL
  const getAvatarUrl = () => {
    if (localImage.users.twitter?.profilePictureUrl) {
      return localImage.users.twitter.profilePictureUrl;
    } else if (localImage.users.twitter?.username) {
      // 备用方案：如果有username但没有profilePictureUrl，使用第三方服务
      return `https://unavatar.io/twitter/${localImage.users.twitter.username}`;
    } else {
      return avatarSvg;
    }
  };

  const getImagePublicUrl = () => {
    return isPublic ? showSvg : hideSvg;
  }

  const getScaledImageUrl = () => {
    const url = localImage.url
    return `https://ik.imagekit.io/xenoai/niyoko/${url}?tr=w-335,q-90`
  }

  // 新增：判断是否为视频类型
  const isVideo = () => {
    return localImage.type === 'video';
  }

  // 获取placeholder显示文本
  const getPlaceholderText = () => {
    if (isContentPolicyFailed) {
      return 'Failed due to content policy';
    } else if (isFailed) {
      return 'Failed';
    } else {
      return isVideo() ? 'Generating Video...' : 'Generating...';
    }
  };

  // 只有当图片/视频有URL时才能点击查看详情
  const handleImageClick = () => {
    if (localImage.url) {
      handleOpenImageDetails(localImage);
    }
  };

  const handleCoverClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发图片详情

    const url = localImage.url;
    if (isProcessing || !url) return; // 如果正在处理中，不响应点击

    showDialog({
      open: true,
      message: 'Are you sure you want to set this image as cover?',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      onConfirm: () => {
        setIsProcessing(true); // 设置处理中状态

        if (localImage.model_id) {
          // 调用接口，将图片设为私有
          editCover(SOURCE_TYPE.MODEL, localImage.model_id, url)
              .then(() => {
                // 根据角色设置新的可见性状态
                const newPublicValue = accountState.role === 'admin' ? -1 : 0;

                // 更新本地图片数据
                const updatedImage = {
                  ...localImage,
                  public: newPublicValue
                };

                setLocalImage(updatedImage);

                // 如果提供了回调，通知父组件图片已更新
                if (onVisibilityChange) {
                  onVisibilityChange(updatedImage);
                }

                // 显示成功提示
                showToast({
                  message: 'The image has been successfully set as the cover',
                  severity: 'success'
                });
              })
              .catch((error) => {
                console.error('Failed to change visibility:', error);
                showToast({
                  message: 'Failed to set cover',
                  severity: 'error'
                });
              })
              .finally(() => {
                setIsProcessing(false); // 结束处理状态
              });
        } else if (localImage.workflow_id) {
          // 调用接口，将图片设为私有
          editWorkflowCover(localImage.workflow_id, url)
              .then(() => {
                // 根据角色设置新的可见性状态
                const newPublicValue = accountState.role === 'admin' ? -1 : 0;

                // 更新本地图片数据
                const updatedImage = {
                  ...localImage,
                  public: newPublicValue
                };

                setLocalImage(updatedImage);

                // 如果提供了回调，通知父组件图片已更新
                if (onVisibilityChange) {
                  onVisibilityChange(updatedImage);
                }

                // 显示成功提示
                showToast({
                  message: 'The image has been successfully set as the cover',
                  severity: 'success'
                });
              })
              .catch((error) => {
                console.error('Failed to change visibility:', error);
                showToast({
                  message: 'Failed to set cover',
                  severity: 'error'
                });
              })
              .finally(() => {
                setIsProcessing(false); // 结束处理状态
              });
        }
      },
      onCancel: () => {},
      confirmButtonColor: '#FF3C3D',
      cancelButtonColor: '#6366F1'
    });

  }

  const handleCarouselClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发图片详情

    const url = localImage.url;
    if (isProcessing || !url || (!localImage.model_id && !localImage.workflow_id)) return; // 如果正在处理中，不响应点击

    showDialog({
      open: true,
      message: 'Are you sure you want to toggle this image in carousel?',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      onConfirm: () => {
        setIsProcessing(true); // 设置处理中状态

        // 根据图片类型调用对应的carousel接口
        const carouselPromise = localImage.model_id 
          ? editCarousel(localImage.model_id, url)
          : editWorkflowCarousel(localImage.workflow_id!, url);

        carouselPromise
            .then(() => {
              // 显示成功提示
              showToast({
                message: 'Carousel has been updated successfully',
                severity: 'success'
              });
            })
            .catch((error) => {
              console.error('Failed to update carousel:', error);
              showToast({
                message: 'Failed to update carousel',
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

  const handleToggleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发图片详情

    if (isProcessing) return; // 如果正在处理中，不响应点击

    // 如果图片被管理员隐藏，且当前用户不是管理员
    if (isAdminHidden && accountState.role !== 'admin') {
      showDialog({
        open: true,
        message: 'This image has been hidden by administrators. Please contact our community team to restore visibility.',
        confirmText: 'OK',
        cancelText: 'Cancel',
        onConfirm: () => {},
        onCancel: () => {},
        confirmButtonColor: '#6366F1',
        cancelButtonColor: '#6366F1'
      });
      return;
    }

    // 根据当前状态确定切换后的状态
    if (isPublic) {
      showDialog({
        open: true,
        message: 'Are you sure you want to hide this image?',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        onConfirm: () => {
          setIsProcessing(true); // 设置处理中状态
          if (localImage.source === SOURCE_TYPE.MODEL) {
            // 调用接口，将图片设为私有
            toggleView('image', localImage.id, false)
                .then(() => {
                  // 根据角色设置新的可见性状态
                  const newPublicValue = accountState.role === 'admin' ? -1 : 0;

                  // 更新本地图片数据
                  const updatedImage = {
                    ...localImage,
                    public: newPublicValue
                  };

                  setLocalImage(updatedImage);

                  // 如果提供了回调，通知父组件图片已更新
                  if (onVisibilityChange) {
                    onVisibilityChange(updatedImage);
                  }

                  // 显示成功提示
                  showToast({
                    message: 'Image has been hidden successfully',
                    severity: 'success'
                  });
                })
                .catch((error) => {
                  console.error('Failed to change visibility:', error);
                  showToast({
                    message: 'Failed to hide the image. Please try again.',
                    severity: 'error'
                  });
                })
                .finally(() => {
                  setIsProcessing(false); // 结束处理状态
                });
          } else if (localImage.source === SOURCE_TYPE.WORKFLOW) {
              // 调用接口，将图片设为私有
            toggleWorkflowView('image', localImage.id, false)
                .then(() => {
                  // 根据角色设置新的可见性状态
                  const newPublicValue = accountState.role === 'admin' ? -1 : 0;

                  // 更新本地图片数据
                  const updatedImage = {
                    ...localImage,
                    public: newPublicValue
                  };

                  setLocalImage(updatedImage);

                  // 如果提供了回调，通知父组件图片已更新
                  if (onVisibilityChange) {
                    onVisibilityChange(updatedImage);
                  }

                  // 显示成功提示
                  showToast({
                    message: 'Image has been hidden successfully',
                    severity: 'success'
                  });
                })
                .catch((error) => {
                  console.error('Failed to change visibility:', error);
                  showToast({
                    message: 'Failed to hide the image. Please try again.',
                    severity: 'error'
                  });
                })
                .finally(() => {
                  setIsProcessing(false); // 结束处理状态
                });
          }

        },
        onCancel: () => {},
        confirmButtonColor: '#FF3C3D',
        cancelButtonColor: '#6366F1'
      });
    } else {
      showDialog({
        open: true,
        message: 'Are you sure you want to make this image visible?',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        onConfirm: () => {
          setIsProcessing(true); // 设置处理中状态

          // 调用接口，将图片设为公开
          toggleView('image', localImage.id, true)
            .then(() => {
              // 设置新的可见性状态
              const updatedImage = {
                ...localImage,
                public: 1
              };

              setLocalImage(updatedImage);

              // 如果提供了回调，通知父组件图片已更新
              if (onVisibilityChange) {
                onVisibilityChange(updatedImage);
              }

              // 显示成功提示
              showToast({
                message: 'Image has been made visible successfully',
                severity: 'success'
              });
            })
            .catch((error) => {
              console.error('Failed to change visibility:', error);
              showToast({
                message: 'Failed to make the image visible. Please try again.',
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
  }

  return (
    <div className={styles.imageCard} onClick={handleImageClick}>
      <div className={styles.imageContainer}>
        {localImage.url ? (
          isVideo() ? (
            // 视频渲染 - 移除悬停播放功能，只显示第一帧
            <video 
              src={localImage.url} 
              className={styles.image}
              controls={false}
              muted
              playsInline
              preload="metadata"
              style={{ objectFit: 'cover' }}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            // 图片渲染
            <img src={getScaledImageUrl()} alt={`Image ${localImage.id}`} className={styles.image} />
          )
        ) : (
          <div className={styles.placeholderImage}>
            {getPlaceholderText()}
          </div>
        )}

        <div className={styles.tagsContainer}>
          {isPending && (
            <div className={styles.pendingTag}>
              {isVideo() ? 'Generating Video' : 'Generating'}
            </div>
          )}

          {(isFailed || isContentPolicyFailed) && (
            <div className={styles.failedTag}>
              {isContentPolicyFailed ? 'Content Policy' : 'Failed'}
            </div>
          )}

          {/* 新增：视频标识标签 */}
          {localImage.url && isVideo() && (
            <div className={styles.videoTag}>Video</div>
          )}
        </div>

        {/* 悬停时显示的半透明黑色遮罩和作者信息 */}
        <div className={styles.overlay}>
          {/* 按钮区域 - 所有按钮都移到右侧 */}
          {(accountState.did || canToggleVisibility || showEditCover || showCarousel) && (
            <div className={styles.imagePublicStatus}>
              {/* 右侧按钮容器 - 包含所有按钮 */}
              <div className={styles.rightButtonContainer}>
                {isProcessing ? (
                  <div className={styles.processingIndicator}>
                    <div className={styles.typingIndicator}>
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* 点赞按钮移到右侧 */}
                    {accountState.did && (
                      <img
                        src={getLikeIcon()}
                        alt={localImage.is_liked ? "Liked" : "Not liked"}
                        className={styles.likeButton}
                        onClick={handleLikeClick}
                        style={{ opacity: isLiking ? 0.6 : 1 }}
                        title={localImage.is_liked ? "Unlike" : "Like"}
                      />
                    )}
                    {showEditCover && (
                      <img
                        src={coverSvg}
                        alt="cover"
                        className="w-7 h-7"
                        onClick={handleCoverClick}
                        title="Change cover"
                      />
                    )}
                    {showCarousel && (
                      <img
                        src={carouselSvg}
                        alt="carousel"
                        className="w-7 h-7"
                        onClick={handleCarouselClick}
                        title="Add/Remove featured image"
                      />
                    )}
                    {canToggleVisibility && (
                      <img
                        src={getImagePublicUrl()}
                        alt={isPublic ? "Visible" : "Hidden"}
                        className={styles.imagePublic}
                        onClick={handleToggleViewClick}
                        title={isPublic ? "Hide" : "Show"}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          )}
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