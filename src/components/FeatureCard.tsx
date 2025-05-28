import React, { useEffect, useState, useRef } from 'react';
import styles from './FeatureCard.module.css';
import {useAtom, useSetAtom} from 'jotai';
import {
  sendMessage
} from '../store/chatStore';
import {showToastAtom} from "../store/imagesStore.ts";
import {usePrivy} from "@privy-io/react-auth";
import { accountAtom } from '../store/accountStore';
import { queryUserPoints, QueryPointsResponse } from '../services/userService';
import { fetchFeatures, featureListAtom, FeaturedItem, shouldRefreshFeatures } from '../store/featureStore';
import { useNavigate } from 'react-router-dom';
import { SOURCE_TYPE } from '../types/api.type';

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

const FeatureCard: React.FC = () => {
  const [, sendMessageAction] = useAtom(sendMessage);
  const showToast = useSetAtom(showToastAtom);
  const { authenticated } = usePrivy();
  const [accountState] = useAtom(accountAtom);
  const [pointsData, setPointsData] = useState<QueryPointsResponse['data'] | null>(null);

  // 添加 Features 相关状态
  const [featureState] = useAtom(featureListAtom);
  const [, getFeatures] = useAtom(fetchFeatures);
  const [needsRefresh] = useAtom(shouldRefreshFeatures);

  // 跑马灯交互状态
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragDistance, setDragDistance] = useState(0);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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

  // 获取 Features 数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 如果没有数据或需要刷新，则获取数据
        if (featureState.features.length === 0 || needsRefresh) {
          await getFeatures();
        }
      } catch (error) {
        console.error('Failed to fetch features:', error);
      }
    };

    fetchData();
  }, [getFeatures, featureState.features.length, needsRefresh]);

  // 处理鼠标拖拽滑动
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!marqueeRef.current) return;

    setIsDragging(true);
    setStartX(e.pageX - marqueeRef.current.offsetLeft);
    setScrollLeft(marqueeRef.current.scrollLeft);
    setDragDistance(0);

    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !marqueeRef.current) return;

    e.preventDefault();
    const x = e.pageX - marqueeRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    const newScrollLeft = scrollLeft - walk;

    setDragDistance(Math.abs(walk));
    marqueeRef.current.scrollLeft = newScrollLeft;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    setIsDragging(false);
    e.preventDefault();
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // 处理触摸事件（移动端）
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!marqueeRef.current) return;

    setIsDragging(true);
    const touch = e.touches[0];
    setStartX(touch.pageX - marqueeRef.current.offsetLeft);
    setScrollLeft(marqueeRef.current.scrollLeft);
    setDragDistance(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !marqueeRef.current) return;

    const touch = e.touches[0];
    const x = touch.pageX - marqueeRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    const newScrollLeft = scrollLeft - walk;

    setDragDistance(Math.abs(walk));
    marqueeRef.current.scrollLeft = newScrollLeft;

    // 防止页面滚动
    e.preventDefault();
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // 处理 Feature 点击 - 只在没有拖拽时触发
  const handleFeatureClick = (feature: FeaturedItem, e: React.MouseEvent | React.TouchEvent) => {
    // 如果拖拽距离超过阈值，则不触发点击
    if (dragDistance > 5) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (feature.source === SOURCE_TYPE.MODEL) {
      navigate(`/?model_id=${feature.id}&model_name=${encodeURIComponent(feature.name)}`);
    } else if (feature.source === SOURCE_TYPE.WORKFLOW) {
      navigate(`/?workflow_id=${feature.id}&workflow_name=${encodeURIComponent(feature.name)}`);
    }
  };

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

  const getScaledImageUrl = (url: string) => {
    return `https://ik.imagekit.io/xenoai/niyoko/${url}?tr=w-261,q-90`
  }

  // 渲染用户资产信息
  const renderUserAssets = () => {
    if (!pointsData) return null;
    // 打印 staked_points 数值
    console.log('Staked Points:', pointsData.staked_points);

    return (
      <div className={styles.userAssetsContainer}>
        {/* 用户信息行 - 包含头像、用户名和GENI */}
        <div className={styles.userInfoRow}>
          <div className={styles.userBasicInfo}>
            <img
              src={accountState.twitter?.profilePictureUrl || ""}
              alt="User Avatar"
              className={styles.userAvatar}
            />
            <span className={styles.userName}>
              {formatName(accountState.twitter, accountState.walletAddress)}
            </span>
          </div>

          {/* GENI 移到右侧 */}
          <div className={styles.geniCardHorizontal}>
            <div className={styles.geniLabel}>GENI</div>
            <div className={styles.geniValue}>{formatNumber(pointsData.geni || 0)}</div>
          </div>
        </div>

        {/* 积分信息行 - 三列布局 */}
        <div className={styles.pointsRow}>
          {/* Weekly Points */}
          <div className={styles.pointsCard}>
            <div className={styles.pointsLabel}>Weekly</div>
            <div className={styles.pointsValue}>{formatNumber(pointsData.points || 0)}</div>
          </div>

          {/* Total Points */}
          <div className={styles.pointsCard}>
            <div className={styles.pointsLabel}>Total</div>
            <div className={styles.pointsValue}>{formatNumber(pointsData.total_points || 0)}</div>
          </div>

          {/* Staking Points */}
          <div className={styles.pointsCard}>
            <div className={styles.pointsLabel}>Staking Points</div>
            <div className={styles.pointsValue}>{formatNumber(pointsData.staked_points || 0)}</div>
          </div>
        </div>
      </div>
    );
  };

  const renderFeatureCards = () => {
    return (<div className={styles.featureCardContainer}>
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
    </div>);
  };

  // 渲染 Features 跑马灯
  const renderFeaturesMarquee = () => {
    return (
      <div className={styles.featuresMarquee}>
        {/* 标题部分 */}
        <div className={styles.featuresTitle}>
          <span className={styles.featureEmoji}>⭐️</span>
          <span className={styles.featuresTitleText}>Featured</span>
          {featureState.isRefreshing && (
            <div className={styles.refreshIndicator}>
              <div className={styles.refreshSpinner}></div>
            </div>
          )}
        </div>

        {/* 跑马灯容器 */}
        <div
          className={styles.marqueeWrapper}
          ref={marqueeRef}
          // 鼠标事件
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          // 触摸事件
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {featureState.isLoading && featureState.features.length === 0 ? (
            <div className={styles.loadingText}>Loading features...</div>
          ) : featureState.error && featureState.features.length === 0 ? (
            <div className={styles.errorText}>Failed to load features</div>
          ) : (
            <div className={styles.marqueeContent}>
              {featureState.features.map((feature, index) => (
                <div
                  key={`${feature.source}-${feature.id}-${index}`}
                  className={styles.featureCard}
                  onClick={(e) => handleFeatureClick(feature, e)}
                >
                  <div className={styles.featureCardContent}>
                    {/* 封面图片 */}
                    <img
                      src={getScaledImageUrl(feature.cover)}
                      alt={feature.name}
                      className={styles.featureCoverImage}
                      draggable={false}
                    />

                    {/* 蒙板 */}
                    <div className={styles.featureOverlay} />

                    {/* 信息区域 */}
                    <div className={styles.featureInfo}>
                      {/* Tags */}
                      <div className={styles.featureTags}>
                        {feature.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span key={tagIndex} className={styles.featureTag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                      {/* Name */}
                      <div className={styles.featureName}>
                        {feature.name}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
      <div className={styles.featureContainer}>
        {renderFeatureCards()}
        {renderFeaturesMarquee()}
      </div>
  );
};

export default FeatureCard;