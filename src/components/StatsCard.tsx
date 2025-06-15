import React from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import styles from './StatsCard.module.css';
import { formatNumber, formatPercentage } from '../store/topicStatsStore';

interface StatsCardProps {
  title: string;
  current: number;
  change24h: number;
  history: Array<{ date: string; value: number; }>;
  isLoading?: boolean;
  type: 'mindshare' | 'creators' | 'posts';
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  current,
  change24h,
  history,
  isLoading = false,
  type
}) => {
  // 格式化当前值
  const formatCurrentValue = (value: number, type: string): string => {
    if (value === 0) return '--';
    
    if (type === 'mindshare') {
      return formatPercentage(value);
    }
    return formatNumber(value);
  };

  // 格式化24h变化值
  const formatChange24h = (value: number, type: string): string => {
    if (value === 0) return '--';
    
    const sign = value > 0 ? '+' : '';
    if (type === 'mindshare') {
      return `${sign}${formatPercentage(value)}`;
    }
    return `${sign}${formatNumber(Math.abs(value))}`;
  };

  // 判断变化趋势
  const isPositive = change24h > 0;
  const isNegative = change24h < 0;

  // 格式化时间显示
  const formatTooltipDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      // 格式化为本地时间显示，例如：06-15 13:00
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hour = String(date.getHours()).padStart(2, '0');
      return `${month}-${day} ${hour}:00`;
    } catch (error) {
      return dateString;
    }
  };

  // 自定义Tooltip组件
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const formattedValue = type === 'mindshare' ? formatPercentage(value) : formatNumber(value);
      
      return (
        <div className={styles.tooltip}>
          <p className={styles.tooltipDate}>{formatTooltipDate(label)}</p>
          <p className={styles.tooltipValue}>{formattedValue}</p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className={styles.statsCard}>
        <div className={styles.cardTitle}>{title}</div>
        <div className={styles.cardData}>
          <div className={styles.loadingSkeleton}>
            <div className={styles.skeletonLine}></div>
            <div className={styles.skeletonLine}></div>
          </div>
        </div>
        <div className={styles.chartContainer}>
          <div className={styles.chartSkeleton}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.statsCard}>
      {/* 标题 */}
      <div className={styles.cardTitle}>{title}</div>
      
      {/* 数据区域 */}
      <div className={styles.cardData}>
        {/* 当前值 */}
        <div className={styles.currentValue}>
          {formatCurrentValue(current, type)}
        </div>
        
        {/* 24h变化 */}
        <div className={styles.change24h}>
          <div className={styles.changeArrow}>
            {isPositive && (
              <svg className={styles.arrowUp} width="8" height="12" viewBox="0 0 8 12">
                <path d="M4 0L8 6H0L4 0Z" fill="#34C759" />
              </svg>
            )}
            {isNegative && (
              <svg className={styles.arrowDown} width="8" height="12" viewBox="0 0 8 12">
                <path d="M4 12L0 6H8L4 12Z" fill="#F87171" />
              </svg>
            )}
            <span className={`${styles.changeValue} ${isPositive ? styles.positive : isNegative ? styles.negative : styles.neutral}`}>
              {formatChange24h(change24h, type)}
            </span>
          </div>
          <span className={`${styles.changeLabel} ${isPositive ? styles.positive : isNegative ? styles.negative : styles.neutral}`}>
            (24h)
          </span>
        </div>
      </div>

      {/* 折线图 */}
      <div className={styles.chartContainer}>
        {history.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <Line
                type="monotone"
                dataKey="value"
                stroke="#FF6A00"
                strokeWidth={1}
                dot={false}
                activeDot={{ r: 2, fill: '#FF6A00' }}
              />
              <Tooltip content={<CustomTooltip />} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className={styles.noDataChart}>
            <span>No data</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard; 