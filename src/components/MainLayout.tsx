import React, { useState } from 'react';
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
import CollectionPage from './CollectionPage';

const MainLayout: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const hasTopic = searchParams.has('topic');
  
  // 检查是否是 collection 页面
  const hasCollection = searchParams.has('collection') && searchParams.has('name') && searchParams.has('description');

  // 移动端chat状态管理
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(true); // 默认展开

  const toggleMobileChat = () => {
    setIsMobileChatOpen(!isMobileChatOpen);
  };

  // 检查是否应该显示chat（只在首页显示）
  const shouldShowChat = !hasCollection && !hasTopic;

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
          <>
            {hasCollection ? (
              <div className={styles.fullWidthContent}>
                <CollectionPage
                  contractAddress={searchParams.get('collection')!}
                  name={searchParams.get('name')!}
                  description={searchParams.get('description')!}
                  onBack={() => window.history.back()}
                />
              </div>
            ) : hasTopic ? (
            <div className={styles.contentContainer}>
              <div className={styles.contentSection}>
                  <div className={styles.centeredContent}>
                <TokenMarquee />
                    <TopicPageRouter />
                  </div>
                </div>
                <div className={styles.relatedTweetsSection}>
                  <TopicRelatedTweets topicName={searchParams.get('topic') || ''} />
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
              <div className={`${styles.chatSection} ${isMobileChatOpen ? styles.mobileChatOpen : styles.mobileChatClosed}`}>
                {/* 移动端chat切换按钮 - 只在chat展开时显示在顶部 */}
                {isMobileChatOpen && (
                  <>
                    <button 
                      className={`${styles.mobileChatToggle} ${styles.toggleTop}`}
                      onClick={toggleMobileChat}
                    >
                      Close Chat
                    </button>
                    {/* 移动端提示文案 */}
                    <div className={styles.mobileNotice}>
                      Please use a desktop or use a mobile device in landscape mode
                    </div>
                  </>
                )}
                <ChatWindow />
              </div>
            </div>
            )}
            
            {/* 移动端chat收起时的展开按钮 - 只在首页且chat收起时显示 */}
            {shouldShowChat && !isMobileChatOpen && (
              <>
                <button 
                  className={`${styles.mobileChatToggle} ${styles.toggleBottom} ${styles.floatingToggle}`}
                  onClick={toggleMobileChat}
                >
                  Open Chat
                </button>
                {/* 移动端提示文案 */}
                <div className={`${styles.mobileNotice} ${styles.floatingNotice}`}>
                  Please use a desktop or use a mobile device in landscape mode
                </div>
              </>
            )}
          </>
        } />
      </Routes>
    </div>
  );
};

export default MainLayout;