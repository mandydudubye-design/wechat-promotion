import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, TrophyOutlined, ScanOutlined, UserOutlined } from '@ant-design/icons';
import { mockTodayRankings, mockMonthRankings } from '../utils/mockData';
import type { RankingItem } from '../types';
import './RankingPage.css';

const RankingPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'today' | 'month'>('today');
  const [rankings, setRankings] = useState<RankingItem[]>(mockTodayRankings);

  const handleTabChange = (tab: 'today' | 'month') => {
    setActiveTab(tab);
    setRankings(tab === 'today' ? mockTodayRankings : mockMonthRankings);
  };

  const getMyRanking = (): RankingItem | undefined => {
    return rankings.find(r => r.isMe);
  };

  const myRanking = getMyRanking();

  return (
    <div className="ranking-page">
      {/* 导航栏 */}
      <div className="navbar">
        <div className="navbar-back" onClick={() => navigate(-1)}>
          <ArrowLeftOutlined />
        </div>
        <div className="navbar-title">推广榜单</div>
        <div className="navbar-action"></div>
      </div>

      {/* 标签切换 */}
      <div className="tabs">
        <div
          className={`tab-item ${activeTab === 'today' ? 'active' : ''}`}
          onClick={() => handleTabChange('today')}
        >
          今日排行
        </div>
        <div
          className={`tab-item ${activeTab === 'month' ? 'active' : ''}`}
          onClick={() => handleTabChange('month')}
        >
          本月排行
        </div>
      </div>

      {/* 我的排名卡片 */}
      {myRanking && (
        <div className="my-ranking-card">
          <div className="my-ranking-header">
            <span className="my-ranking-label">我的排名</span>
            <span className="my-ranking-rank">第 {myRanking.rank} 名</span>
          </div>
          <div className="my-ranking-stats">
            <div className="my-ranking-stat">
              <span className="stat-value">{myRanking.scanCount}</span>
              <span className="stat-label">扫码数</span>
            </div>
            <div className="my-ranking-stat">
              <span className="stat-value">{myRanking.followCount}</span>
              <span className="stat-label">关注数</span>
            </div>
          </div>
        </div>
      )}

      {/* 排行榜列表 */}
      <div className="ranking-list">
        {rankings.map((item) => (
          <div
            key={item.employeeId}
            className={`ranking-item ${item.isMe ? 'is-me' : ''}`}
          >
            <div className={`rank-badge rank-${item.rank <= 3 ? item.rank : 'other'}`}>
              {item.rank <= 3 ? (
                <span className="rank-icon">{item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : '🥉'}</span>
              ) : (
                <span className="rank-number">{item.rank}</span>
              )}
            </div>

            <div className="ranking-info">
              <div className="ranking-name">
                <UserOutlined style={{ marginRight: '6px', fontSize: '14px' }} />
                {item.employeeName}
              </div>
              <div className="ranking-dept">{item.department}</div>
            </div>

            <div className="ranking-stats">
              <div className="ranking-stat">
                <ScanOutlined style={{ fontSize: '12px', marginRight: '2px' }} />
                <span className="stat-number">{item.scanCount}</span>
                <span className="stat-text">扫码</span>
              </div>
              <div className="ranking-stat">
                <TrophyOutlined style={{ fontSize: '12px', marginRight: '2px' }} />
                <span className="stat-number">{item.followCount}</span>
                <span className="stat-text">关注</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 统计提示 */}
      <div className="ranking-tip">
        <p>统计截止：{activeTab === 'today' ? '今日 23:59:59' : '本月最后一天 23:59:59'}</p>
        <p>每小时更新一次数据</p>
      </div>
    </div>
  );
};

export default RankingPage;
