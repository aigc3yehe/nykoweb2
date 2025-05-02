import React from 'react';
import styles from './FeatureCard.module.css';
import {useAtom, useSetAtom} from 'jotai';
import {
  sendMessage
} from '../store/chatStore';
import {showToastAtom} from "../store/imagesStore.ts";

// @ts-ignore
interface FeatureCardProps {
  // 可以根据需要添加属性
}

const FeatureCard: React.FC<FeatureCardProps> = () => {
  const [, sendMessageAction] = useAtom(sendMessage);
  const showToast = useSetAtom(showToastAtom);

  const handleChatNowClick = async () => {
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
    // 待补充链接
    console.log("Apply for early access clicked");
    // 显示成功提示
    showToast({
      message: 'Not open yet, please stay tuned',
      severity: 'info'
    });
  };

  return (
    <div className={styles.featureCardContainer}>
      <h2 className={styles.featureTitle}>SIMPLIFY AI CREATIVITY</h2>
      <div className={styles.featureCards}>
        <div className={styles.featureCard}>
          <div className={styles.cardContent}>
            <h3>Host creativity</h3>
            <p>With natural language, easily finetuning models, set up workflows, and host your creativity on NYKO — ready to use anytime.</p>
          </div>
          <div className={styles.buttonContainer}>
            <button className={styles.featureButton} onClick={handleChatNowClick}>Chat Now &gt;</button>
          </div>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.cardContent}>
            <h3>Tokenize creativity</h3>
            <p>Launch an associated token for your creativity and earn from its trading fees.</p>
          </div>
          <div className={styles.buttonContainer}>
            <button className={styles.featureButton} onClick={handleCreativityEconomyClick}>Creativity economy model &gt;</button>
            <button className={styles.featureButton} onClick={handleApplyForAccessClick}>Apply for early access &gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;