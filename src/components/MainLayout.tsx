import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './Header';
import ChatWindow from './ChatWindow';
import Pricing from './Pricing';
import styles from './MainLayout.module.css';
import Activity from "./Activity.tsx";
import TokenMarquee from './TokenMarquee';
import LinkWallet from './LinkWallet.tsx';
import TopicPageRouter from './TopicPageRouter';
import TopicRelatedTweets from './TopicRelatedTweets';

const MainLayout: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const hasTopic = searchParams.has('topic');

  return (
    <div className={styles.mainLayout}>
      <Header />
      <Routes>
        <Route path="/pricing" element={
          <div className={styles.fullWidthContent}>
            <Pricing />
          </div>
        } />
        <Route path="/primedatas1" element={
          <div className={styles.fullWidthContent}>
            <Activity />
          </div>
        } />
        <Route path="/link-wallet" element={
          <div className={styles.fullWidthContent}>
            <LinkWallet />
          </div>
        } />
        <Route path="*" element={
          hasTopic ? (
          <div className={styles.contentContainer}>
            <div className={styles.contentSection}>
                <div className={styles.centeredContent}>
              <TokenMarquee />
                  <TopicPageRouter />
                </div>
              </div>
              <div className={styles.chatSection}>
                <TopicRelatedTweets />
              </div>
            </div>
          ) : (
            <div className={styles.contentContainer}>
              <div className={styles.contentSection}>
                <div className={styles.centeredContent}>
                  <TokenMarquee />
                  <TopicPageRouter />
                </div>
            </div>
            <div className={styles.chatSection}>
              <ChatWindow />
            </div>
          </div>
          )
        } />
      </Routes>
    </div>
  );
};

export default MainLayout;