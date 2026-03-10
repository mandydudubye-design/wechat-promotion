// 所有公众号统计页面

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, BarChartOutlined } from '@ant-design/icons';
import AccountStatsCard from '../components/AccountStatsCard';
import { getEmployeeAccountStats } from '../utils/mockAccountData';
import './AllAccountsStatsPage.css';

const AllAccountsStatsPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [sortBy, setSortBy] = useState<'scanCount' | 'followCount' | 'followRate'>('scanCount');

  // 模拟当前员工
  const employee = {
    employeeId: 'EMP001',
    name: '张三',
  };

  useEffect(() => {
    // 获取员工的所有公众号和统计数据
    const allStats = getEmployeeAccountStats(employee.employeeId);
    setStats(allStats);
  }, [employee.employeeId]);

  const handleBack = () => {
    navigate(-1);
  };

  const getSortedAccounts = () => {
    if (!stats) return [];

    return Object.values(stats.accountStats)
      .sort((a: any, b: any) => {
        if (sortBy === 'scanCount') return b.scanCount - a.scanCount;
        if (sortBy === 'followCount') return b.followCount - a.followCount;
        return b.followRate - a.followRate;
      });
  };

  if (!stats) {
    return <div className="loading">加载中...</div>;
  }

  const sortedAccounts = getSortedAccounts();

  return (
    <div className="all-accounts-stats-page">
      {/* 导航栏 */}
      <div className="navbar">
        <div className="navbar-back" onClick={handleBack}>
          <ArrowLeftOutlined />
        </div>
        <div className="navbar-title">所有公众号统计</div>
        <div className="navbar-action"></div>
      </div>

      {/* 汇总统计卡片 */}
      <div className="summary-stats-card">
        <div className="summary-stats-header">
          <BarChartOutlined className="summary-icon" />
          <span className="summary-title">汇总统计</span>
        </div>

        <div className="summary-stats-grid">
          <div className="summary-stat-item">
            <div className="summary-stat-value">{stats.totalStats.totalAccountCount}</div>
            <div className="summary-stat-label">公众号数</div>
          </div>

          <div className="summary-stat-item">
            <div className="summary-stat-value">{stats.totalStats.totalScanCount}</div>
            <div className="summary-stat-label">总扫码数</div>
          </div>

          <div className="summary-stat-item">
            <div className="summary-stat-value">{stats.totalStats.totalFollowCount}</div>
            <div className="summary-stat-label">总关注数</div>
          </div>

          <div className="summary-stat-item">
            <div className="summary-stat-value">{stats.totalStats.avgFollowRate}%</div>
            <div className="summary-stat-label">平均关注率</div>
          </div>
        </div>
      </div>

      {/* 排序选择器 */}
      <div className="sort-selector">
        <div className="sort-label">排序方式:</div>
        <div className="sort-options">
          <div
            className={`sort-option ${sortBy === 'scanCount' ? 'active' : ''}`}
            onClick={() => setSortBy('scanCount')}
          >
            按扫码数
          </div>
          <div
            className={`sort-option ${sortBy === 'followCount' ? 'active' : ''}`}
            onClick={() => setSortBy('followCount')}
          >
            按关注数
          </div>
          <div
            className={`sort-option ${sortBy === 'followRate' ? 'active' : ''}`}
            onClick={() => setSortBy('followRate')}
          >
            按关注率
          </div>
        </div>
      </div>

      {/* 各公众号统计卡片 */}
      <div className="accounts-stats-list">
        {sortedAccounts.map((accountStats: any) => (
          <AccountStatsCard
            key={accountStats.accountId}
            stats={accountStats}
            showRank={true}
          />
        ))}
      </div>
    </div>
  );
};

export default AllAccountsStatsPage;
