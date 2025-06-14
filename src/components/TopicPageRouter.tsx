import React from 'react';
import { useLocation } from 'react-router-dom';
import ContentDisplay from './ContentDisplay';
import TopicPage from './TopicPage';

const decodeTopicName = (encodedTopic: string): string => {
  return decodeURIComponent(encodedTopic);
};

const TopicPageRouter: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const topicParam = searchParams.get('topic');

  if (topicParam) {
    const decodedTopic = decodeTopicName(topicParam);
    return <TopicPage topicName={decodedTopic} />;
  }

  return <ContentDisplay />;
};

export default TopicPageRouter; 