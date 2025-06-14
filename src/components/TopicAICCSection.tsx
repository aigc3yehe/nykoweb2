import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './TopicAICCSection.module.css';
import { AICCItem } from '../store/topicStore';

interface TopicAICCSectionProps {
  aiccList: AICCItem[];
}

const TopicAICCSection: React.FC<TopicAICCSectionProps> = ({ aiccList }) => {
  // 只在数据变化时记录日志
  const aiccCount = aiccList?.length || 0;
  console.log('[TopicAICCSection] 📊 AICC List:', { count: aiccCount, hasData: aiccCount > 0 });
  
  const navigate = useNavigate();

  // 按source分组
  const workflowItems = aiccList.filter(item => item.source === 'workflow');
  const modelItems = aiccList.filter(item => item.source === 'model');

  const handleItemClick = (item: AICCItem) => {
    const encodedName = encodeURIComponent(item.name);

    // 根据source类型跳转到相应页面
    if (item.source === 'model') {
      navigate(`/?model_id=${item.id}&model_name=${encodedName}`);
    } else if (item.source === 'workflow') {
      navigate(`/?workflow_id=${item.id}&workflow_name=${encodedName}`);
    }
  };

  // 渲染AICC卡片的函数
  const renderAICCCards = (items: AICCItem[]) => (
    <div className={styles.marqueeWrapper}>
      <div className={styles.marqueeContent}>
        {items.map((item, index) => (
          <div
            key={`${item.source}-${item.id}`}
            className={`${styles.aiccCard} ${index === 0 ? styles.firstCard : ''}`}
            onClick={() => handleItemClick(item)}
          >
            {/* 金光扫光效果 - 只在第一项显示 */}
            {index === 0 && <div className={styles.goldSweep}></div>}
            
            {/* Source标签 - 左上角 */}
            <div className={styles.sourceTag}>
              {item.source}
            </div>
            
            {item.cover ? (
              <img
                src={item.cover}
                alt={item.name}
                className={styles.aiccCoverImage}
                draggable={false}
              />
            ) : (
              <div className={styles.aiccCoverPlaceholder}>
                No Image
              </div>
            )}
            <div className={styles.aiccOverlay} />
            <div className={styles.aiccInfo}>
              <div className={styles.aiccTags}>
                {(item.tags || []).slice(0, 3).map((tag, index) => (
                  <span key={index} className={styles.aiccTag}>
                    {tag}
                  </span>
                ))}
              </div>
              <div className={styles.aiccName}>{item.name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (aiccList.length === 0) {
    return (
      <div className={styles.aiccSection}>
        <h2 className={styles.sectionTitle}>AICCs</h2>
        <div className={styles.emptyMessage}>No AICCs found for this topic</div>
      </div>
    );
  }

  return (
    <div className={styles.aiccSection}>
      {/* Workflow板块 */}
      {workflowItems.length > 0 && (
        <div className={styles.aiccSubSection}>
          <h3 className={styles.subSectionTitle}>Workflow</h3>
          {renderAICCCards(workflowItems)}
        </div>
      )}

      {/* Models板块 */}
      {modelItems.length > 0 && (
        <div className={styles.aiccSubSection}>
          <h3 className={styles.subSectionTitle}>Models</h3>
          {renderAICCCards(modelItems)}
        </div>
      )}
    </div>
  );
};

export default TopicAICCSection; 