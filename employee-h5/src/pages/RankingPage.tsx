import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import { mockRankingData } from '../utils/mockData';
import './RankingPage.css';

type TimeFilter = 'week' | 'month' | 'all';

const RankingPage = () => {
  const navigate = useNavigate();

  const [timeFilter, setTimeFilter] = useState<TimeFilter>('week');
  const [loading, setLoading] = useState(false);

  // 模拟获取当前员工ID
  const currentEmployeeId = 'EMP001';

  // 根据时间筛选获取数据
  const rankingData = useMemo(() => {
    // 实际项目中这里会根据 timeFilter 请求不同数据
    return mockRankingData.map((item, index) => ({
      ...item,
      rank: index + 1,
      isMe: item.employeeId === currentEmployeeId
    }));
  }, [timeFilter]);

  // 查找当前用户的排名
  const myRanking = useMemo(() => {
    return rankingData.find(item => item.isMe);
  }, [rankingData]);

  // 前三名数据
  const topThree = useMemo(() => rankingData.slice(0, 3), [rankingData]);
  // 其他排名数据
  const otherRankings = useMemo(() => rankingData.slice(3), [rankingData]);

  const handleTimeFilterChange = (filter: TimeFilter) => {
    if (filter !== timeFilter) {
      setLoading(true);
      setTimeFilter(filter);
      // 模拟加载
      setTimeout(() => setLoading(false), 300);
    }
  };

  return (
    <div className="ranking-page">
      {/* 顶部导航 */}
      <div className="navbar">
        <div className="navbar-left" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </div>
        <div className="navbar-title">推广排行榜</div>
        <div className="navbar-right"></div>
      </div>

      {/* 时间筛选 */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${timeFilter === 'week' ? 'active' : ''}`}
          onClick={() => handleTimeFilterChange('week')}
        >
          本周
        </button>
        <button
          className={`filter-tab ${timeFilter === 'month' ? 'active' : ''}`}
          onClick={() => handleTimeFilterChange('month')}
        >
          本月
        </button>
        <button
          className={`filter-tab ${timeFilter === 'all' ? 'active' : ''}`}
          onClick={() => handleTimeFilterChange('all')}
        >
          总榜
        </button>
      </div>

      {/* 我的排名卡片 */}
      {myRanking && (
        <div className="my-ranking-card">
          <div className="my-ranking-header">
            <span className="my-ranking-label">我的排名</span>
            <span className="my-ranking-badge">第 {myRanking.rank} 名</span>
          </div>
          <div className="my-ranking-stats">
            <div className="my-stat">
              <span className="my-stat-value">{myRanking.scanCount}</span>
              <span className="my-stat-label">扫码次数</span>
            </div>
            <div className="my-stat-divider"></div>
            <div className="my-stat highlight">
              <span className="my-stat-value">{myRanking.followCount}</span>
              <span className="my-stat-label">关注人数</span>
            </div>
            <div className="my-stat-divider"></div>
            <div className="my-stat">
              <span className="my-stat-value">
                {myRanking.scanCount > 0 
                  ? ((myRanking.followCount / myRanking.scanCount) * 100).toFixed(1) 
                  : 0}%
              </span>
              <span className="my-stat-label">转化率</span>
            </div>
          </div>
        </div>
      )}

      {/* 前三名展示 */}
      {topThree.length > 0 && (
        <div className="top-three-section">
          <h3 className="section-title">🏆 前三名</h3>
          <div className="top-three-podium">
            {/* 第二名 */}
            {topThree[1] && (
              <div className={`podium-item second ${topThree[1].isMe ? 'is-me' : ''}`}>
                <div className="podium-avatar">
                  <span className="rank-badge silver">2</span>
                  <div className="avatar-circle">{topThree[1].employeeName.charAt(0)}</div>
                </div>
                <div className="podium-name">{topThree[1].employeeName}</div>
                <div className="podium-dept">{topThree[1].department}</div>
                <div className="podium-stat">
                  <span className="stat-number">{topThree[1].followCount}</span>
                  <span className="stat-text">关注</span>
                </div>
                <div className="podium-bar silver-bar"></div>
              </div>
            )}

            {/* 第一名 */}
            {topThree[0] && (
              <div className={`podium-item first ${topThree[0].isMe ? 'is-me' : ''}`}>
                <div className="crown">👑</div>
                <div className="podium-avatar">
                  <span className="rank-badge gold">1</span>
                  <div className="avatar-circle">{topThree[0].employeeName.charAt(0)}</div>
                </div>
                <div className="podium-name">{topThree[0].employeeName}</div>
                <div className="podium-dept">{topThree[0].department}</div>
                <div className="podium-stat highlight">
                  <span className="stat-number">{topThree[0].followCount}</span>
                  <span className="stat-text">关注</span>
                </div>
                <div className="podium-bar gold-bar"></div>
              </div>
            )}

            {/* 第三名 */}
            {topThree[2] && (
              <div className={`podium-item third ${topThree[2].isMe ? 'is-me' : ''}`}>
                <div className="podium-avatar">
                  <span className="rank-badge bronze">3</span>
                  <div className="avatar-circle">{topThree[2].employeeName.charAt(0)}</div>
                </div>
                <div className="podium-name">{topThree[2].employeeName}</div>
                <div className="podium-dept">{topThree[2].department}</div>
                <div className="podium-stat">
                  <span className="stat-number">{topThree[2].followCount}</span>
                  <span className="stat-text">关注</span>
                </div>
                <div className="podium-bar bronze-bar"></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 其他排名列表 */}
      <div className="ranking-list-section">
        <h3 className="section-title">完整排名</h3>
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>加载中...</p>
          </div>
        ) : otherRankings.length > 0 ? (
          <div className="ranking-list">
            {otherRankings.map((item) => (
              <div
                key={item.employeeId}
                className={`ranking-item ${item.isMe ? 'is-me' : ''}`}
              >
                <div className="item-rank">
                  <span className="rank-number">{item.rank}</span>
                </div>
                <div className="item-avatar">
                  {item.employeeName.charAt(0)}
                </div>
                <div className="item-info">
                  <div className="item-name">
                    {item.employeeName}
                    {item.isMe && <span className="me-tag">我</span>}
                  </div>
                  <div className="item-dept">{item.department}</div>
                </div>
                <div className="item-stats">
                  <div className="item-stat">
                    <span className="stat-value">{item.followCount}</span>
                    <span className="stat-label">关注</span>
                  </div>
                  <div className="item-stat secondary">
                    <span className="stat-value">{item.scanCount}</span>
                    <span className="stat-label">扫码</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="📊"
            title="暂无排名数据"
            description="还没有推广数据，快去推广吧！"
          />
        )}
      </div>

      {/* 底部提示 */}
      <div className="ranking-footer">
        <p>排名每小时更新一次</p>
        <p>加油冲榜，争当推广之星！</p>
      </div>
    </div>
  );
};

export default RankingPage;