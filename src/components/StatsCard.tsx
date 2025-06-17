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
  
  // 根据24h变化确定图表颜色
  const getChartColor = (): string => {
    if (change24h >= 0) {
      return '#34C759'; // 绿色：正数或0
    } else {
      return '#F87171'; // 红色：负数
    }
  };

  // 格式化时间显示
  const formatTooltipDate = (dateString: string): string => {
    console.log('[formatTooltipDate] 输入日期字符串:', dateString);
    
    // 如果是占位符日期，直接返回
    if (dateString === '--' || dateString === '1-1') {
      console.log('[formatTooltipDate] 占位符日期，直接返回');
      return dateString;
    }
    
    // 如果已经是 M-D 格式，直接返回
    if (/^\d{1,2}-\d{1,2}$/.test(dateString)) {
      console.log('[formatTooltipDate] 已经是 M-D 格式，直接返回:', dateString);
      return dateString;
    }
    
    try {
      const date = new Date(dateString);
      // 格式化为 M-D 格式，不补零
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const result = `${month}-${day}`;
      console.log('[formatTooltipDate] 转换结果:', result);
      return result;
    } catch (error) {
      console.log('[formatTooltipDate] 转换失败，返回原字符串:', dateString);
      return dateString;
    }
  };

  // 自定义Tooltip组件
  const CustomTooltip = ({ active, payload, label }: any) => {
    console.log('[CustomTooltip] active:', active, 'payload:', payload, 'label:', label);
    
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const formattedValue = type === 'mindshare' ? formatPercentage(value) : formatNumber(value);
      
      // 从 payload 中获取完整的数据项，包含 date 字段
      const dataItem = payload[0].payload;
      const actualDate = dataItem?.date || label;
      
      console.log('[CustomTooltip] dataItem:', dataItem, 'actualDate:', actualDate);
      
      return (
        <div className={styles.tooltip}>
          <p className={styles.tooltipDate}>{formatTooltipDate(actualDate)}</p>
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
                stroke={getChartColor()}
                strokeWidth={1}
                dot={false}
                activeDot={{ r: 2, fill: getChartColor() }}
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