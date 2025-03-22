import React from 'react';
import styles from './ModelsContent.module.css';

interface ModelsContentProps {
  ownedOnly: boolean;
  sortOption: 'New Model' | 'MKT CAP' | 'Popular';
}

const ModelsContent: React.FC<ModelsContentProps> = ({ ownedOnly, sortOption }) => {
  return (
    <div className={styles.modelsContent}>
      <div className={styles.placeholder}>
        <p>这里是模型展示区域，可以根据需求进行开发。</p>
        <p>筛选条件: {ownedOnly ? '仅显示已拥有' : '显示全部'}</p>
        <p>排序方式: {sortOption}</p>
      </div>
    </div>
  );
};

export default ModelsContent; 