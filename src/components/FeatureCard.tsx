import React from 'react';
import styles from './FeatureCard.module.css';
import {useAtom, useSetAtom} from 'jotai';
import {
  sendMessage
} from '../store/chatStore';
import {showToastAtom} from "../store/imagesStore.ts";
import {usePrivy} from "@privy-io/react-auth";

// @ts-ignore
interface FeatureCardProps {
  // 可以根据需要添加属性
}

const FeatureCard: React.FC<FeatureCardProps> = () => {
  const [, sendMessageAction] = useAtom(sendMessage);
  const showToast = useSetAtom(showToastAtom);
  const { authenticated } = usePrivy();

  const handleGenerateClick = async () => {
    if (!authenticated) {
      showToast({
        message: 'Please log in first',
        severity: 'info'
      });
      return;
    }
    await sendMessageAction('I want to generate an image.')
  };

  const handleTrainClick = async () => {
    if (!authenticated) {
      showToast({
        message: 'Please log in first',
        severity: 'info'
      });
      return;
    }
    await sendMessageAction('I want to finetuning a model.')
  };

  // 处理"Creativity economy model"点击事件
  const handleCreativityEconomyClick = () => {
    // 前往文档
    window.open('https://www.nyko.cool/', '_blank');
  };

  // 处理"Apply for early access"点击事件
  const handleApplyForAccessClick = () => {
    // 前往申请表
    window.open('https://discord.com/channels/1368843355362164786/1368986279319961600', '_blank');
  };

  return (
    <div className={styles.featureCardContainer}>
      <div className={styles.featureCards}>
        <div className={styles.featureCard}>
          <div className={styles.cardContent}>
            <h3>Share your creativity</h3>
            <p>Publish your work on NYKO — access it anytime</p>
          </div>
          <div className={styles.buttonContainer}>
            <button className={styles.featureButton} onClick={handleGenerateClick}>Generate an image &gt;</button>
            <button className={styles.featureButton} onClick={handleTrainClick}>Train a model &gt;</button>
          </div>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.cardContent}>
            <h3>Tokenize your creativity</h3>
            <p>Launch an token for your work and earn rewards</p>
          </div>
          <div className={styles.buttonContainer}>
            <button className={styles.featureButton} onClick={handleCreativityEconomyClick}>Show how it works &gt;</button>
            <button className={styles.featureButton} onClick={handleApplyForAccessClick} style={{ display: 'none' }}>Apply for early access &gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;