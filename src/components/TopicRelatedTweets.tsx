import React, { useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import styles from './TopicRelatedTweets.module.css';
import TweetCard from './TweetCard';
import { topicTweetsAtom, fetchTopicTweets } from '../store/topicTweetsStore';

interface TopicRelatedTweetsProps {
  topicName: string;
}

const TopicRelatedTweets: React.FC<TopicRelatedTweetsProps> = ({ topicName }) => {
  const [tweetsState] = useAtom(topicTweetsAtom);
  const fetchTweets = useSetAtom(fetchTopicTweets);

  // 当topic变化时获取推文数据
  useEffect(() => {
    if (topicName && topicName !== tweetsState.currentTopic) {
      console.log('[TopicRelatedTweets] Fetching tweets for topic:', topicName);
      fetchTweets(topicName);
    }
  }, [topicName, tweetsState.currentTopic, fetchTweets]);

  // 如果有错误或没有数据，不显示组件
  if (tweetsState.error || (!tweetsState.isLoading && tweetsState.tweets.length === 0)) {
    return null;
  }

  return (
    <>
      <h3 className={styles.tweetsTitle}>Related Tweets</h3>
      <div className={styles.tweetsContainer}>
        {tweetsState.isLoading ? (
          <div className={styles.loadingMessage}>
            Loading tweets...
        </div>
        ) : (
          tweetsState.tweets.map((tweet) => (
            <TweetCard key={tweet.tweet_id} tweet={tweet} />
          ))
        )}
      </div>
    </>
  );
};

export default TopicRelatedTweets; 