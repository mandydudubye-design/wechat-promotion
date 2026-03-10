// 优化版多账号首页

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeftOutlined,
  BarChartOutlined,
  TrophyOutlined,
  FileTextOutlined,
  UserOutlined,
  QuestionCircleOutlined,
  SaveOutlined,
  CopyOutlined,
  RightOutlined,
} from '@ant-design/icons';
import AccountSelectorOptimized from '../components/AccountSelectorOptimized';
import AccountStatsCardOptimized from '../components/AccountStatsCardOptimized';
import { getEmployeeAccounts, getDefaultAccount, getEmployeeAccountStats } from '../utils/mockAccountData';
import { getLocalStorage, copyToClipboard } from '../utils/helpers';
import type { Account, AccountStats } from '../types/account';
import './MultiAccountHomePageOptimized.css';

const MultiAccountHomePageOptimized: React.FC = () => {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<any>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const [stats, setStats] = useState<AccountStats | null>(null);
  const [ranking, setRanking] = useState<number>(1);

  useEffect(() => {
    // 加载员工信息
    const savedEmployee = getLocalStorage<any>('employee');
    if (savedEmployee) {
      setEmployee(savedEmployee);
      
      // 获取员工可推广的公众号
      const enabledAccounts = getEmployeeAccounts(savedEmployee.employeeId);
      setAccounts(enabledAccounts);
      
      // 获取默认公众号
      const defaultAccount = getDefaultAccount(savedEmployee.employeeId);
      if (defaultAccount) {
        setCurrentAccount(defaultAccount);
        
        // 获取统计数据
        const allStats = getEmployeeAccountStats(savedEmployee.employeeId);
        if (allStats && allStats.accountStats[defaultAccount.id]) {
          const accountStats = allStats.accountStats[defaultAccount.id];
          setStats(accountStats);
        }
        
        // 计算排名（模拟）
        const mockRanking = Math.floor(Math.random() * 10) + 1;
        setRanking(mockRanking);
      }
    }
  }, []);

  const handleAccountChange = (account: Account) => {
    setCurrentAccount(account);
    
    // 更新统计数据
    if (employee) {
      const allStats = getEmployeeAccountStats(employee.employeeId);
      if (allStats && allStats.accountStats[account.id]) {
        const accountStats = allStats.accountStats[account.id];
        setStats(accountStats);
      }
      
      // 更新排名
      const newRanking = Math.floor(Math.random() * 10) + 1;
      setRanking(newRanking);
    }
  };

  const handleViewAllStats = () => {
    navigate('/multi-account-stats');
  };

  const handleCopyLink = async () => {
    const link = `https://example.com/promote?account=${currentAccount?.id}`;
    const success = await copyToClipboard(link);
    if (success) {
      // 使用自定义提示而不是alert
      console.log('推广链接已复制');
    }
  };

  const handleSaveQR = () => {
    const qrElement = document.getElementById('qr-code');
    if (qrElement) {
      // 将SVG转换为图片并下载
      const svgData = new XMLSerializer().serializeToString(qrElement);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const link = document.createElement('a');
        link.download = `qrcode-${currentAccount?.id}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    }
  };

  if (!currentAccount || !stats) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div className="multi-account-home-optimized">
      {/* 顶部导航栏 */}
      <div className="home-header">
        <button className="header-back" onClick={() => navigate('/')}>
          <ArrowLeftOutlined />
        </button>
        <h1 className="header-title">多公众号管理</h1>
        <div className="header-avatar">
          {employee?.name?.charAt(0) || 'U'}
        </div>
      </div>

      {/* 公众号选择器 */}
      <AccountSelectorOptimized
        accounts={accounts}
        currentAccount={currentAccount}
        onAccountChange={handleAccountChange}
      />

      {/* 统计卡片 */}
      <div className="stats-section">
        <AccountStatsCardOptimized
          stats={stats}
          ranking={ranking}
          onClick={handleViewAllStats}
        />
      </div>

      {/* 查看所有统计按钮 */}
      <div className="view-all-section">
        <button className="view-all-button" onClick={handleViewAllStats}>
          <BarChartOutlined />
          <span>查看所有公众号统计</span>
          <RightOutlined />
        </button>
      </div>

      {/* 二维码区域 */}
      <div className="qr-section">
        <div className="qr-card">
          <div className="qr-header">
            <h3>推广二维码</h3>
            <p className="qr-subtitle">{currentAccount.accountName}</p>
          </div>
          
          <div className="qr-code-wrapper">
            <div className="qr-code-container">
              <QRCodeSVG
                id="qr-code"
                value={`https://example.com/promote?account=${currentAccount.id}`}
                size={200}
                level="H"
                includeMargin={false}
              />
            </div>
          </div>
          
          <div className="qr-actions">
            <button className="qr-action-btn" onClick={handleCopyLink}>
              <CopyOutlined />
              <span>复制链接</span>
            </button>
            <button className="qr-action-btn primary" onClick={handleSaveQR}>
              <SaveOutlined />
              <span>保存二维码</span>
            </button>
          </div>
        </div>
      </div>

      {/* 功能菜单 */}
      <div className="menu-section">
        <div className="menu-title">快捷功能</div>
        <div className="menu-grid">
          <div className="menu-item" onClick={() => navigate('/ranking')}>
            <div className="menu-icon" style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' }}>
              <TrophyOutlined />
            </div>
            <div className="menu-item-title">推广榜单</div>
            <div className="menu-item-desc">查看排行</div>
          </div>
          
          <div className="menu-item" onClick={() => navigate('/records')}>
            <div className="menu-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
              <FileTextOutlined />
            </div>
            <div className="menu-item-title">推广记录</div>
            <div className="menu-item-desc">查看明细</div>
          </div>
          
          <div className="menu-item" onClick={() => navigate('/profile')}>
            <div className="menu-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <UserOutlined />
            </div>
            <div className="menu-item-title">个人中心</div>
            <div className="menu-item-desc">我的信息</div>
          </div>
          
          <div className="menu-item" onClick={() => navigate('/help')}>
            <div className="menu-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
              <QuestionCircleOutlined />
            </div>
            <div className="menu-item-title">帮助中心</div>
            <div className="menu-item-desc">使用指南</div>
          </div>
        </div>
      </div>

      {/* 底部安全区 */}
      <div className="safe-area-bottom"></div>
    </div>
  );
};

export default MultiAccountHomePageOptimized;
