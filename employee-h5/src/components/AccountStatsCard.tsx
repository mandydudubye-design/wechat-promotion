// 多账号数据统计卡片组件

import React from 'react';
import { BarChartOutlined, TrophyOutlined, CheckCircleOutlined, ScanOutlined } from '@ant-design/icons';
import type { AccountStats } from '../types/account';
import './AccountStatsCard.css';

interface AccountStatsCardProps {
  stats: AccountStats;
  onClick?: () => void;
  showRank?: boolean;
}

const AccountStatsCard: React.FC<AccountStatsCardProps> = ({
  stats,
  onClick,
  showRank = true,
}) => {
  return (
    <div className="account-stats-card" onClick={onClick}>
      <div className="account-stats-header">
        <div className="account-stats-title">
          <BarChartOutlined className="account-stats-icon" />
          <span className="account-stats-name">{stats.accountName}</span>
        </div>
        {showRank && stats.rank && (
          <div className="account-stats-rank">
            <TrophyOutlined />
            <span>第 {stats.rank} 名</span>
          </div>
        )}
      </div>

      <div className="account-stats-grid">
        <div className="account-stat-item">
          <ScanOutlined className="account-stat-icon scan-icon" />
          <div className="account-stat-value">{stats.scanCount}</div>
          <div className="account-stat-label">扫码数</div>
        </div>

        <div className="account-stat-item">
          <CheckCircleOutlined className="account-stat-icon follow-icon" />
          <div className="account-stat-value">{stats.followCount}</div>
          <div className="account-stat-label">关注数</div>
        </div>

        <div className="account-stat-item">
          <div className="account-stat-value rate">{stats.followRate}%</div>
          <div className="account-stat-label">关注率</div>
        </div>
      </div>

      <div className="account-stats-footer">
        <div className="mini-stat">
          <div className="mini-stat-label">今日扫码</div>
          <div className="mini-stat-value">{stats.todayScans}</div>
        </div>
        <div className="mini-stat">
          <div className="mini-stat-label">今日关注</div>
          <div className="mini-stat-value">{stats.todayFollows}</div>
        </div>
        <div className="mini-stat">
          <div className="mini-stat-label">本周扫码</div>
          <div className="mini-stat-value">{stats.weekScans}</div>
        </div>
        <div className="mini-stat">
          <div className="mini-stat-label">本周关注</div>
          <div className="mini-stat-value">{stats.weekFollows}</div>
        </div>
      </div>
    </div>
  );
};

export default AccountStatsCard;
