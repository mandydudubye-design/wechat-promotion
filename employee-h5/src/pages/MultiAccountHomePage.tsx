// 多账号支持首页示例

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  TrophyOutlined,
  BarChartOutlined,
  FileTextOutlined,
  UserOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import AccountSelectorSimple from '../components/AccountSelectorSimple';
import AccountStatsCard from '../components/AccountStatsCard';
import { getEmployeeAccounts, getDefaultAccount, getEmployeeAccountStats } from '../utils/mockAccountData';
import type { Account } from '../types/account';
import './MultiAccountHomePage.css';

const MultiAccountHomePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [stats, setStats] = useState<any>(null);

  // 模拟当前员工
  const employee = {
    employeeId: 'EMP001',
    name: '张三',
    phone: '13800138000',
  };

  useEffect(() => {
    // 获取员工可推广的公众号列表
    const enabledAccounts = getEmployeeAccounts(employee.employeeId);
    const defaultAccount = getDefaultAccount(employee.employeeId);

    setAccounts(enabledAccounts);
    setCurrentAccount(defaultAccount || enabledAccounts[0] || null);
  }, [employee.employeeId]);

  useEffect(() => {
    if (currentAccount) {
      // 获取当前公众号的统计数据
      const accountStats = getEmployeeAccountStats(employee.employeeId);
      if (accountStats && accountStats.accountStats[currentAccount.id]) {
        setStats(accountStats.accountStats[currentAccount.id]);
      }
    }
  }, [currentAccount, employee.employeeId]);

  const handleAccountChange = (account: Account) => {
    setCurrentAccount(account);
  };

  const handleViewAllStats = () => {
    navigate('/multi-account-stats');
  };

  if (!currentAccount || !stats) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="multi-account-home-page">
      {/* 公众号选择器 */}
      <AccountSelectorSimple
        accounts={accounts}
        currentAccount={currentAccount}
        onAccountChange={handleAccountChange}
      />

      {/* 当前公众号统计卡片 */}
      <AccountStatsCard
        stats={stats}
        onClick={handleViewAllStats}
        showRank={true}
      />

      {/* 查看所有公众号统计 */}
      <div className="all-accounts-stats" onClick={handleViewAllStats}>
        <div className="all-accounts-stats-header">
          <BarChartOutlined />
          <span>查看所有公众号统计</span>
        </div>
        <div className="all-accounts-stats-desc">
          共 {accounts.length} 个公众号，总扫码 {stats.scanCount} 次
        </div>
      </div>

      {/* 当前公众号二维码 */}
      <div className="qrcode-card">
        <h3 className="card-title">
          {currentAccount.accountName} - 专属推广码
        </h3>
        <div className="qrcode-wrapper">
          <div className="qrcode-box">
            <QRCodeSVG
              value={currentAccount.id}
              size={240}
              level="H"
              includeMargin={true}
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>
          <p className="qrcode-tip">扫描二维码即可关注 {currentAccount.accountName}</p>
        </div>

        <div className="action-buttons">
          <button className="action-btn primary">
            保存二维码
          </button>
          <button className="action-btn secondary">
            复制链接
          </button>
        </div>
      </div>

      {/* 功能菜单 */}
      <div className="menu-section">
        <div className="menu-item" onClick={() => navigate('/records')}>
          <FileTextOutlined className="menu-icon-custom" />
          <div className="menu-item-content">
            <div className="menu-title">推广记录</div>
            <div className="menu-desc">查看 {currentAccount.accountName} 推广详情</div>
          </div>
        </div>

        <div className="menu-item" onClick={() => navigate('/ranking')}>
          <TrophyOutlined className="menu-icon-custom" />
          <div className="menu-item-content">
            <div className="menu-title">排行榜</div>
            <div className="menu-desc">查看 {currentAccount.accountName} 排名</div>
          </div>
        </div>

        <div className="menu-item" onClick={() => navigate('/profile')}>
          <UserOutlined className="menu-icon-custom" />
          <div className="menu-item-content">
            <div className="menu-title">个人中心</div>
            <div className="menu-desc">管理我的公众号</div>
          </div>
        </div>

        <div className="menu-item" onClick={() => navigate('/help')}>
          <QuestionCircleOutlined className="menu-icon-custom" />
          <div className="menu-item-content">
            <div className="menu-title">帮助中心</div>
            <div className="menu-desc">使用说明与常见问题</div>
          </div>
        </div>
      </div>

      <div className="footer-tip">
        切换公众号可查看不同数据统计
      </div>
    </div>
  );
};

export default MultiAccountHomePage;
