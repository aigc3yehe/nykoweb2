import React from 'react';
import styles from './AgentAppsContent.module.css';
import NFTSection from './NFTSection';
import ContentExtensionsSection from './ContentExtensionsSection';

const AgentAppsContent: React.FC = () => {
  return (
    <div className={styles.agentAppsContent}>
      {/* NFTs By $MISATO 板块 */}
      <NFTSection />
      
      {/* Content Extensions By NIYOKO 板块 */}
      <ContentExtensionsSection />
    </div>
  );
};

export default AgentAppsContent; 