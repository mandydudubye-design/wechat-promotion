import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import { getLocalStorage, setLocalStorage, removeLocalStorage } from '../utils/helpers';
import { mockCurrentEmployee } from '../utils/mockData';
import type { Employee } from '../types';
import './ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    employeeId: '',
    name: '',
    department: '',
    phone: '',
  });

  useEffect(() => {
    const savedEmployee = getLocalStorage<Employee>('employee');
    if (savedEmployee) {
      setEmployee(savedEmployee);
      setEditForm({
        employeeId: savedEmployee.employeeId,
        name: savedEmployee.name,
        department: savedEmployee.department,
        phone: savedEmployee.phone || '',
      });
    } else {
      setEmployee(mockCurrentEmployee);
      setEditForm({
        employeeId: mockCurrentEmployee.employeeId,
        name: mockCurrentEmployee.name,
        department: mockCurrentEmployee.department,
        phone: mockCurrentEmployee.phone || '',
      });
    }
  }, []);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    removeLocalStorage('employee');
    removeLocalStorage('isBound');
    showToast('已退出登录', 'info');
    setTimeout(() => {
      navigate('/bind');
    }, 500);
    setShowLogoutConfirm(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (employee) {
      setEditForm({
        employeeId: employee.employeeId,
        name: employee.name,
        department: employee.department,
        phone: employee.phone || '',
      });
    }
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    // 验证
    if (!editForm.employeeId.trim()) {
      showToast('请输入工号', 'error');
      return;
    }
    if (!editForm.name.trim()) {
      showToast('请输入姓名', 'error');
      return;
    }
    if (!editForm.department.trim()) {
      showToast('请输入部门', 'error');
      return;
    }
    if (editForm.phone && !/^1[3-9]\d{9}$/.test(editForm.phone)) {
      showToast('请输入正确的手机号', 'error');
      return;
    }

    // 保存
    const updatedEmployee: Employee = {
      ...employee!,
      employeeId: editForm.employeeId.trim(),
      name: editForm.name.trim(),
      department: editForm.department.trim(),
      phone: editForm.phone.trim(),
    };

    setEmployee(updatedEmployee);
    setLocalStorage('employee', updatedEmployee);
    setIsEditing(false);
    showToast('保存成功', 'success');
  };

  const handleInputChange = (field: string, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
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
    <div className="profile-page">
      {/* 顶部背景 */}
      <div className="profile-header">
        <div className="header-bg">
          {/* 返回按钮 */}
          <button className="back-btn" onClick={() => navigate('/')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
        </div>
        <div className="header-content">
          <div className="user-card">
            <div className="user-avatar">{employee.name.charAt(0)}</div>
            <div className="user-info">
              <h2 className="user-name">{employee.name}</h2>
              <p className="user-department">{employee.department}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 个人信息 */}
      <div className="info-section">
        <div className="section-header">
          <h3 className="section-title">个人信息</h3>
          {!isEditing && (
            <button className="edit-btn" onClick={handleEdit}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              编辑
            </button>
          )}
        </div>

        <div className="info-list">
          {/* 工号 */}
          <div className="info-item">
            <div className="info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <div className="info-content">
              <span className="info-label">工号</span>
              {isEditing ? (
                <input
                  type="text"
                  className="info-input"
                  value={editForm.employeeId}
                  onChange={(e) => handleInputChange('employeeId', e.target.value)}
                  placeholder="请输入工号"
                />
              ) : (
                <span className="info-value">{employee.employeeId}</span>
              )}
            </div>
          </div>

          {/* 姓名 */}
          <div className="info-item">
            <div className="info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className="info-content">
              <span className="info-label">姓名</span>
              {isEditing ? (
                <input
                  type="text"
                  className="info-input"
                  value={editForm.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="请输入姓名"
                />
              ) : (
                <span className="info-value">{employee.name}</span>
              )}
            </div>
          </div>

          {/* 部门 */}
          <div className="info-item">
            <div className="info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div className="info-content">
              <span className="info-label">部门</span>
              {isEditing ? (
                <input
                  type="text"
                  className="info-input"
                  value={editForm.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  placeholder="请输入部门"
                />
              ) : (
                <span className="info-value">{employee.department}</span>
              )}
            </div>
          </div>

          {/* 手机号 */}
          <div className="info-item">
            <div className="info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                <line x1="12" y1="18" x2="12.01" y2="18"></line>
              </svg>
            </div>
            <div className="info-content">
              <span className="info-label">手机号</span>
              {isEditing ? (
                <input
                  type="tel"
                  className="info-input"
                  value={editForm.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="请输入手机号"
                  maxLength={11}
                />
              ) : (
                <span className="info-value">
                  {employee.phone ? employee.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '未填写'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 编辑时的操作按钮 */}
        {isEditing && (
          <div className="edit-actions">
            <button className="cancel-btn" onClick={handleCancelEdit}>
              取消
            </button>
            <button className="save-btn" onClick={handleSaveEdit}>
              保存
            </button>
          </div>
        )}
      </div>

      {/* 功能菜单 */}
      <div className="menu-section">
        <div className="menu-item danger" onClick={handleLogout}>
          <div className="menu-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </div>
          <span className="menu-label">退出登录</span>
        </div>
      </div>

      {/* 版本信息 */}
      <div className="version-info">
        <p>版本 1.0.0</p>
        <p>© 2024 员工推广系统</p>
      </div>

      {/* 退出确认弹窗 */}
      <ConfirmDialog
        visible={showLogoutConfirm}
        title="退出登录"
        message="退出后需要重新绑定才能使用，确定要退出吗？"
        confirmText="退出"
        cancelText="取消"
        type="warning"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
};

export default ProfilePage;