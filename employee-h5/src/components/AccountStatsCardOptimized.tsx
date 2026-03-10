// 优化版统计卡片组件

import React from 'react';
import { TrophyOutlined, ScanOutlined, UserAddOutlined, RiseOutlined, CalendarOutlined } from '@ant-design/icons';
import type { AccountStats } from '../types/account';
import './AccountStatsCardOptimized.css';

interface AccountStatsCardOptimizedProps {
  stats: AccountStats;
  ranking?: number;
  onClick?: () => void;
}

const AccountStatsCardOptimized: React.FC<AccountStatsCardOptimizedProps> = ({
  stats,
  ranking,
  onClick
}) => {
  const followRate = stats.scanCount > 0 
    ? ((stats.followCount / stats.scanCount) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="stats-card-optimized" onClick={onClick}>
      {/* 头部：标题和排名 */}
      <div className="stats-card-header">
        <div className="stats-card-title">
          <TrophyOutlined className="stats-card-icon" />
          <span>推广数据</span>
        </div>
        {ranking && (
          <div className="stats-card-ranking">
            #{ranking}
          </div>
        )}
      </div>

      {/* 主要数据 */}
      <div className="stats-card-main">
        <div className="stats-card-stat">
          <div className="stats-stat-value">{stats.scanCount.toLocaleString()}</div>
          <div className="stats-stat-label">
            <ScanOutlined />
            <span>扫码数</span>
          </div>
        </div>

        <div className="stats-card-stat">
          <div className="stats-stat-value">{stats.followCount.toLocaleString()}</div>
          <div className="stats-stat-label">
            <UserAddOutlined />
            <span>关注数</span>
          </div>
        </div>

        <div className="stats-card-stat">
          <div className="stats-stat-value">{followRate}%</div>
          <div className="stats-stat-label">
            <RiseOutlined />
            <span>关注率</span>
          </div>
        </div>
      </div>

      {/* 底部：时间维度数据 */}
      <div className="stats-card-footer">
        <div className="stats-card-time">
          <CalendarOutlined />
          <span>今日 +{stats.todayScans}</span>
        </div>
        <div className="stats-card-divider">|</div>
        <div className="stats-card-time">
          <span>本周 +{stats.weekScans}</span>
        </div>
      </div>
    </div>
  );
};

export default AccountStatsCardOptimized;
