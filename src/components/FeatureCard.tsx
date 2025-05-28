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
import { fetchFeatures, featureListAtom, Feature } from '../store/featureStore';
import { fetchModels } from '../store/modelStore';
import { fetchWorkflows } from '../store/workflowStore';
import { useNavigate } from 'react-router-dom';
import FeatureIcon from '../assets/feature.svg';

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
  const [, getModels] = useAtom(fetchModels);
  const [, getWorkflows] = useAtom(fetchWorkflows);

  // 跑马灯交互状态
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
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
        // 先获取 models 和 workflows 数据
        await Promise.all([
          getModels({ reset: true, view: true }),
          getWorkflows({ reset: true, view: true })
        ]);
        // 然后聚合为 features
        await getFeatures();
      } catch (error) {
        console.error('Failed to fetch features:', error);
      }
    };

    fetchData();
  }, [getModels, getWorkflows, getFeatures]);

  // 处理鼠标拖拽滑动
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!marqueeRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - marqueeRef.current.offsetLeft);
    setScrollLeft(marqueeRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !marqueeRef.current) return;
    e.preventDefault();
    const x = e.pageX - marqueeRef.current.offsetLeft;
    const walk = (x - startX) * 2; // 滑动速度
    marqueeRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setIsHovered(false);
  };

  // 处理 Feature 点击
  const handleFeatureClick = (feature: Feature) => {
    if (isDragging) return; // 如果正在拖拽，不触发点击

    if (feature.type === 'model') {
      navigate(`/?model_id=${feature.id}&model_name=${encodeURIComponent(feature.name)}`);
    } else if (feature.type === 'workflow') {
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
          <img src={FeatureIcon} alt="Features" className={styles.featureIcon} />
          <span className={styles.featuresTitleText}>Features</span>
        </div>

        {/* 跑马灯容器 */}
        <div
          className={styles.marqueeWrapper}
          ref={marqueeRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onMouseEnter={() => setIsHovered(true)}
        >
          {featureState.isLoading ? (
            <div className={styles.loadingText}>Loading features...</div>
          ) : featureState.error ? (
            <div className={styles.errorText}>Failed to load features</div>
          ) : (
            <div
              className={`${styles.marqueeContent} ${isHovered || isDragging ? styles.paused : ''}`}
            >
              {/* 复制一份数据以实现无缝循环 */}
              {[...featureState.features, ...featureState.features].map((feature, index) => (
                <div
                  key={`${feature.type}-${feature.id}-${index}`}
                  className={styles.featureCard}
                  onClick={() => handleFeatureClick(feature)}
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