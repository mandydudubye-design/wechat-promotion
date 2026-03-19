import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserOutlined, PhoneOutlined, LockOutlined, TeamOutlined } from '@ant-design/icons';
import { mockAllEmployees } from '../utils/mockData';
import { setLocalStorage } from '../utils/helpers';
import type { BindRequest } from '../types';
import './BindPage.css';

const BindPage = () => {
  const navigate = useNavigate();
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
      return;
    }

    setLoading(true);

    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

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

      // 跳转到首页
      navigate('/');
    } else {
      setErrors({
        employeeId: '员工信息不正确，请检查后重试',
      });
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
      <div className="bind-header">
        <div className="bind-logo">
          <LockOutlined />
        </div>
        <h1 className="bind-title">员工账号绑定</h1>
        <p className="bind-subtitle">请输入您的工号、姓名、部门和手机号进行验证</p>
      </div>

      <form className="bind-form" onSubmit={handleSubmit}>
        <div className={`form-item ${errors.employeeId ? 'form-item-error' : ''}`}>
          <label className="form-label">
            <UserOutlined /> 工号
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

        <div className={`form-item ${errors.name ? 'form-item-error' : ''}`}>
          <label className="form-label">
            <UserOutlined /> 姓名
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

        <div className={`form-item ${errors.department ? 'form-item-error' : ''}`}>
          <label className="form-label">
            <TeamOutlined /> 部门
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

        <div className={`form-item ${errors.phone ? 'form-item-error' : ''}`}>
          <label className="form-label">
            <PhoneOutlined /> 手机号
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

        <button
          type="submit"
          className={`submit-btn ${loading ? 'loading' : ''}`}
          disabled={loading}
        >
          {loading ? '验证中...' : '确认绑定'}
        </button>
      </form>

      <div className="bind-tips">
        <p className="tips-title">温馨提示：</p>
        <ul className="tips-list">
          <li>请确保输入的信息与系统登记信息一致</li>
          <li>绑定后可查看您的专属推广码和推广数据</li>
          <li>如有疑问，请联系管理员</li>
        </ul>
      </div>
    </div>
  );
};

export default BindPage;
