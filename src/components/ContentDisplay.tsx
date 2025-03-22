import React, { useState } from 'react';
import styles from './ContentDisplay.module.css';
import ContentHeader from './ContentHeader';
import ModelsContent from './ModelsContent';
import ImagesContent from './ImagesContent';

const ContentDisplay: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'models' | 'images'>('models');
  const [ownedOnly, setOwnedOnly] = useState(false);
  const [sortOption, setSortOption] = useState<'New Model' | 'MKT CAP' | 'Popular'>('New Model');

  return (
    <div className={styles.contentDisplay}>
      <div className={styles.contentContainer}>
        <ContentHeader 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          ownedOnly={ownedOnly}
          setOwnedOnly={setOwnedOnly}
          sortOption={sortOption}
          setSortOption={setSortOption}
        />
        
        <div className={styles.contentBody}>
          {activeTab === 'models' ? (
            <ModelsContent ownedOnly={ownedOnly} sortOption={sortOption} />
          ) : (
            <ImagesContent ownedOnly={ownedOnly} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentDisplay;