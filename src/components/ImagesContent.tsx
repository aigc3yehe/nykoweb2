import React from 'react';
import styles from './ImagesContent.module.css';

interface ImagesContentProps {
  ownedOnly: boolean;
}

const ImagesContent: React.FC<ImagesContentProps> = ({ ownedOnly }) => {
  return (
    <div className={styles.imagesContent}>
      <div className={styles.placeholder}>
        <p>这里是图片展示区域，可以根据需求进行开发。</p>
        <p>筛选条件: {ownedOnly ? '仅显示已拥有' : '显示全部'}</p>
      </div>
    </div>
  );
};

export default ImagesContent; 