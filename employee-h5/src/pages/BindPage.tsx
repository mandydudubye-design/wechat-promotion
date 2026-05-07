import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { mockAllEmployees } from '../utils/mockData';
import { setLocalStorage } from '../utils/helpers';
import type { BindRequest } from '../types';
import './BindPage.css';

// 动态取后端地址（和当前页面同一局域网）
const API_BASE = `${window.location.protocol}//${window.location.hostname}:3000/api`;

const BindPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  // 从 URL 参数中读取扫码场景（尝试多个来源）
  const queryParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
  const scene = searchParams.get('scene') || queryParams.get('scene') || hashParams.get('scene') || '';
  const bindType = searchParams.get('type') || queryParams.get('type') || hashParams.get('type') || 'universal';

  const [formData, setFormData] = useState<BindRequest>({
    employeeId: '',
    name: '',
    department: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof BindRequest, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof BindRequest, boolean>>>({});
  const [loading, setLoading] = useState(false);
  const [bindSuccess, setBindSuccess] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ name?: string; department?: string } | null>(null);

  // 专属绑定码：页面加载时自动识别员工并直接完成
  const handlePersonalBind = async () => {
    setLoading(true);
    try {
      const match = scene.match(/bind_personal_(\w+)_/);
      const employeeId = match ? match[1] : null;

      if (!employeeId) {
        showToast('绑定码格式有误，请重新扫码', 'error');
        return;
      }

      const employee = mockAllEmployees.find(e => e.employeeId === employeeId);
      if (employee) {
        setLocalStorage('employee', employee);
        setLocalStorage('isBound', true);
        setSuccessInfo({ name: employee.name, department: employee.department });
        setBindSuccess(true);
        setTimeout(() => navigate('/'), 2000);
      } else {
        const res = await fetch(`${API_BASE}/employee-binding/bind/personal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sceneStr: scene, openid: `mock_${Date.now()}` }),
        });
        const result = await res.json();
        if (result.code === 200) {
          setSuccessInfo({ name: result.data?.name });
          setBindSuccess(true);
          setTimeout(() => navigate('/'), 2000);
        } else {
          showToast(result.message || '绑定失败，请重新扫码', 'error');
        }
      }
    } catch {
      showToast('绑定码无效，请重新扫码', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (scene && bindType === 'personal') {
      handlePersonalBind();
    }
  }, []);

  const validateField = (field: keyof BindRequest, value: string): string | undefined => {
    if (!value.trim()) {
      switch (field) {
        case 'employeeId': return '请输入工号';
        case 'name': return '请输入姓名';
        case 'department': return '请输入部门';
        case 'phone': return '请输入手机号';
      }
    }

    if (field === 'phone' && value.trim()) {
      if (!/^1[3-9]\d{9}$/.test(value)) {
        return '请输入正确的手机号';
      }
    }

    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof BindRequest, string>> = {};

    Object.keys(formData).forEach(key => {
      const field = key as keyof BindRequest;
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // 添加 shake 动画
      formRef.current?.classList.add('shake');
      setTimeout(() => formRef.current?.classList.remove('shake'), 500);
      showToast('请检查表单信息', 'error');
      return;
    }

    setLoading(true);

    try {
      // 有 scene 参数或有码模式，无 scene 参数则直接绑定
      const res = await fetch(`${API_BASE}/employee-binding/bind/universal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sceneStr: scene || undefined,
          openid: `mock_${Date.now()}`,
          employeeNo: formData.employeeId,
          name: formData.name,
          department: formData.department,
          phone: formData.phone,
        }),
      });
      const result = await res.json();
      if (result.code === 200) {
        setLocalStorage('employee', { employeeId: formData.employeeId, ...formData });
        setLocalStorage('isBound', true);
        setSuccessInfo({ name: formData.name, department: formData.department });
        setBindSuccess(true);
        showToast('绑定成功！', 'success');
        setTimeout(() => navigate('/'), 1500);
        return;
      } else {
        setErrors({ employeeId: result.message || '员工信息不匹配，请检查后重试' });
        showToast(result.message || '验证失败，请检查信息', 'error');
        setLoading(false);
        return;
      }
    } catch {
      showToast('网络错误，请检查连接后重试', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof BindRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 实时验证
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleBlur = (field: keyof BindRequest, value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  // 绑定成功页
  if (bindSuccess) {
    return (
      <div className="bind-page">
        <div className="bind-header-decoration">
          <div className="bind-header-circle"></div>
          <div className="bind-header-circle"></div>
        </div>
        <div className="success-container">
          <div className="success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M20 6L9 17l-5-5"></path>
            </svg>
          </div>
          <h2 className="success-title">绑定成功</h2>
          {successInfo?.name && <p className="success-subtitle">欢迎，{successInfo.name}</p>}
          {successInfo?.department && <p className="success-department">{successInfo.department}</p>}
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p className="success-hint">即将跳转到首页...</p>
        </div>
      </div>
    );
  }

  // 专属码加载中
  if (scene && bindType === 'personal') {
    return (
      <div className="bind-page">
        <div className="bind-header-decoration">
          <div className="bind-header-circle"></div>
          <div className="bind-header-circle"></div>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">正在识别身份，请稍候...</p>
        </div>
      </div>
    );
  }

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
      <form className="bind-form-card" onSubmit={handleSubmit} ref={formRef} noValidate>
        <div className="form-card-header">
          <h2>身份验证</h2>
          <p>请填写您的员工信息进行验证</p>
        </div>

        <div className="form-content">
          <div className={`form-item ${errors.employeeId ? 'error' : ''} ${touched.employeeId ? 'touched' : ''}`}>
            <label className="form-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              工号
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                className="form-input"
                placeholder="请输入工号"
                value={formData.employeeId}
                onChange={e => handleInputChange('employeeId', e.target.value)}
                onBlur={e => handleBlur('employeeId', e.target.value)}
                disabled={loading}
                autoComplete="off"
              />
            </div>
            {errors.employeeId && <span className="form-error">{errors.employeeId}</span>}
          </div>

          <div className={`form-item ${errors.name ? 'error' : ''} ${touched.name ? 'touched' : ''}`}>
            <label className="form-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              姓名
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                className="form-input"
                placeholder="请输入姓名"
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
                onBlur={e => handleBlur('name', e.target.value)}
                disabled={loading}
                autoComplete="off"
              />
            </div>
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className={`form-item ${errors.department ? 'error' : ''} ${touched.department ? 'touched' : ''}`}>
            <label className="form-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              部门
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                className="form-input"
                placeholder="请输入部门"
                value={formData.department}
                onChange={e => handleInputChange('department', e.target.value)}
                onBlur={e => handleBlur('department', e.target.value)}
                disabled={loading}
                autoComplete="off"
              />
            </div>
            {errors.department && <span className="form-error">{errors.department}</span>}
          </div>

          <div className={`form-item ${errors.phone ? 'error' : ''} ${touched.phone ? 'touched' : ''}`}>
            <label className="form-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                <line x1="12" y1="18" x2="12.01" y2="18"></line>
              </svg>
              手机号
            </label>
            <div className="input-wrapper">
              <input
                type="tel"
                className="form-input"
                placeholder="请输入手机号"
                value={formData.phone}
                onChange={e => handleInputChange('phone', e.target.value)}
                onBlur={e => handleBlur('phone', e.target.value)}
                disabled={loading}
                maxLength={11}
                autoComplete="tel"
              />
            </div>
            {errors.phone && <span className="form-error">{errors.phone}</span>}
          </div>
        </div>

        <button type="submit" className={`submit-btn ${loading ? 'loading' : ''}`} disabled={loading}>
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

      {/* 开发模式：长按显示调试信息 */}
      {process.env.NODE_ENV === 'development' && (
        <div 
          className="debug-trigger"
          onContextMenu={e => {
            e.preventDefault();
            console.log('Scene:', scene);
            console.log('Bind Type:', bindType);
            console.log('API_BASE:', API_BASE);
            console.log('URL:', window.location.href);
          }}
        />
      )}
    </div>
  );
};

export default BindPage;
