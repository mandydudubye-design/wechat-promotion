import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogoutOutlined, ShareAltOutlined, DownloadOutlined, TrophyOutlined, FileTextOutlined, UserOutlined, QuestionCircleOutlined, AppstoreOutlined } from '@ant-design/icons';
import { QRCodeSVG } from 'qrcode.react';
import { mockCurrentEmployee, mockPromotionStats } from '../utils/mockData';
import { getLocalStorage, removeLocalStorage, copyToClipboard, downloadImage } from '../utils/helpers';
import type { Employee, PromotionStats } from '../types';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [stats, setStats] = useState<PromotionStats | null>(null);

  useEffect(() => {
    // 检查是否已绑定
    const isBound = getLocalStorage<boolean>('isBound', false);
    if (!isBound) {
      navigate('/bind');
      return;
    }

    // 加载员工信息
    const savedEmployee = getLocalStorage<Employee>('employee');
    if (savedEmployee) {
      setEmployee(savedEmployee);
    } else {
      setEmployee(mockCurrentEmployee);
    }

    // 加载统计数据
    setStats(mockPromotionStats);
  }, [navigate]);

  const handleLogout = () => {
    if (window.confirm('确定要退出登录吗？')) {
      removeLocalStorage('employee');
      removeLocalStorage('isBound');
      navigate('/bind');
    }
  };

  const handleShare = async () => {
    if (!employee) return;

    const shareText = `我是${employee.name}，邀请您关注我们的公众号！\n工号：${employee.employeeId}`;
    const success = await copyToClipboard(shareText);

    if (success) {
      alert('推广文案已复制到剪贴板，可以分享给朋友了！');
    } else {
      alert('复制失败，请手动复制');
    }
  };

  const handleDownloadQRCode = () => {
    if (!employee) return;

    const svgElement = document.getElementById('qrcode');
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        const pngUrl = canvas.toDataURL('image/png');
        downloadImage(pngUrl, `推广码-${employee.name}.png`);
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    }
  };

  if (!employee || !stats) {
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
        <div className="navbar-left"></div>
        <div className="navbar-title">我的推广码</div>
        <div className="navbar-right" onClick={handleLogout}>
          <LogoutOutlined />
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="stats-container">
        <div className="stats-header">
          <div className="employee-info">
            <div className="employee-name">{employee.name}</div>
            <div className="employee-detail">{employee.department} | {employee.employeeId}</div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{stats.scanCount}</div>
            <div className="stat-label">累计扫码</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-value">{stats.followCount}</div>
            <div className="stat-label">累计关注</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-value">{(stats.followCount / stats.scanCount * 100).toFixed(1)}%</div>
            <div className="stat-label">转化率</div>
          </div>
        </div>

        <div className="stats-footer">
          <div className="mini-stat">
            <span className="mini-stat-label">今日扫码</span>
            <span className="mini-stat-value">{stats.todayScanCount}</span>
          </div>
          <div className="mini-stat">
            <span className="mini-stat-label">今日关注</span>
            <span className="mini-stat-value">{stats.todayFollowCount}</span>
          </div>
          <div className="mini-stat">
            <span className="mini-stat-label">本月扫码</span>
            <span className="mini-stat-value">{stats.monthScanCount}</span>
          </div>
          <div className="mini-stat">
            <span className="mini-stat-label">本月关注</span>
            <span className="mini-stat-value">{stats.monthFollowCount}</span>
          </div>
        </div>
      </div>

      {/* 二维码卡片 */}
      <div className="qrcode-card">
        <h3 className="card-title">我的专属推广码</h3>
        <div className="qrcode-wrapper">
          <div className="qrcode-box">
            <QRCodeSVG
              id="qrcode"
              value={employee.employeeId}
              size={240}
              level="H"
              includeMargin={true}
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>
          <p className="qrcode-tip">扫描二维码即可关注公众号</p>
        </div>

        <div className="action-buttons">
          <button className="action-btn primary" onClick={handleShare}>
            <ShareAltOutlined />
            复制推广文案
          </button>
          <button className="action-btn secondary" onClick={handleDownloadQRCode}>
            <DownloadOutlined />
            保存二维码
          </button>
        </div>
      </div>

      {/* 功能入口 */}
      <div className="menu-grid">
        <div className="menu-item" onClick={() => navigate('/multi-account')} style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none'
        }}>
          <AppstoreOutlined className="menu-icon-custom" style={{ color: 'white' }} />
          <div className="menu-title" style={{ color: 'white' }}>多公众号管理</div>
          <div className="menu-desc" style={{ color: 'rgba(255,255,255,0.8)' }}>新功能体验</div>
        </div>
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
        <div className="menu-item" onClick={() => navigate('/profile')}>
          <UserOutlined className="menu-icon-custom" />
          <div className="menu-title">个人中心</div>
          <div className="menu-desc">我的信息</div>
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
        <p>一起为组织发展贡献力量！</p>
      </div>
    </div>
  );
};

export default HomePage;
