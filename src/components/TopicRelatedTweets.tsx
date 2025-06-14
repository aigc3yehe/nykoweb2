import React from 'react';
import styles from './TopicRelatedTweets.module.css';

const TopicRelatedTweets: React.FC = () => {
  return (
    <div className={styles.relatedTweets}>
      <h3 className={styles.tweetsTitle}>Related Tweets</h3>
      <div className={styles.tweetsPlaceholder}>
        {/* 暂时没有数据，先留着div占位 */}
        <div className={styles.emptyMessage}>
          Coming soon...
        </div>
      </div>
    </div>
  );
};

export default TopicRelatedTweets; 