import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined, 
  ClockCircleOutlined, WechatOutlined,
  ScanOutlined, TeamOutlined, PercentageOutlined
} from '@ant-design/icons';
import { mockPromotionRecords, mockOfficialAccounts } from '../utils/mockData';
import { formatDateTime } from '../utils/helpers';
import type { PromotionRecord, OfficialAccount } from '../types';
import './RecordsPage.css';

type TimeFilter = 'all' | 'today' | 'week' | 'month';

// 公众号统计信息
interface AccountStats {
  account: OfficialAccount;
  scanCount: number;
  followCount: number;
  followRate: number;
  records: PromotionRecord[];
}

const RecordsPage = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<PromotionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');

  useEffect(() => {
    // 模拟加载数据
    setTimeout(() => {
      setRecords(mockPromotionRecords);
      setLoading(false);
    }, 500);
  }, []);

  // 根据时间筛选记录
  const filterRecordsByTime = (recordList: PromotionRecord[], filter: TimeFilter): PromotionRecord[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filter) {
      case 'today':
        return recordList.filter(r => {
          const recordDate = new Date(r.scanTime);
          return recordDate >= today;
        });
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return recordList.filter(r => {
          const recordDate = new Date(r.scanTime);
          return recordDate >= weekAgo;
        });
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return recordList.filter(r => {
          const recordDate = new Date(r.scanTime);
          return recordDate >= monthAgo;
        });
      default:
        return recordList;
    }
  };

  // 按时间筛选后的记录
  const timeFilteredRecords = useMemo(() => {
    return filterRecordsByTime(records, timeFilter);
  }, [records, timeFilter]);

  // 计算每个公众号的统计数据
  const accountStatsList = useMemo((): AccountStats[] => {
    const statsMap = new Map<string, AccountStats>();
    
    // 初始化所有公众号
    mockOfficialAccounts.forEach(account => {
      statsMap.set(account.id, {
        account,
        scanCount: 0,
        followCount: 0,
        followRate: 0,
        records: []
      });
    });
    
    // 统计数据
    timeFilteredRecords.forEach(record => {
      const stats = statsMap.get(record.accountId);
      if (stats) {
        stats.scanCount++;
        stats.records.push(record);
        if (record.isFollowed) {
          stats.followCount++;
        }
      }
    });
    
    // 计算关注率
    statsMap.forEach(stats => {
      stats.followRate = stats.scanCount > 0 
        ? Math.round((stats.followCount / stats.scanCount) * 100) 
        : 0;
      // 按时间排序
      stats.records.sort((a, b) => new Date(b.scanTime).getTime() - new Date(a.scanTime).getTime());
    });
    
    return Array.from(statsMap.values()).sort((a, b) => b.scanCount - a.scanCount);
  }, [timeFilteredRecords]);

  // 最终显示的记录（按公众号筛选）
  const displayRecords = useMemo(() => {
    if (accountFilter === 'all') return timeFilteredRecords;
    return timeFilteredRecords.filter(r => r.accountId === accountFilter);
  }, [timeFilteredRecords, accountFilter]);

  // 当前选中公众号的统计
  const currentAccountStats = useMemo(() => {
    if (accountFilter === 'all') return null;
    return accountStatsList.find(s => s.account.id === accountFilter);
  }, [accountStatsList, accountFilter]);

  // 总体统计
  const totalStats = useMemo(() => ({
    scanCount: timeFilteredRecords.length,
    followCount: timeFilteredRecords.filter(r => r.isFollowed).length,
    followRate: timeFilteredRecords.length > 0 
      ? Math.round((timeFilteredRecords.filter(r => r.isFollowed).length / timeFilteredRecords.length) * 100)
      : 0
  }), [timeFilteredRecords]);

  // 当前显示的统计
  const displayStats = useMemo(() => {
    if (accountFilter === 'all') {
      return totalStats;
    }
    return currentAccountStats ? {
      scanCount: currentAccountStats.scanCount,
      followCount: currentAccountStats.followCount,
      followRate: currentAccountStats.followRate
    } : { scanCount: 0, followCount: 0, followRate: 0 };
  }, [accountFilter, totalStats, currentAccountStats]);

  return (
    <div className="records-page">
      {/* 导航栏 */}
      <div className="navbar">
        <div className="navbar-back" onClick={() => navigate(-1)}>
          <ArrowLeftOutlined />
        </div>
        <div className="navbar-title">推广记录</div>
        <div className="navbar-action"></div>
      </div>

      {/* 时间筛选按钮 */}
      <div className="time-filter-container">
        <div className="time-filter-buttons">
          <button
            className={`time-filter-btn ${timeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setTimeFilter('all')}
          >
            全部
          </button>
          <button
            className={`time-filter-btn ${timeFilter === 'today' ? 'active' : ''}`}
            onClick={() => setTimeFilter('today')}
          >
            今日
          </button>
          <button
            className={`time-filter-btn ${timeFilter === 'week' ? 'active' : ''}`}
            onClick={() => setTimeFilter('week')}
          >
            本周
          </button>
          <button
            className={`time-filter-btn ${timeFilter === 'month' ? 'active' : ''}`}
            onClick={() => setTimeFilter('month')}
          >
            本月
          </button>
        </div>
      </div>

      {/* 公众号筛选 */}
      <div className="account-filter-container">
        <div className="account-filter-scroll">
          <button
            className={`account-filter-chip ${accountFilter === 'all' ? 'active' : ''}`}
            onClick={() => setAccountFilter('all')}
          >
            全部公众号
          </button>
          {mockOfficialAccounts.map(account => {
            const stats = accountStatsList.find(s => s.account.id === account.id);
            return (
              <button
                key={account.id}
                className={`account-filter-chip ${accountFilter === account.id ? 'active' : ''}`}
                onClick={() => setAccountFilter(account.id)}
              >
                {account.avatar && <img src={account.avatar} alt="" className="chip-avatar" />}
                <span className="chip-name">{account.name}</span>
                <span className="chip-count">{stats?.scanCount || 0}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 统计概览 */}
      <div className="stats-overview-card">
        <div className="stats-overview-title">
          {accountFilter === 'all' ? (
            <>
              <WechatOutlined style={{ marginRight: 8 }} />
              全部公众号推广数据
            </>
          ) : (
            <>
              {currentAccountStats?.account.avatar && (
                <img src={currentAccountStats.account.avatar} alt="" className="title-avatar" />
              )}
              {currentAccountStats?.account.name} 推广数据
            </>
          )}
        </div>
        <div className="stats-overview-grid">
          <div className="stats-overview-item">
            <ScanOutlined className="stats-icon" />
            <div className="stats-num">{displayStats.scanCount}</div>
            <div className="stats-label">扫码次数</div>
          </div>
          <div className="stats-overview-item">
            <TeamOutlined className="stats-icon success" />
            <div className="stats-num">{displayStats.followCount}</div>
            <div className="stats-label">关注人数</div>
          </div>
          <div className="stats-overview-item">
            <PercentageOutlined className="stats-icon primary" />
            <div className="stats-num">{displayStats.followRate}%</div>
            <div className="stats-label">转化率</div>
          </div>
        </div>
      </div>

      {/* 各公众号数据概览（仅全部时显示） */}
      {accountFilter === 'all' && (
        <div className="accounts-summary">
          <div className="accounts-summary-title">各公众号数据</div>
          <div className="accounts-summary-list">
            {accountStatsList.map(stats => (
              <div 
                key={stats.account.id} 
                className="account-summary-item"
                onClick={() => setAccountFilter(stats.account.id)}
              >
                <div className="account-summary-left">
                  {stats.account.avatar ? (
                    <img src={stats.account.avatar} alt="" className="summary-avatar" />
                  ) : (
                    <WechatOutlined className="summary-avatar-placeholder" />
                  )}
                  <div className="summary-info">
                    <div className="summary-name">{stats.account.name}</div>
                    <div className="summary-mini">
                      扫码 {stats.scanCount} · 关注 {stats.followCount} · 转化 {stats.followRate}%
                    </div>
                  </div>
                </div>
                <div className="summary-arrow">›</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 记录列表 */}
      <div className="records-list-container">
        <div className="records-list-title">
          推广明细
          <span className="records-count">{displayRecords.length} 条</span>
        </div>
        
        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>加载中...</p>
          </div>
        ) : displayRecords.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📋</div>
            <div className="empty-text">暂无推广记录</div>
          </div>
        ) : (
          <div className="records-detail-list">
            {displayRecords.map((record) => (
              <div key={record.id} className="record-item-card">
                <div className="record-item-header">
                  <div className="record-item-time">{formatDateTime(record.scanTime)}</div>
                  {record.isFollowed ? (
                    <span className="record-status followed">
                      <CheckCircleOutlined /> 已关注
                    </span>
                  ) : (
                    <span className="record-status not-followed">
                      <CloseCircleOutlined /> 未关注
                    </span>
                  )}
                </div>
                {accountFilter === 'all' && (
                  <div className="record-item-account">
                    {record.accountAvatar ? (
                      <img src={record.accountAvatar} alt="" className="record-item-avatar" />
                    ) : (
                      <WechatOutlined />
                    )}
                    <span>{record.accountName}</span>
                  </div>
                )}
                {record.nickname && (
                  <div className="record-item-nickname">
                    用户：{record.nickname}
                  </div>
                )}
                {record.followTime && (
                  <div className="record-item-follow-time">
                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                    关注时间：{formatDateTime(record.followTime)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部提示 */}
      <div className="records-tip">
        <p>数据每小时更新一次</p>
      </div>
    </div>
  );
};

export default RecordsPage;