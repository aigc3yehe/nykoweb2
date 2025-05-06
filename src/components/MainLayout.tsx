import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './Header';
import ContentDisplay from './ContentDisplay';
import ChatWindow from './ChatWindow';
import Pricing from './Pricing';
import { useAtom } from 'jotai';
import { accountAtom } from '../store/accountStore';
import styles from './MainLayout.module.css';
import Activity from "./Activity.tsx";

const MainLayout: React.FC = () => {

  // 从accountStore获取用户信息
  const [accountState] = useAtom(accountAtom);
  const { did, twitter } = accountState;
  const uuid = twitter && twitter.subject

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
        <Route path="*" element={
          <div className={styles.contentContainer}>
            <div className={styles.contentSection}>
              <ContentDisplay />
            </div>
            <div className={styles.chatSection}>
              <ChatWindow
                uuid={uuid}
                did={did || undefined}
              />
            </div>
          </div>
        } />
      </Routes>
    </div>
  );
};

export default MainLayout;