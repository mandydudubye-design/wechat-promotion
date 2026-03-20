import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { mockAllEmployees } from '../utils/mockData';
import { setLocalStorage } from '../utils/helpers';
import type { BindRequest } from '../types';
import './BindPage.css';

const BindPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState<BindRequest>({
    employeeId: '',
    name: '',
    department: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof BindRequest, string>>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof BindRequest, string>> = {};

    if (!formData.employeeId.trim()) {
      newErrors.employeeId = '请输入工号';
    }

    if (!formData.name.trim()) {
      newErrors.name = '请输入姓名';
    }

    if (!formData.department.trim()) {
      newErrors.department = '请输入部门';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = '请输入手机号';
    } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = '请输入正确的手机号';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('请检查表单信息', 'error');
      return;
    }

    setLoading(true);

    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 验证员工信息（模拟）
    const employee = mockAllEmployees.find(
      emp => emp.employeeId === formData.employeeId &&
             emp.name === formData.name &&
             emp.department === formData.department &&
             emp.phone === formData.phone
    );

    if (employee) {
      // 保存绑定信息
      setLocalStorage('employee', employee);
      setLocalStorage('isBound', true);

      showToast('绑定成功！', 'success');
      
      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        navigate('/');
      }, 800);
    } else {
      setErrors({
        employeeId: '员工信息不匹配，请检查后重试',
      });
      showToast('验证失败，请检查信息', 'error');
    }

    setLoading(false);
  };

  const handleInputChange = (field: keyof BindRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除该字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="bind-page">
      {/* 顶部装饰 */}
      <div className="bind-header-decoration">
        <div className="bind-header-circle"></div>
        <div className="bind-header-circle"></div>
      </div>

      {/* Logo和标题 */}
      <div className="bind-header">
        <div className="bind-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
          </svg>
        </div>
        <h1 className="bind-title">员工推广系统</h1>
        <p className="bind-subtitle">绑定您的账号，开启推广之旅</p>
      </div>

      {/* 绑定表单卡片 */}
      <form className="bind-form-card" onSubmit={handleSubmit}>
        <div className="form-card-header">
          <h2>身份验证</h2>
          <p>请填写您的员工信息进行验证</p>
        </div>

        <div className="form-content">
          <div className={`form-item ${errors.employeeId ? 'error' : ''}`}>
            <label className="form-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              工号
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="请输入工号"
              value={formData.employeeId}
              onChange={(e) => handleInputChange('employeeId', e.target.value)}
              disabled={loading}
            />
            {errors.employeeId && <span className="form-error">{errors.employeeId}</span>}
          </div>

          <div className={`form-item ${errors.name ? 'error' : ''}`}>
            <label className="form-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              姓名
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="请输入姓名"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={loading}
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className={`form-item ${errors.department ? 'error' : ''}`}>
            <label className="form-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              部门
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="请输入部门"
              value={formData.department}
              onChange={(e) => handleInputChange('department', e.target.value)}
              disabled={loading}
            />
            {errors.department && <span className="form-error">{errors.department}</span>}
          </div>

          <div className={`form-item ${errors.phone ? 'error' : ''}`}>
            <label className="form-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                <line x1="12" y1="18" x2="12.01" y2="18"></line>
              </svg>
              手机号
            </label>
            <input
              type="tel"
              className="form-input"
              placeholder="请输入手机号"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              disabled={loading}
              maxLength={11}
            />
            {errors.phone && <span className="form-error">{errors.phone}</span>}
          </div>
        </div>

        <button
          type="submit"
          className={`submit-btn ${loading ? 'loading' : ''}`}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="btn-spinner"></span>
              验证中...
            </>
          ) : (
            '确认绑定'
          )}
        </button>
      </form>

      {/* 底部提示 */}
      <div className="bind-tips">
        <div className="tips-icon">💡</div>
        <div className="tips-content">
          <p className="tips-title">温馨提示</p>
          <ul className="tips-list">
            <li>请确保输入的信息与系统登记一致</li>
            <li>绑定后可查看专属推广码和推广数据</li>
            <li>如有疑问，请联系管理员</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BindPage;