import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './Header';
import ContentDisplay from './ContentDisplay';
import ChatWindow from './ChatWindow';
import Pricing from './Pricing';
import styles from './MainLayout.module.css';
import Activity from "./Activity.tsx";

const MainLayout: React.FC = () => {

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
              <ChatWindow />
            </div>
          </div>
        } />
      </Routes>
    </div>
  );
};

export default MainLayout;