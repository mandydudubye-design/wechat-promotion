import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  EditOutlined, LogoutOutlined, SaveOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { getLocalStorage, setLocalStorage, removeLocalStorage } from '../utils/helpers';
import type { Employee } from '../types';
import './ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    department: '',
    phone: ''
  });

  useEffect(() => {
    const savedEmployee = getLocalStorage<Employee>('employee');
    if (savedEmployee) {
      setEmployee(savedEmployee);
      setFormData({
        employeeId: savedEmployee.employeeId,
        name: savedEmployee.name,
        department: savedEmployee.department,
        phone: savedEmployee.phone
      });
    }
  }, []);

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('请输入姓名');
      return;
    }
    if (!formData.phone.trim()) {
      alert('请输入手机号');
      return;
    }
    
    const updatedEmployee = {
      ...employee!,
      employeeId: formData.employeeId,
      name: formData.name,
      department: formData.department,
      phone: formData.phone
    };
    
    setEmployee(updatedEmployee);
    setLocalStorage('employee', updatedEmployee);
    setIsEditing(false);
    alert('保存成功');
  };

  const handleCancel = () => {
    setFormData({
      employeeId: employee?.employeeId || '',
      name: employee?.name || '',
      department: employee?.department || '',
      phone: employee?.phone || ''
    });
    setIsEditing(false);
  };

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

  return (
    <div className="profile-page">
      {/* 页面标题 */}
      <div className="page-header">
        <h2>个人信息</h2>
        <p>管理您的个人资料</p>
        {!isEditing && (
          <button className="edit-btn" onClick={() => setIsEditing(true)}>
            <EditOutlined /> 编辑
          </button>
        )}
      </div>

      {/* 个人信息表单 */}
      <div className="info-card">
        <div className="info-list">
          <div className="info-item">
            <label>工号</label>
            {isEditing ? (
              <input 
                type="text" 
                value={formData.employeeId}
                onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                placeholder="请输入工号"
              />
            ) : (
              <span>{employee.employeeId || '-'}</span>
            )}
          </div>
          <div className="info-item">
            <label>姓名</label>
            {isEditing ? (
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="请输入姓名"
              />
            ) : (
              <span>{employee.name || '-'}</span>
            )}
          </div>
          <div className="info-item">
            <label>部门</label>
            {isEditing ? (
              <input 
                type="text" 
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                placeholder="请输入部门"
              />
            ) : (
              <span>{employee.department || '-'}</span>
            )}
          </div>
          <div className="info-item">
            <label>手机号</label>
            {isEditing ? (
              <input 
                type="tel" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="请输入手机号"
              />
            ) : (
              <span>{employee.phone || '-'}</span>
            )}
          </div>
        </div>
      </div>

      {/* 编辑状态按钮 */}
      {isEditing && (
        <div className="edit-actions">
          <button className="cancel-btn" onClick={handleCancel}>
            <CloseOutlined /> 取消
          </button>
          <button className="save-btn" onClick={handleSave}>
            <SaveOutlined /> 保存
          </button>
        </div>
      )}

      {/* 退出登录 */}
      <div className="logout-section">
        <button className="logout-btn" onClick={handleLogout}>
          <LogoutOutlined /> 退出登录
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;