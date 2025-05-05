import React from 'react';
import styles from './Activity.module.css';
import ActivityContent from './ActivityContent';
import ActivitySidebar from './ActivitySidebar';

const Activity: React.FC = () => {
  return (
    <div className={styles.activityContainer}>
      <ActivityContent />
      <ActivitySidebar />
    </div>
  );
};

export default Activity;