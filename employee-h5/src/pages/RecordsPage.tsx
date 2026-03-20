import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import { mockPromotionRecords, getAccountPromotionStats } from '../utils/mockData';
import { formatDate } from '../utils/helpers';
import type { AccountPromotionStats } from '../types';
import './RecordsPage.css';

type TimeFilter = 'today' | 'week' | 'month' | 'all';
type StatusFilter = 'all' | 'followed' | 'unfollowed';

const RecordsPage = () => {
  const navigate = useNavigate();

  const [timeFilter, setTimeFilter] = useState<TimeFilter>('week');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all'); // 默认显示全部

  // 获取公众号统计
  const accountStats = useMemo(() => {
    return getAccountPromotionStats(mockPromotionRecords);
  }, []);

  // 当前选中的公众号统计
  const currentAccountStats = useMemo(() => {
    if (selectedAccountId === 'all') {
      return null;
    }
    return accountStats.find(a => a.accountId === selectedAccountId);
  }, [accountStats, selectedAccountId]);

  // 筛选数据
  const filteredRecords = useMemo(() => {
    let records = [...mockPromotionRecords];

    // 时间筛选
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    records = records.filter(record => {
      const recordDate = new Date(record.scanTime);
      switch (timeFilter) {
        case 'today':
          return recordDate >= today;
        case 'week':
          return recordDate >= weekAgo;
        case 'month':
          return recordDate >= monthStart;
        default:
          return true;
      }
    });

    // 状态筛选
    records = records.filter(record => {
      switch (statusFilter) {
        case 'followed':
          return record.isFollowed;
        case 'unfollowed':
          return !record.isFollowed;
        default:
          return true;
      }
    });

    // 公众号筛选
    if (selectedAccountId !== 'all') {
      records = records.filter(record => record.accountId === selectedAccountId);
    }

    return records;
  }, [timeFilter, statusFilter, selectedAccountId]);

  // 总统计（根据筛选条件计算）
  const totalStats = useMemo(() => {
    return {
      total: filteredRecords.length,
      followed: filteredRecords.filter(r => r.isFollowed).length,
      unfollowed: filteredRecords.filter(r => !r.isFollowed).length,
      conversionRate: filteredRecords.length > 0 
        ? Math.round(filteredRecords.filter(r => r.isFollowed).length / filteredRecords.length * 100) 
        : 0,
    };
  }, [filteredRecords]);

  const handleTimeFilterChange = (filter: TimeFilter) => {
    setTimeFilter(filter);
  };

  const handleStatusFilterChange = (filter: StatusFilter) => {
    setStatusFilter(filter);
  };

  const handleAccountFilterChange = (accountId: string) => {
    setSelectedAccountId(accountId);
  };

  // 渲染统计卡片
  const renderStatsCard = (stats: AccountPromotionStats | null, title: string) => {
    const data = stats || {
      scanCount: totalStats.total,
      followCount: totalStats.followed,
      todayScanCount: accountStats.reduce((sum, a) => sum + a.todayScanCount, 0),
      todayFollowCount: accountStats.reduce((sum, a) => sum + a.todayFollowCount, 0),
      monthScanCount: accountStats.reduce((sum, a) => sum + a.monthScanCount, 0),
      monthFollowCount: accountStats.reduce((sum, a) => sum + a.monthFollowCount, 0),
    };

    return (
      <div className="stats-card">
        <div className="stats-card-title">{title}</div>
        <div className="stats-card-grid">
          <div className="stats-item">
            <div className="stats-value">{data.scanCount}</div>
            <div className="stats-label">总扫码</div>
          </div>
          <div className="stats-item">
            <div className="stats-value success">{data.followCount}</div>
            <div className="stats-label">已关注</div>
          </div>
          <div className="stats-item">
            <div className="stats-value">{data.todayScanCount}</div>
            <div className="stats-label">今日扫码</div>
          </div>
          <div className="stats-item">
            <div className="stats-value success">{data.todayFollowCount}</div>
            <div className="stats-label">今日关注</div>
          </div>
          <div className="stats-item">
            <div className="stats-value">{data.monthScanCount}</div>
            <div className="stats-label">本月扫码</div>
          </div>
          <div className="stats-item">
            <div className="stats-value success">{data.monthFollowCount}</div>
            <div className="stats-label">本月关注</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="records-page">
      {/* 顶部导航 */}
      <div className="navbar">
        <div className="navbar-left" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </div>
        <div className="navbar-title">推广记录</div>
        <div className="navbar-right"></div>
      </div>

      {/* 公众号筛选标签 - 放在最上面 */}
      <div className="account-filter-tabs">
        <button
          className={`account-tab ${selectedAccountId === 'all' ? 'active' : ''}`}
          onClick={() => handleAccountFilterChange('all')}
        >
          全部
        </button>
        {accountStats.map(stats => (
          <button
            key={stats.accountId}
            className={`account-tab ${selectedAccountId === stats.accountId ? 'active' : ''}`}
            onClick={() => handleAccountFilterChange(stats.accountId)}
          >
            {stats.accountName}
          </button>
        ))}
      </div>

      {/* 汇总数据区域 */}
      <div className="stats-section">
        {selectedAccountId === 'all' ? (
          // 显示全部汇总 + 各公众号统计
          <>
            {renderStatsCard(null, '全部汇总')}
            <div className="account-stats-list">
              {accountStats.map(stats => (
                <div key={stats.accountId} className="account-stats-item" onClick={() => handleAccountFilterChange(stats.accountId)}>
                  <div className="account-stats-header">
                    <div className="account-stats-avatar">
                      {stats.accountName.charAt(0)}
                    </div>
                    <div className="account-stats-info">
                      <div className="account-stats-name">{stats.accountName}</div>
                      <div className="account-stats-mini">
                        扫码 {stats.scanCount} · 关注 {stats.followCount}
                      </div>
                    </div>
                    <div className="account-stats-rate">
                      {stats.scanCount > 0 ? Math.round(stats.followCount / stats.scanCount * 100) : 0}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          // 显示单个公众号统计
          currentAccountStats && renderStatsCard(currentAccountStats, currentAccountStats.accountName)
        )}
      </div>

      {/* 筛选器 */}
      <div className="filters-section">
        <div className="filter-group">
          <span className="filter-label">时间：</span>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${timeFilter === 'today' ? 'active' : ''}`}
              onClick={() => handleTimeFilterChange('today')}
            >
              今日
            </button>
            <button
              className={`filter-btn ${timeFilter === 'week' ? 'active' : ''}`}
              onClick={() => handleTimeFilterChange('week')}
            >
              本周
            </button>
            <button
              className={`filter-btn ${timeFilter === 'month' ? 'active' : ''}`}
              onClick={() => handleTimeFilterChange('month')}
            >
              本月
            </button>
            <button
              className={`filter-btn ${timeFilter === 'all' ? 'active' : ''}`}
              onClick={() => handleTimeFilterChange('all')}
            >
              全部
            </button>
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-label">状态：</span>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => handleStatusFilterChange('all')}
            >
              全部
            </button>
            <button
              className={`filter-btn ${statusFilter === 'followed' ? 'active success' : ''}`}
              onClick={() => handleStatusFilterChange('followed')}
            >
              已关注
            </button>
            <button
              className={`filter-btn ${statusFilter === 'unfollowed' ? 'active warning' : ''}`}
              onClick={() => handleStatusFilterChange('unfollowed')}
            >
              未关注
            </button>
          </div>
        </div>
      </div>

      {/* 明细数据区域 */}
      <div className="records-list-section">
        <div className="section-header">
          <span className="section-title">推广明细</span>
          <span className="section-count">共 {filteredRecords.length} 条</span>
        </div>

        {filteredRecords.length > 0 ? (
          <div className="records-list">
            {filteredRecords.map((record) => (
              <div key={record.id} className="record-card">
                <div className="record-header">
                  <div className="record-avatar">
                    {record.nickname ? record.nickname.charAt(0) : '?'}
                  </div>
                  <div className="record-info">
                    <div className="record-name">
                      {record.nickname || '匿名用户'}
                    </div>
                    <div className="record-meta">
                      <span className="record-account">{record.accountName}</span>
                      <span className="record-time">{formatDate(record.scanTime)}</span>
                    </div>
                  </div>
                  <div className={`record-status ${record.isFollowed ? 'followed' : 'unfollowed'}`}>
                    {record.isFollowed ? '已关注' : '未关注'}
                  </div>
                </div>
                {record.isFollowed && record.followTime && (
                  <div className="record-footer">
                    <span className="follow-time">
                      关注时间：{formatDate(record.followTime)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="📋"
            title="暂无推广记录"
            description="还没有推广数据，快去分享推广码吧！"
            action={{
              text: '返回首页',
              onClick: () => navigate('/')
            }}
          />
        )}
      </div>

      {/* 底部提示 */}
      <div className="records-footer">
        <p>记录每天同步更新</p>
        <p>继续加油，让更多人关注！</p>
      </div>
    </div>
  );
};

export default RecordsPage;