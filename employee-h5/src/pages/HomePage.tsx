import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogoutOutlined, ShareAltOutlined, DownloadOutlined, 
  TrophyOutlined, FileTextOutlined, QuestionCircleOutlined, AppstoreOutlined 
} from '@ant-design/icons';
import { getLocalStorage, removeLocalStorage } from '../utils/helpers';
import type { Employee } from '../types';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [stats] = useState({
    totalScans: 128,
    totalFollows: 89,
    conversionRate: '69.5%',
    todayScans: 12,
    todayFollows: 8
  });
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    const savedEmployee = getLocalStorage<Employee>('employee');
    if (savedEmployee) {
      setEmployee(savedEmployee);
    }
  }, []);

  const handleLogout = () => {
    if (window.confirm('确定要退出登录吗？')) {
      removeLocalStorage('employee');
      removeLocalStorage('isBound');
      navigate('/bind');
    }
  };

  const handleShare = () => {
    alert('分享功能开发中...');
  };

  const handleDownload = () => {
    alert('保存功能开发中...');
  };

  if (!employee) {
    return (
      <div className="loading-page">
        <div className="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* 顶部导航 */}
      <div className="navbar">
        <div className="navbar-title">我的推广码</div>
        <div className="navbar-right" onClick={handleLogout}>
          <LogoutOutlined />
        </div>
      </div>

      {/* 推广数据统计 */}
      <div className="stats-container">
        <div className="stats-header">
          <span className="stats-title">推广数据</span>
          <span className="stats-subtitle">累计数据</span>
        </div>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{stats.totalScans}</div>
            <div className="stat-label">累计扫码</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.totalFollows}</div>
            <div className="stat-label">累计关注</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.conversionRate}</div>
            <div className="stat-label">转化率</div>
          </div>
        </div>
        <div className="stats-divider"></div>
        <div className="stats-today">
          <span>今日新增：扫码 <strong>{stats.todayScans}</strong> 次，关注 <strong>{stats.todayFollows}</strong> 人</span>
        </div>
      </div>

      {/* 推广二维码 */}
      <div className="qr-container">
        <div className="qr-header">
          <span className="qr-title">我的推广码</span>
          <span className="qr-tip">点击查看大图</span>
        </div>
        <div className="qr-box" onClick={() => setShowQRModal(true)}>
          <div className="qr-placeholder">
            <AppstoreOutlined />
          </div>
        </div>
        <div className="qr-info">
          <p className="qr-employee">推广人：{employee.name}</p>
          <p className="qr-dept">{employee.department}</p>
        </div>
        <div className="qr-actions">
          <button className="action-btn share" onClick={handleShare}>
            <ShareAltOutlined /> 分享
          </button>
          <button className="action-btn download" onClick={handleDownload}>
            <DownloadOutlined /> 保存
          </button>
        </div>
      </div>

      {/* 快捷入口 */}
      <div className="quick-menu">
        <div className="menu-item" onClick={() => navigate('/ranking')}>
          <TrophyOutlined className="menu-icon-custom" />
          <div className="menu-title">推广榜单</div>
          <div className="menu-desc">查看排行</div>
        </div>
        <div className="menu-item" onClick={() => navigate('/records')}>
          <FileTextOutlined className="menu-icon-custom" />
          <div className="menu-title">推广记录</div>
          <div className="menu-desc">查看明细</div>
        </div>
        <div className="menu-item" onClick={() => navigate('/help')}>
          <QuestionCircleOutlined className="menu-icon-custom" />
          <div className="menu-title">帮助说明</div>
          <div className="menu-desc">使用指南</div>
        </div>
      </div>

      {/* 底部提示 */}
      <div className="footer-tip">
        <p>让更多人关注我们的公众号</p>
        <p>一起为组织发展贡献力量</p>
      </div>

      {/* 二维码弹窗 */}
      {showQRModal && (
        <div className="modal-overlay" onClick={() => setShowQRModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>我的推广码</h3>
              <span className="modal-close" onClick={() => setShowQRModal(false)}>×</span>
            </div>
            <div className="modal-body">
              <div className="qr-large">
                <AppstoreOutlined />
              </div>
              <div className="qr-label">扫码关注公众号</div>
              <div className="qr-employee-info">
                推广人：{employee.name} · {employee.department}
              </div>
            </div>
            <div className="modal-footer">
              <button className="share-btn" onClick={handleShare}>
                <ShareAltOutlined /> 分享给好友
              </button>
              <button className="download-btn" onClick={handleDownload}>
                <DownloadOutlined /> 保存到相册
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;