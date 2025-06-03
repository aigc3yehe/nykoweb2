import React, {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import styles from './ActivityContent.module.css';
import BackIcon from '../assets/back.svg';
import InfoTabIcon from '../assets/info_tab.svg';
import InfoTabSelectedIcon from '../assets/info_tab_selected.svg';
import LeaderboardTabIcon from '../assets/leaderboard_tab.svg';
import InfoIcon from '../assets/circle_info.svg';
import GoldRankIcon from '../assets/gold_rank.svg';
import SilverRankIcon from '../assets/silver.svg';
import BronzeRankIcon from '../assets/bronze.svg';
import ReactMarkdown from 'react-markdown';
import { getLeaderboard, LeaderboardItem } from '../services/userService';

// 示例 Markdown 内容
const markdownContent = `
# What is Project Primedata S1?

Project Primedata S1 marks the launch phase of NYKO, a 12-week incentive program running from May 6 UTC 12:00  to July 30 UTC 12:00. It rewards users who contribute valuable data (by using creative components) and help amplify NYKO mindshare (by sharing on X) with $NYKO tokens.

## How to Participate

- Get Premium Access

  Deposit 75,000 $NYKO into the [Plan&Pricing](/pricing) page.
- Earn Generation Rewards

  Create images using NYKO AI image generation service.
- Earn Mindshare Rewards

  Share your creative outputs from the platform on X, or simply mention @niyoko_agent or $NYKO. If your creation is related to Virtuals native culture, like Vader, Luna, AIXBT, you'll earn *3 points! And make sure to tag this Agent.

## Reward Structure

- 30 million $NYKO distributed totally based on user points.

## Reward Calculation

Generation Points = GENI × EF × Cooldown

- GENI (AI Creator Score): Default is 1. After being certified as an AI expert-level creator, increased up to 3. Open a ticket in Discord to apply.
- EF (EpochFlow): 2 if you created something yesterday, otherwise 1.
- Cooldown: After 3 generations in a single day, value becomes 0; otherwise 1. Reset to 1 every 24h.

Mindshare Points = GENI × IF × Cooldown_X x Virtuality

- GENI (AI Creator Score): Default is 1. After being certified as an AI expert-level creator, increased up to 3. Open a ticket in Discord to apply.
- IF (Influence Factor): 5~20, depends on the social influence of your tweets.
- Cooldown_X: Every day, we select the most influential tweet for pointing.
- Virtuality: 3 if your creation is related to Virtuals native culture, like Vader, Luna, AIXBT, otherwise 1.
`;

type TabType = 'information' | 'leaderboard';

const ActivityContent: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('information');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardItem[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [leaderboardLoaded, setLeaderboardLoaded] = useState(false);

  // Tooltip 相关状态
  const [showTooltip, setShowTooltip] = useState(false);

  // 滚动相关状态
  const [scrollHeight, setScrollHeight] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);

  const contentRef = useRef<HTMLDivElement>(null);
  const customScrollbarRef = useRef<HTMLDivElement>(null);

  // 返回首页
  const handleBack = () => {
    navigate('/');
  };

  // Tooltip 处理函数
  const handleTooltipShow = () => {
    setShowTooltip(true);
  };

  const handleTooltipHide = () => {
    setShowTooltip(false);
  };

  // 格式化数字显示
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // 获取排行榜数据
  const fetchLeaderboard = async () => {
    if (leaderboardLoaded) return; // 如果已经加载过，不重复请求

    setIsLoadingLeaderboard(true);
    try {
      const response = await getLeaderboard({
        page: 1,
        pageSize: 20, // 获取前20名
      });
      setLeaderboardData(response.data);
      setLeaderboardLoaded(true);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      setLeaderboardData([]);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };

  // 当切换到排行榜 tab 时获取数据（仅第一次）
  useEffect(() => {
    if (activeTab === 'leaderboard' && !leaderboardLoaded) {
      fetchLeaderboard();
    }
  }, [activeTab, fetchLeaderboard, leaderboardLoaded]);

  // 格式化用户名显示
  const formatUserName = (item: LeaderboardItem) => {
    if (item.twitter?.name) return item.twitter.name;
    if (item.twitter?.username) return `@${item.twitter.username}`;
    return item.user.slice(0, 8) + '...';
  };

  // 获取排名图标和样式
  const getRankDisplay = (index: number) => {
    const rank = index + 1;

    if (rank === 1) {
      return {
        icon: GoldRankIcon,
        textColor: '#871800',
        itemClass: styles.goldRank
      };
    } else if (rank === 2) {
      return {
        icon: SilverRankIcon,
        textColor: '#1F222A',
        itemClass: styles.silverRank
      };
    } else if (rank === 3) {
      return {
        icon: BronzeRankIcon,
        textColor: '#442B14',
        itemClass: styles.bronzeRank
      };
    }

    return {
      icon: null,
      textColor: '#FFFFFF',
      itemClass: ''
    };
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const CustomLink = ({ node, href, children, ...props}: any) => {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();

      if (href && href.startsWith('/')) {
        navigate(href);
      } else if (href){
        window.open(href, '_blank', 'noopener,noreferrer');
      }
    }
    return (
      <a href={href} onClick={handleClick} {...props}>
        {children}
      </a>
    );
  };

  // 根据条件确定要显示的周信息
  const weekInfo = { week: 'Week 5 (6.3-6.9)', rewards: '2,500,000', mindshare_points: 'X3' }

  // 更新滚动状态
  useEffect(() => {
    const updateScrollInfo = () => {
      if (contentRef.current) {
        setScrollHeight(contentRef.current.scrollHeight);
        setClientHeight(contentRef.current.clientHeight);
        setScrollTop(contentRef.current.scrollTop);
      }
    };

    // 初始更新
    updateScrollInfo();

    // 添加滚动事件监听器
    const container = contentRef.current;
    if (container) {
      container.addEventListener('scroll', updateScrollInfo);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', updateScrollInfo);
      }
    };
  }, []);

  // 处理自定义滚动条拖动
  const handleScrollThumbDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();

    const startY = e.clientY;
    const startScrollTop = scrollTop;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (contentRef.current) {
        const deltaY = moveEvent.clientY - startY;
        const scrollRatio = deltaY / clientHeight;
        contentRef.current.scrollTop = startScrollTop + scrollRatio * scrollHeight;
        setScrollTop(contentRef.current.scrollTop);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // 计算滚动条高度和位置
  const getScrollThumbHeight = () => {
    if (scrollHeight <= clientHeight) return 0;
    return Math.max(30, (clientHeight / scrollHeight) * clientHeight);
  };

  const getScrollThumbTop = () => {
    if (scrollHeight <= clientHeight) return 0;
    return (scrollTop / (scrollHeight - clientHeight)) * (clientHeight - getScrollThumbHeight());
  };

  // 显示自定义滚动条的条件
  const showCustomScrollbar = scrollHeight > clientHeight;

  // 渲染排行榜内容
  const renderLeaderboard = () => {
    if (isLoadingLeaderboard) {
      return <div className={styles.loadingState}>Loading leaderboard...</div>;
    }

    if (leaderboardData.length === 0) {
      return <div className={styles.emptyState}>No leaderboard data available</div>;
    }

    return (
      <div className={styles.leaderboardContainer}>
        <div className={styles.leaderboardHeader}>
          <div className={styles.headerRank}>Rank</div>
          <div className={styles.headerUser}>User</div>
          <div className={styles.headerPoints}>Weekly Points</div>
        </div>
        <div className={styles.leaderboardList}>
          {leaderboardData.map((item, index) => {
            const rankDisplay = getRankDisplay(index);
            const isOdd = index % 2 === 0; // 奇数行（从0开始计数）

            return (
              <div
                key={item.user}
                className={`${styles.leaderboardItem} ${rankDisplay.itemClass} ${isOdd ? styles.oddRow : styles.evenRow}`}
              >
                <div className={styles.rankColumn}>
                  {rankDisplay.icon ? (
                    <div className={styles.rankIconContainer}>
                      <img
                        src={rankDisplay.icon}
                        alt={`Rank ${index + 1}`}
                        className={styles.rankIcon}
                      />
                      <span
                        className={styles.rankText}
                        style={{ color: rankDisplay.textColor }}
                      >
                        {index + 1}
                      </span>
                    </div>
                  ) : (
                    <span
                      className={styles.rankNumber}
                      style={{ color: rankDisplay.textColor }}
                    >
                      {index + 1}
                    </span>
                  )}
                </div>

                <div className={styles.userColumn}>
                  <div className={styles.userAvatarContainer}>
                    <img
                      src={item.twitter?.profilePictureUrl || '/default-avatar.png'}
                      alt="User Avatar"
                      className={styles.userAvatar}
                    />
                    <div className={styles.geniBadge}>
                      <span className={styles.geniValue}>{item.geni}</span>
                    </div>
                  </div>
                  <span className={styles.userName}>{formatUserName(item)}</span>
                </div>

                <div className={styles.pointsColumn}>
                  <span className={styles.pointsValue}>{formatNumber(item.points)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.activityContent}>
      <div className={styles.contentScrollArea}>
        <div
          ref={contentRef}
          className={`${styles.scrollContainer} ${styles.hideScrollbar}`}
        >
          <div className={styles.contentWrapper}>
            {/* 顶部导航栏 */}
            <div className={styles.topNav}>
              <button className={styles.backButton} onClick={handleBack}>
                <img src={BackIcon} alt="Back" />
                <span>Back</span>
              </button>
            </div>

            {/* Banner 区域 */}
            <div className={styles.bannerArea}>
              <div className={styles.bannerTitle}>
                <h1 className={styles.mainTitle}>Project Primedata</h1>
                <p className={styles.subTitle}>season one</p>
              </div>

              <div className={styles.tagsGroup}>
                <div className={styles.tagItem}>{weekInfo.week}</div>
                <div className={styles.tagItem}>Rewards: {weekInfo.rewards} $NYKO</div>
                <div className={styles.tagItemWithTooltip}>
                  <div className={styles.tagItem}>
                    <span
                      onClick={handleTooltipShow}
                      className={styles.clickableText}
                    >
                      Mindshare Points: {weekInfo.mindshare_points} (Virtuality)
                    </span>
                    <img
                      src={InfoIcon}
                      alt="Information"
                      className={styles.tabInfo}
                      onMouseEnter={handleTooltipShow}
                      onMouseLeave={handleTooltipHide}
                    />
                  </div>
                  {showTooltip && (
                    <div className={styles.tooltip}>
                      <div className={styles.tooltipTitle}>
                        Mindshare Points = GENI × IF × Cooldown_X × Virtuality
                      </div>
                      <div className={styles.tooltipContent}>
                        *Virtuality: 3 if your twitter content relates to native Virtuals culture (Vader, Luna, AIXBT, etc.), otherwise 1.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tab 导航 */}
            <div className={styles.tabContainer}>
              <button
                className={`${styles.tabButton} ${styles.infoTab} ${
                  activeTab === 'information' ? styles.active : ''
                }`}
                onClick={() => setActiveTab('information')}
              >
                <img
                  src={activeTab === 'information' ? InfoTabSelectedIcon : InfoTabIcon}
                  alt="Information"
                  className={styles.tabIcon}
                />
                <span className={styles.tabText}>Information</span>
              </button>

              <button
                className={`${styles.tabButton} ${styles.leaderboardTab} ${
                  activeTab === 'leaderboard' ? styles.active : ''
                }`}
                onClick={() => setActiveTab('leaderboard')}
              >
                <img
                  src={LeaderboardTabIcon}
                  alt="Leaderboard"
                  className={styles.tabIcon}
                />
                <span className={styles.tabText}>Leaderboard</span>
              </button>
            </div>

            {/* 内容区域 - 使用隐藏显示而不是条件渲染 */}
            <div className={`${styles.markdownContent} ${activeTab !== 'information' ? styles.hidden : ''}`}>
              <ReactMarkdown components={{
                a: CustomLink,
              }}>
                {markdownContent}
              </ReactMarkdown>
            </div>

            <div className={`${styles.leaderboardWrapper} ${activeTab !== 'leaderboard' ? styles.hidden : ''}`}>
              {renderLeaderboard()}
            </div>
          </div>
        </div>

        {/* 自定义滚动条 */}
        {showCustomScrollbar && (
          <div className={styles.scrollbarTrack}>
            <div
              ref={customScrollbarRef}
              className={styles.scrollbarThumb}
              style={{
                height: `${getScrollThumbHeight()}px`,
                top: `${getScrollThumbTop()}px`
              }}
              onMouseDown={handleScrollThumbDrag}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityContent;
