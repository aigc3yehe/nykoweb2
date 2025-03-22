import React from 'react';
import styles from './ModelCard.module.css';
import { Model } from '../store/modelStore';
import avatarSvg from '../assets/Avatar.svg';
import usageSvg from '../assets/usage.svg';

interface ModelCardProps {
  model: Model;
}

const ModelCard: React.FC<ModelCardProps> = ({ model }) => {
  // 格式化数字，每三位添加逗号
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // 获取模型训练状态
  const getTrainState = (state: number) => {
    switch (state) {
      case 0:
        return '待训练';
      case 1:
        return '训练中';
      case 2:
        return '已完成';
      default:
        return '未知状态';
    }
  };
  
  // 检查是否在训练中
  const isTraining = model.model_tran[0]?.train_state === 0 || model.model_tran[0]?.train_state === 1;
  // 检查是否已完成训练
  const isCompleted = model.model_tran[0]?.train_state === 2;

  return (
    <div className={styles.modelCard}>
      <div className={styles.modelCover}>
        <img src={model.cover} alt={model.name} />
        
        <div className={styles.tagsContainer}>
          {isTraining && (
            <div className={styles.trainingTag}>
              Training
            </div>
          )}
          
          {isCompleted && (
            <>
              <div className={styles.completedTag}>$Token</div>
              <div className={styles.completedTag}>$234K</div>
            </>
          )}
        </div>
      </div>
      
      <div className={styles.modelInfo}>
        <h3 className={styles.modelName}>{model.name}</h3>
        
        <div className={styles.modelMeta}>
          <div className={styles.twitterInfo}>
            {model.users.twitter ? (
              <img 
                src={`https://unavatar.io/twitter/${model.users.twitter}`} 
                alt="Twitter Avatar" 
                className={styles.twitterAvatar}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = avatarSvg;
                }}
              />
            ) : (
              <img src={avatarSvg} alt="Default Avatar" className={styles.twitterAvatar} />
            )}
            <span className={styles.twitterName}>
              {model.users.twitter || model.creator.substring(0, 6) + '...' + model.creator.substring(model.creator.length - 4)}
            </span>
          </div>
          
          <div className={styles.usageInfo}>
            <img src={usageSvg} alt="Usage" className={styles.usageIcon} />
            <span className={styles.usageCount}>{formatNumber(model.usage)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelCard; 