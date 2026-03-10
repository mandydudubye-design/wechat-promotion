import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, RightOutlined, LogoutOutlined, UserOutlined, PhoneOutlined, BarChartOutlined, TrophyOutlined, QuestionCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { getLocalStorage, removeLocalStorage } from '../utils/helpers';
import type { Employee } from '../types';
import './ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);

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

  if (!employee) {
    return (
      <div className="loading-page">
        <div className="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  const menuItems = [
    {
      icon: <UserOutlined />,
      title: '个人信息',
      description: '工号、姓名、部门',
      onClick: () => {},
    },
    {
      icon: <PhoneOutlined />,
      title: '修改手机号',
      description: '更新联系方式',
      onClick: () => {
        alert('功能开发中...');
      },
    },
    {
      icon: <BarChartOutlined />,
      title: '推广数据',
      description: '查看详细统计',
      onClick: () => navigate('/records'),
    },
    {
      icon: <TrophyOutlined />,
      title: '我的排名',
      description: '查看排行榜',
      onClick: () => navigate('/ranking'),
    },
  ];

  const otherItems = [
    {
      icon: <QuestionCircleOutlined />,
      title: '帮助说明',
      description: '使用指南',
      onClick: () => navigate('/help'),
    },
    {
      icon: <SettingOutlined />,
      title: '设置',
      description: '系统设置',
      onClick: () => {
        alert('功能开发中...');
      },
    },
  ];

  return (
    <div className="profile-page">
      {/* 导航栏 */}
      <div className="navbar">
        <div className="navbar-back" onClick={() => navigate(-1)}>
          <ArrowLeftOutlined />
        </div>
        <div className="navbar-title">个人中心</div>
        <div className="navbar-action"></div>
      </div>

      {/* 用户信息卡片 */}
      <div className="user-card">
        <div className="user-avatar">
          <span className="avatar-text">
            {employee.name.charAt(0)}
          </span>
        </div>
        <div className="user-info">
          <div className="user-name">{employee.name}</div>
          <div className="user-detail">
            {employee.department} | {employee.employeeId}
          </div>
        </div>
        <div className="user-status">
          <span className="status-badge">已绑定</span>
        </div>
      </div>

      {/* 功能菜单 */}
      <div className="menu-section">
        <div className="menu-title">我的服务</div>
        <div className="menu-list">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className="menu-item"
              onClick={item.onClick}
            >
              <div className="menu-left">
                <span className="menu-icon">{item.icon}</span>
                <div className="menu-content">
                  <div className="menu-title-text">{item.title}</div>
                  <div className="menu-description">{item.description}</div>
                </div>
              </div>
              <RightOutlined className="menu-arrow" />
            </div>
          ))}
        </div>
      </div>

      {/* 其他功能 */}
      <div className="menu-section">
        <div className="menu-title">其他</div>
        <div className="menu-list">
          {otherItems.map((item, index) => (
            <div
              key={index}
              className="menu-item"
              onClick={item.onClick}
            >
              <div className="menu-left">
                <span className="menu-icon">{item.icon}</span>
                <div className="menu-content">
                  <div className="menu-title-text">{item.title}</div>
                  <div className="menu-description">{item.description}</div>
                </div>
              </div>
              <RightOutlined className="menu-arrow" />
            </div>
          ))}
        </div>
      </div>

      {/* 退出登录 */}
      <div className="logout-section">
        <button className="logout-btn" onClick={handleLogout}>
          <LogoutOutlined />
          退出登录
        </button>
      </div>

      {/* 版本信息 */}
      <div className="version-info">
        <p>公众号推广追踪系统</p>
        <p>版本 1.0.0</p>
      </div>
    </div>
  );
};

export default ProfilePage;
