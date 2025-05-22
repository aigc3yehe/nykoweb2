import React, {useState} from 'react';
import styles from './WorkflowCard.module.css';
import {fetchToggleWorkflowView, Workflow} from '../store/workflowStore';
import avatarSvg from '../assets/Avatar.svg';
import usageSvg from '../assets/usage.svg';
import showSvg from '../assets/show.svg';
import hideSvg from '../assets/hidden.svg';
import emptyCoverIcon from "../assets/empty_cover.png";
import {useAtom, useSetAtom} from 'jotai';
import {showDialogAtom} from '../store/dialogStore';
import {accountAtom} from '../store/accountStore';
import {showToastAtom} from "../store/imagesStore";

interface WorkflowCardProps {
  workflow: Workflow;
}

const WorkflowCard: React.FC<WorkflowCardProps> = ({ workflow }) => {
  const [accountState] = useAtom(accountAtom);
  const [, toggleView] = useAtom(fetchToggleWorkflowView);
  const showDialog = useSetAtom(showDialogAtom);
  const showToast = useSetAtom(showToastAtom);
  const [isProcessing, setIsProcessing] = useState(false);
  const [localWorkflow, setLocalWorkflow] = useState(workflow);

  // 从workflow中获取可见性状态
  const isPublic = localWorkflow.public === 1;
  const isAdminHidden = localWorkflow.public === -1;

  // 检查当前用户是否有权限切换模型可见性
  // 只有管理员或模型创建者可以切换
  const canToggleVisibility =
    accountState.role === 'admin' ||
    (accountState.did && accountState.did === localWorkflow.creator);

  // 格式化数字，每三位添加逗号
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // 检查是否在训练中
  const isTraining = false
  // isTokenization
  const isTokenization = localWorkflow.workflow_tokenization && localWorkflow.workflow_tokenization?.metadata?.symbol;

  // 获取Twitter显示名称
  const getDisplayName = () => {
    if (localWorkflow.users.twitter?.name) {
      return localWorkflow.users.twitter.name;
    } else if (localWorkflow.users.twitter?.username) {
      return localWorkflow.users.twitter.username;
    } else {
      // 如果没有Twitter信息，显示缩略的钱包地址
      return localWorkflow.creator.substring(0, 6) + '...' + localWorkflow.creator.substring(localWorkflow.creator.length - 4);
    }
  };

  // 获取头像URL
  const getAvatarUrl = () => {
    if (localWorkflow.users.twitter?.profilePictureUrl) {
      return localWorkflow.users.twitter.profilePictureUrl;
    } else if (localWorkflow.users.twitter?.username) {
      // 备用方案：如果有username但没有profilePictureUrl，使用第三方服务
      return `https://unavatar.io/twitter/${localWorkflow.users.twitter.username}`;
    } else {
      return avatarSvg;
    }
  };

  // 获取cover
  const getCoverUrl = () => {
    const cover = localWorkflow.cover
    // 如果cover为空，返回默认图片
    if (!cover) {
      return emptyCoverIcon
    }
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
        message: 'This workflow has been hidden by administrators. Please contact our community team to restore visibility.',
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
        message: 'Are you sure you want to hide this workflow?',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        onConfirm: () => {
          setIsProcessing(true); // 设置处理中状态

          // 调用接口，将模型设为私有
          toggleView('workflow', localWorkflow.id, false)
            .then(() => {
              // 根据角色设置新的可见性状态
              const newPublicValue = accountState.role === 'admin' ? -1 : 0;

              // 更新本地模型数据
              setLocalWorkflow({
                ...localWorkflow,
                public: newPublicValue
              });

              // 显示成功提示
              showToast({
                message: 'Workflow has been hidden successfully',
                severity: 'success'
              });
            })
            .catch((error) => {
              console.error('Failed to change visibility:', error);
              showToast({
                message: 'Failed to hide the workflow. Please try again.',
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
        message: 'Are you sure you want to make this workflow visible?',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        onConfirm: () => {
          setIsProcessing(true); // 设置处理中状态

          // 调用接口，将模型设为公开
          toggleView('workflow', localWorkflow.id, true)
            .then(() => {
              // 设置新的可见性状态
              setLocalWorkflow({
                ...localWorkflow,
                public: 1
              });

              // 显示成功提示
              showToast({
                message: 'Workflow has been made visible successfully',
                severity: 'success'
              });
            })
            .catch((error) => {
              console.error('Failed to change visibility:', error);
              showToast({
                message: 'Failed to make the workflow visible. Please try again.',
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
    <div className={styles.workflowCard} style={{
      background: 'linear-gradient(121.69deg, rgba(31, 41, 55, 0.2) 22.31%, rgba(63, 79, 103, 0.2) 86.22%, rgba(70, 125, 206, 0.2) 106.88%)',
      backgroundColor: 'rgba(31, 41, 55, 0.2)',
      borderRadius: '0.5rem',
      backdropFilter: 'blur(1.875rem)'
    }}>
      <div className={styles.workflowCover}>
        <img
          src={getCoverUrl()}
          alt={localWorkflow.name}
          onError={(e) => {
            (e.target as HTMLImageElement).src = emptyCoverIcon;
          }}
        />

        <div className={styles.tagsContainer}>
          {isTraining && (
            <div className={styles.trainingTag}>
              Training
            </div>
          )}

          {isTokenization && (
            <>
              <div className={styles.completedTag}>${localWorkflow.workflow_tokenization?.metadata?.symbol}</div>
            </>
          )}
        </div>
      </div>

      <div className={styles.workflowInfo}>
        <h3 className={styles.workflowName}>{localWorkflow.name}</h3>

        <div className={styles.workflowMeta}>
          <div className={styles.twitterInfo}>
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

          <div className={styles.usageInfo}>
            <img src={usageSvg} alt="Usage" className={styles.usageIcon} />
            <span className={styles.usageCount}>{formatNumber(localWorkflow.usage)}</span>
          </div>
        </div>
      </div>

      {/* 确保overlay是workflowCard的直接子元素 */}
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

export default WorkflowCard;