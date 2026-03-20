import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { EmployeeAccountFollow } from '../types';
import { mockEmployeeFollows } from '../utils/mockData';
import './FollowTask.css';

export default function FollowTask() {
  const navigate = useNavigate();
  const [followList, setFollowList] = useState<EmployeeAccountFollow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟获取关注状态
    setTimeout(() => {
      setFollowList(mockEmployeeFollows);
      setLoading(false);
    }, 500);
  }, []);

  const unfollowedCount = followList.filter(item => !item.isFollowed).length;

  const handleFollow = (account: EmployeeAccountFollow) => {
    // 如果有deepLink，跳转到微信
    if (account.deepLink) {
      // 先复制链接提示
      alert('即将跳转到微信关注公众号');
      window.location.href = account.deepLink;
    } else {
      // 显示二维码
      alert('请扫描二维码关注公众号');
    }
  };

  const refreshStatus = () => {
    setLoading(true);
    // 模拟刷新状态
    setTimeout(() => {
      // 随机更新一个未关注的为已关注（模拟真实刷新）
      setFollowList(prev => {
        const unfollowed = prev.filter(item => !item.isFollowed);
        if (unfollowed.length > 0) {
          const randomIndex = Math.floor(Math.random() * unfollowed.length);
          return prev.map(item => 
            item.accountId === unfollowed[randomIndex].accountId 
              ? { ...item, isFollowed: true, followTime: new Date().toISOString() }
              : item
          );
        }
        return prev;
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="follow-task-page">
      {/* 头部 */}
      <div className="follow-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <h1 className="page-title">公众号关注任务</h1>
        <button className="refresh-btn" onClick={refreshStatus} disabled={loading}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={loading ? 'spinning' : ''}>
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
        </button>
      </div>

      {/* 状态统计 */}
      <div className="follow-stats">
        <div className="stats-item">
          <span className="stats-value">{followList.length}</span>
          <span className="stats-label">全部公众号</span>
        </div>
        <div className="stats-divider"></div>
        <div className="stats-item">
          <span className="stats-value followed">{followList.filter(i => i.isFollowed).length}</span>
          <span className="stats-label">已关注</span>
        </div>
        <div className="stats-divider"></div>
        <div className="stats-item">
          <span className="stats-value unfollowed">{unfollowedCount}</span>
          <span className="stats-label">待关注</span>
        </div>
      </div>

      {/* 提醒横幅 */}
      {unfollowedCount > 0 && (
        <div className="alert-banner">
          <div className="alert-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div className="alert-content">
            <div className="alert-title">您还有 {unfollowedCount} 个公众号未关注</div>
            <div className="alert-desc">请关注以下公众号，以便接收最新消息和福利</div>
          </div>
        </div>
      )}

      {/* 关注列表 */}
      <div className="follow-list">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <span>加载中...</span>
          </div>
        ) : (
          followList.map((item) => (
            <div key={item.accountId} className={`follow-item ${!item.isFollowed ? 'unfollowed' : ''}`}>
              <div className="account-avatar">
                <img 
                  src={item.accountAvatar || `https://api.dicebear.com/7.x/shapes/svg?seed=${item.accountId}`} 
                  alt={item.accountName}
                />
              </div>
              <div className="account-info">
                <div className="account-name">{item.accountName}</div>
                {item.isFollowed ? (
                  <div className="follow-status">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>已关注 · {item.followTime ? new Date(item.followTime).toLocaleDateString() : ''}</span>
                  </div>
                ) : (
                  <div className="follow-status pending">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <span>待关注</span>
                  </div>
                )}
              </div>
              <div className="account-action">
                {item.isFollowed ? (
                  <span className="followed-tag">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    已关注
                  </span>
                ) : (
                  <button className="follow-btn" onClick={() => handleFollow(item)}>
                    立即关注
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 完成提示 */}
      {unfollowedCount === 0 && !loading && (
        <div className="complete-tip">
          <div className="complete-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div className="complete-text">太棒了！您已关注全部公众号</div>
        </div>
      )}
    </div>
  );
}