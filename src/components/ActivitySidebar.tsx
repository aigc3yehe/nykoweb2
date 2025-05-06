import React, { useRef, useState, useEffect } from 'react';
import styles from './ActivitySidebar.module.css';
import { useAtom } from 'jotai';
// import { activityAtom } from '../store/activityStore';
import { accountAtom } from '../store/accountStore';
import TwitterIcon from '../assets/twitter.svg';

const ActivitySidebar: React.FC = () => {
  // const [activityState] = useAtom(activityAtom);
  const [accountState] = useAtom(accountAtom);

  // 滚动相关状态
  const [scrollHeight, setScrollHeight] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const customScrollbarRef = useRef<HTMLDivElement>(null);

  // 更新滚动状态
  useEffect(() => {
    const updateScrollInfo = () => {
      if (sidebarRef.current) {
        setScrollHeight(sidebarRef.current.scrollHeight);
        setClientHeight(sidebarRef.current.clientHeight);
        setScrollTop(sidebarRef.current.scrollTop);
      }
    };

    // 初始更新
    updateScrollInfo();

    // 添加滚动事件监听器
    const container = sidebarRef.current;
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
      if (sidebarRef.current) {
        const deltaY = moveEvent.clientY - startY;
        const scrollRatio = deltaY / clientHeight;
        const newScrollTop = startScrollTop + scrollRatio * scrollHeight;

        sidebarRef.current.scrollTop = newScrollTop;
        setScrollTop(sidebarRef.current.scrollTop);
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

  return (
    <div className={styles.activitySidebar}>
      <div className={styles.sidebarScrollArea}>
        <div
          ref={sidebarRef}
          className={`${styles.scrollContainer} ${styles.hideScrollbar}`}
        >
          {!accountState.did ? (
            <div className={styles.notLoggedIn}>
              <p>请登录以查看您的活动参与状态</p>
            </div>
          ) : (
            <>
              {/* 用户推特信息卡片 */}
              <div className={styles.twitterCard}>
                <div className={styles.avatar}>
                  <img
                    src={accountState.twitter?.profilePictureUrl || '/default-avatar.png'}
                    alt="用户头像"
                  />
                </div>
                <div className={styles.userInfo}>
                  <div className={styles.nameRow}>
                    <span className={styles.name}>{accountState.twitter?.name || accountState.name || '用户'}</span>
                    <img src={TwitterIcon} alt="Twitter" className={styles.twitterIcon} />
                  </div>
                  <span className={styles.username}>@{accountState.twitter?.username || '未绑定推特'}</span>
                </div>
              </div>

              {/* 第一组列表卡片 - 本周积分 */}
              <div className={styles.listCard}>
                <div className={styles.keyValuePair}>
                  <span className={styles.keyTitle}>Points Of This Week</span>
                  <span className={styles.valueHighlight}>50,000</span>
                </div>
              </div>

              {/* 第二组列表卡片 - 两对 key-values */}
              <div className={styles.listCard}>
                <div className={styles.keyValuePair}>
                  <span className={styles.keyTitle}>GENI</span>
                  <span className={styles.valueText}>x1</span>
                </div>
                <div className={styles.divider}></div>
                <div className={styles.keyValuePair}>
                  <span className={styles.keyTitle}>EpochFlow</span>
                  <span className={styles.valueText}>x2</span>
                </div>
              </div>

              {/* 第三组列表卡片 - 三对 key-values */}
              <div className={styles.listCard}>
                <div className={styles.keyValuePair}>
                  <span className={styles.keyTitle}>Award History</span>
                  <span className={styles.valueText}>2</span>
                </div>
                <div className={styles.divider}></div>
                <div className={styles.keyValuePair}>
                  <span className={styles.keyTitle}>Week 1</span>
                  <span className={styles.valueText}>3,000 $NYKO</span>
                </div>
                <div className={styles.divider}></div>
                <div className={styles.keyValuePair}>
                  <span className={styles.keyTitle}>Week 2</span>
                  <span className={styles.valueText}>2,000 $NYKO</span>
                </div>
                <div className={styles.keyValuePair}>
                  <span className={styles.keyTitle}>Award History</span>
                  <span className={styles.valueText}>2</span>
                </div>
                <div className={styles.divider}></div>
                <div className={styles.keyValuePair}>
                  <span className={styles.keyTitle}>Week 1</span>
                  <span className={styles.valueText}>3,000 $NYKO</span>
                </div>
                <div className={styles.divider}></div>
                <div className={styles.keyValuePair}>
                  <span className={styles.keyTitle}>Week 2</span>
                  <span className={styles.valueText}>2,000 $NYKO</span>
                </div>
                <div className={styles.keyValuePair}>
                  <span className={styles.keyTitle}>Award History</span>
                  <span className={styles.valueText}>2</span>
                </div>
                <div className={styles.divider}></div>
                <div className={styles.keyValuePair}>
                  <span className={styles.keyTitle}>Week 1</span>
                  <span className={styles.valueText}>3,000 $NYKO</span>
                </div>
                <div className={styles.divider}></div>
                <div className={styles.keyValuePair}>
                  <span className={styles.keyTitle}>Week 2</span>
                  <span className={styles.valueText}>2,000 $NYKO</span>
                </div>
                <div className={styles.keyValuePair}>
                  <span className={styles.keyTitle}>Award History</span>
                  <span className={styles.valueText}>2</span>
                </div>
                <div className={styles.divider}></div>
                <div className={styles.keyValuePair}>
                  <span className={styles.keyTitle}>Week 1</span>
                  <span className={styles.valueText}>3,000 $NYKO</span>
                </div>
                <div className={styles.divider}></div>
                <div className={styles.keyValuePair}>
                  <span className={styles.keyTitle}>Week 2</span>
                  <span className={styles.valueText}>2,000 $NYKO</span>
                </div>
                <div className={styles.keyValuePair}>
                  <span className={styles.keyTitle}>Award History</span>
                  <span className={styles.valueText}>2</span>
                </div>
                <div className={styles.divider}></div>
                <div className={styles.keyValuePair}>
                  <span className={styles.keyTitle}>Week 1</span>
                  <span className={styles.valueText}>3,000 $NYKO</span>
                </div>
                <div className={styles.divider}></div>
                <div className={styles.keyValuePair}>
                  <span className={styles.keyTitle}>Week 2</span>
                  <span className={styles.valueText}>2,000 $NYKO</span>
                </div>
                <div className={styles.keyValuePair}>
                  <span className={styles.keyTitle}>Award History</span>
                  <span className={styles.valueText}>2</span>
                </div>
                <div className={styles.divider}></div>
                <div className={styles.keyValuePair}>
                  <span className={styles.keyTitle}>Week 1</span>
                  <span className={styles.valueText}>3,000 $NYKO</span>
                </div>
                <div className={styles.divider}></div>
                <div className={styles.keyValuePair}>
                  <span className={styles.keyTitle}>Week 2</span>
                  <span className={styles.valueText}>2,000 $NYKO</span>
                </div>
                <div className={styles.keyValuePair}>
                  <span className={styles.keyTitle}>Award History</span>
                  <span className={styles.valueText}>2</span>
                </div>
                <div className={styles.divider}></div>
                <div className={styles.keyValuePair}>
                  <span className={styles.keyTitle}>Week 1</span>
                  <span className={styles.valueText}>3,000 $NYKO</span>
                </div>
                <div className={styles.divider}></div>
                <div className={styles.keyValuePair}>
                  <span className={styles.keyTitle}>Week 2</span>
                  <span className={styles.valueText}>2,000 $NYKO</span>
                </div>
                <div className={styles.keyValuePair}>
                  <span className={styles.keyTitle}>Award History</span>
                  <span className={styles.valueText}>2</span>
                </div>
                <div className={styles.divider}></div>
                <div className={styles.keyValuePair}>
                  <span className={styles.keyTitle}>Week 1</span>
                  <span className={styles.valueText}>3,000 $NYKO</span>
                </div>
                <div className={styles.divider}></div>
                <div className={styles.keyValuePair}>
                  <span className={styles.keyTitle}>Week 2</span>
                  <span className={styles.valueText}>2,000 $NYKO</span>
                </div>
              </div>

            </>
          )}
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
  );
};

export default ActivitySidebar;
