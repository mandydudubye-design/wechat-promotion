import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import { mockPromotionRecords } from '../utils/mockData';
import { formatDateTime } from '../utils/helpers';
import type { PromotionRecord } from '../types';
import './RecordsPage.css';

const RecordsPage = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<PromotionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟加载数据
    setTimeout(() => {
      setRecords(mockPromotionRecords);
      setLoading(false);
    }, 500);
  }, []);

  const stats = {
    total: records.length,
    followed: records.filter(r => r.isFollowed).length,
    today: records.filter(r => {
      const today = new Date().toDateString();
      return new Date(r.scanTime).toDateString() === today;
    }).length,
  };

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

      {/* 统计卡片 */}
      <div className="stats-card">
        <div className="stat-item">
          <FileTextOutlined className="stat-icon" />
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">总记录</div>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <CheckCircleOutlined className="stat-icon stat-icon-success" />
          <div className="stat-value">{stats.followed}</div>
          <div className="stat-label">已关注</div>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <ClockCircleOutlined className="stat-icon stat-icon-warning" />
          <div className="stat-value">{stats.today}</div>
          <div className="stat-label">今日新增</div>
        </div>
      </div>

      {/* 记录列表 */}
      <div className="records-container">
        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>加载中...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📭</div>
            <div className="empty-text">暂无推广记录</div>
          </div>
        ) : (
          <div className="records-list">
            {records.map((record) => (
              <div key={record.id} className="record-item">
                <div className="record-header">
                  <div className="record-status">
                    {record.isFollowed ? (
                      <span className="status-badge followed">
                        <CheckCircleOutlined style={{ marginRight: '4px' }} />
                        已关注
                      </span>
                    ) : (
                      <span className="status-badge not-followed">
                        <CloseCircleOutlined style={{ marginRight: '4px' }} />
                        未关注
                      </span>
                    )}
                  </div>
                  <div className="record-time">{formatDateTime(record.scanTime)}</div>
                </div>

                <div className="record-body">
                  <div className="record-info">
                    {record.nickname && (
                      <div className="record-nickname">
                        <span className="label">昵称：</span>
                        <span className="value">{record.nickname}</span>
                      </div>
                    )}
                    {record.followTime && (
                      <div className="record-follow-time">
                        <span className="label">关注时间：</span>
                        <span className="value">{formatDateTime(record.followTime)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部提示 */}
      <div className="records-tip">
        <p>只显示最近100条记录</p>
        <p>数据每小时更新一次</p>
      </div>
    </div>
  );
};

export default RecordsPage;
