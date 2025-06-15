import React, { useState } from 'react';
import styles from './TweetCard.module.css';
import { Tweet, formatCount, formatPublishDate } from '../store/topicTweetsStore';

interface TweetCardProps {
  tweet: Tweet;
}

const TweetCard: React.FC<TweetCardProps> = ({ tweet }) => {
  const [imageError, setImageError] = useState(false);

  // 处理点击卡片跳转到推文
  const handleCardClick = () => {
    const tweetUrl = `https://x.com/${tweet.author_username}/status/${tweet.tweet_id}`;
    window.open(tweetUrl, '_blank', 'noopener,noreferrer');
  };

  // 处理头像加载错误
  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className={styles.tweet} onClick={handleCardClick}>
      {/* 用户信息区域 */}
      <div className={styles.userInfo}>
        {/* 头像 */}
        <div className={styles.avatar}>
          {!imageError && tweet.author_twitter.profile_picture_url ? (
            <img 
              src={tweet.author_twitter.profile_picture_url} 
              alt={tweet.author_name}
              onError={handleImageError}
            />
          ) : (
            <div className={styles.defaultAvatar} />
          )}
        </div>

        {/* 用户名和时间信息 */}
        <div className={styles.userDetails}>
          <div className={styles.userNameRow}>
            <div className={styles.authorName}>
              {tweet.author_name}
            </div>
            <div className={styles.publishDate}>
              {formatPublishDate(tweet.publish_date)}
            </div>
          </div>
          <div className={styles.authorUsername}>
            @{tweet.author_username}
          </div>
        </div>
      </div>

      {/* 推文内容 */}
      <div className={styles.content}>
        {tweet.content}
      </div>

      {/* 统计数据 */}
      <div className={styles.stats}>
        {/* 评论数 */}
        <div className={styles.statItem}>
          <div className={styles.statIcon}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1C4.13401 1 1 3.68629 1 7C1 8.8638 1.8042 10.5564 3.1416 11.7266L2.5 14.5L5.2734 13.8584C6.4436 14.1958 7.6862 14.5 8 14.5C11.866 14.5 15 11.8137 15 8C15 4.18629 11.866 1 8 1Z" fill="#88A4C2"/>
            </svg>
          </div>
          <span className={styles.statCount}>{formatCount(tweet.comment_count)}</span>
        </div>

        {/* 转发数 */}
        <div className={styles.statItem}>
          <div className={styles.statIcon}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4.5 2.5L2 5L4.5 7.5M11.5 13.5L14 11L11.5 8.5M2 5H10C11.6569 5 13 6.34315 13 8V11M14 11H6C4.34315 11 3 9.65685 3 8V5" stroke="#88A4C2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className={styles.statCount}>{formatCount(tweet.retweet_count)}</span>
        </div>

        {/* 点赞数 */}
        <div className={styles.statItem}>
          <div className={styles.statIcon}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 14L7.175 13.25C3.4 9.8 1 7.65 1 5C1 2.85 2.85 1 5 1C6.25 1 7.45 1.65 8 2.65C8.55 1.65 9.75 1 11 1C13.15 1 15 2.85 15 5C15 7.65 12.6 9.8 8.825 13.25L8 14Z" fill="#88A4C2"/>
            </svg>
          </div>
          <span className={styles.statCount}>{formatCount(tweet.like_count)}</span>
        </div>

        {/* 查看数 */}
        <div className={styles.statItem}>
          <div className={styles.statIcon}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3C4.5 3 1.73 5.11 1 8C1.73 10.89 4.5 13 8 13C11.5 13 14.27 10.89 15 8C14.27 5.11 11.5 3 8 3ZM8 11C6.34 11 5 9.66 5 8C5 6.34 6.34 5 8 5C9.66 5 11 6.34 11 8C11 9.66 9.66 11 8 11ZM8 6.5C7.17 6.5 6.5 7.17 6.5 8C6.5 8.83 7.17 9.5 8 9.5C8.83 9.5 9.5 8.83 9.5 8C9.5 7.17 8.83 6.5 8 6.5Z" fill="#88A4C2"/>
            </svg>
          </div>
          <span className={styles.statCount}>{formatCount(tweet.view_count)}</span>
        </div>
      </div>
    </div>
  );
};

export default TweetCard; 