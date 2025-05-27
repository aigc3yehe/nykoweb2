import React from 'react';
import styles from './Activity.module.css';
import ActivityContent from './ActivityContent';
import ActivitySidebar from './ActivitySidebar';
import ImagesGridIcon from '../assets/images_grid_bg.svg';

const Activity: React.FC = () => {
  return (
    <div className={styles.activityContainer}>
      <div
        className={styles.contentArea}
        style={{ backgroundImage: `url(${ImagesGridIcon})` }}
      >
        <ActivityContent />
      </div>
      <ActivitySidebar />
    </div>
  );
};

export default Activity;