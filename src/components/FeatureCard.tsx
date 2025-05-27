import React, { useEffect, useState } from 'react';
import styles from './FeatureCard.module.css';
import {useAtom, useSetAtom} from 'jotai';
import {
  sendMessage
} from '../store/chatStore';
import {showToastAtom} from "../store/imagesStore.ts";
import {usePrivy} from "@privy-io/react-auth";
import { accountAtom } from '../store/accountStore';
import { queryUserPoints, QueryPointsResponse } from '../services/userService';

// @ts-ignore
interface FeatureCardProps {
  // 可以根据需要添加属性
}

// 格式化数字显示
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// 获取用户显示名称的逻辑（参考LoginButton）
const formatName = (twitter: any, address: string | null) => {
  if (!twitter) return formatAddress(address);
  if (twitter.name) return twitter.name;
  if (twitter.username) return twitter.username;
  return formatAddress(address);
};

// 格式化钱包地址
const formatAddress = (address: string | null) => {
  if (!address || address.length < 10) return address || "";
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

const FeatureCard: React.FC<FeatureCardProps> = () => {
  const [, sendMessageAction] = useAtom(sendMessage);
  const showToast = useSetAtom(showToastAtom);
  const { authenticated } = usePrivy();
  const [accountState] = useAtom(accountAtom);
  const [pointsData, setPointsData] = useState<QueryPointsResponse['data'] | null>(null);

  // 获取用户积分信息
  useEffect(() => {
    const fetchPoints = async () => {
      if (authenticated && accountState.did) {
        try {
          const response = await queryUserPoints({ user: accountState.did });
          setPointsData(response.data);
        } catch (error) {
          console.error('Failed to fetch user points:', error);
        }
      }
    };

    fetchPoints();
  }, [authenticated, accountState.did]);

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

  const handleCreateClick = async () => {
    if (!authenticated) {
      showToast({
        message: 'Please log in first',
        severity: 'info'
      });
      return;
    }
    await sendMessageAction('I want to create a workflow.')
  };

  // 处理"Creativity economy model"点击事件
  const handleCreativityEconomyClick = () => {
    // 前往文档
    window.open('https://www.nyko.cool/', '_blank');
  };

  // 处理 "Apply for early access"点击事件
  const handleApplyForAccessClick = () => {
    // 前往申请表
    window.open('https://discord.com/channels/1368843355362164786/1368986279319961600', '_blank');
  };

  // 渲染用户资产信息
  const renderUserAssets = () => {
    if (!pointsData) return null;

    return (
      <div className={styles.userAssetsContainer}>
        {/* 用户信息行 */}
        <div className={styles.userInfoRow}>
          <img
            src={accountState.twitter?.profilePictureUrl || ""}
            alt="User Avatar"
            className={styles.userAvatar}
          />
          <span className={styles.userName}>
            {formatName(accountState.twitter, accountState.walletAddress)}
          </span>
        </div>

        {/* 资产信息行 */}
        <div className={styles.assetsRow}>
          {/* GENI */}
          <div className={styles.geniCard}>
            <div className={styles.geniLabel}>GENI</div>
            <div className={styles.geniValue}>x{formatNumber(pointsData.geni || 0)}</div>
          </div>

          {/* Weekly Points */}
          <div className={styles.pointsCard}>
            <div className={styles.pointsLabel}>Weekly Points</div>
            <div className={styles.pointsValue}>{formatNumber(pointsData.points || 0)}</div>
          </div>

          {/* Total Points */}
          <div className={styles.pointsCard}>
            <div className={styles.pointsLabel}>Total Points</div>
            <div className={styles.pointsValue}>{formatNumber(pointsData.total_points || 0)}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.featureCardContainer}>
      <div className={styles.featureCards}>
        <div className={styles.featureCard}>
          <div className={styles.cardContent}>
            <h3>Share Your Creativity</h3>
            <p>Host Your Creativity On NYKO — Ready To Use Anytime.</p>
          </div>
          <div className={styles.buttonContainer}>
            <button className={styles.featureButton} onClick={handleGenerateClick}>Generate Image &gt;</button>
            <button className={styles.featureButton} onClick={handleTrainClick}>Train Model &gt;</button>
            <button className={styles.featureButton} onClick={handleCreateClick}>Create Workflow &gt;</button>
          </div>
        </div>
        {authenticated ? (
            <div className={styles.featureCard}>
              {renderUserAssets()}
            </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default FeatureCard;