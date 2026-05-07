// API 基础配置
const BASE_URL = 'http://localhost:3000/api';

// 获取 token
const getToken = () => localStorage.getItem('token') || '';

// 通用请求函数
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, defaultOptions);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '请求失败' }));
    throw new Error(error.message || '请求失败');
  }

  return response.json();
}

// API 方法
export const api = {
  // GET 请求
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),

  // POST 请求
  post: <T>(endpoint: string, data?: any) =>
    request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // PUT 请求
  put: <T>(endpoint: string, data?: any) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // DELETE 请求
  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),

  // 上传文件请求（使用 FormData）
  upload: <T>(endpoint: string, file: File) => {
    const url = `${BASE_URL}${endpoint}`;
    const formData = new FormData();
    formData.append('file', file);

    return fetch(url, {
      method: 'POST',
      // 不设置 Content-Type，让浏览器自动设置（FormData 需要）
      // 也不需要 Authorization header，因为上传接口已临时开放
      body: formData,
    }).then((response) => {
      if (!response.ok) {
        return response.json().then((error) => {
          throw new Error(error.message || '上传失败');
        });
      }
      return response.json();
    });
  },
};

// 类型定义
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  timestamp: number;
  data: T;
}

// 公众号相关 API
export const accountApi = {
  // 获取公众号列表
  getList: (params?: { status?: number }) => {
    const query = params?.status !== undefined ? `?status=${params.status}` : '';
    return api.get<ApiResponse<any[]>>(`/accounts${query}`);
  },

  // 获取公众号详情
  getDetail: (id: string) =>
    api.get<ApiResponse<any>>(`/accounts/${id}`),

  // 添加公众号
  add: (data: any) => api.post<ApiResponse>('/accounts', data),

  // 更新公众号
  update: (id: string, data: any) =>
    api.put<ApiResponse>(`/accounts/${id}`, data),

  // 启用公众号
  enable: (id: string) => api.put<ApiResponse>(`/accounts/${id}/enable`),

  // 停用公众号
  disable: (id: string) => api.put<ApiResponse>(`/accounts/${id}/disable`),

  // 删除公众号
  delete: (id: string) => api.delete<ApiResponse>(`/accounts/${id}`),
};

// 海报模板相关 API
export const posterTemplateApi = {
  // 获取海报模板列表
  getList: (params?: { status?: string; account_id?: number; keyword?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.account_id) query.append('account_id', params.account_id.toString());
    if (params?.keyword) query.append('keyword', params.keyword);
    return api.get<ApiResponse<any[]>>(`/poster-templates?${query.toString()}`);
  },

  // 获取海报模板详情
  getDetail: (id: string) =>
    api.get<ApiResponse<any>>(`/poster-templates/${id}`),

  // 添加海报模板
  add: (data: any) => api.post<ApiResponse>('/poster-templates', data),

  // 更新海报模板
  update: (id: string, data: any) =>
    api.put<ApiResponse>(`/poster-templates/${id}`, data),

  // 删除海报模板
  delete: (id: string) => api.delete<ApiResponse>(`/poster-templates/${id}`),
};

// 朋友圈文案相关 API
export const circleTextApi = {
  // 获取文案列表
  getList: (params?: { status?: string; category?: string; keyword?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.category) query.append('category', params.category);
    if (params?.keyword) query.append('keyword', params.keyword);
    return api.get<ApiResponse<any[]>>(`/circle-texts?${query.toString()}`);
  },

  // 获取文案详情
  getDetail: (id: string) =>
    api.get<ApiResponse<any>>(`/circle-texts/${id}`),

  // 添加文案
  add: (data: any) => api.post<ApiResponse>('/circle-texts', data),

  // 更新文案
  update: (id: string, data: any) =>
    api.put<ApiResponse>(`/circle-texts/${id}`, data),

  // 删除文案
  delete: (id: string) => api.delete<ApiResponse>(`/circle-texts/${id}`),
};

// 推广套装相关 API
export const promotionKitApi = {
  // 获取推广套装列表
  getList: (params?: { account_id?: number; keyword?: string }) => {
    const query = new URLSearchParams();
    if (params?.account_id) query.append('account_id', params.account_id.toString());
    if (params?.keyword) query.append('keyword', params.keyword);
    return api.get<ApiResponse<any[]>>(`/promotion-kits?${query.toString()}`);
  },

  // 获取推广套装详情
  getDetail: (id: string) =>
    api.get<ApiResponse<any>>(`/promotion-kits/${id}`),

  // 添加推广套装
  add: (data: any) => api.post<ApiResponse>('/promotion-kits', data),

  // 更新推广套装
  update: (id: string, data: any) =>
    api.put<ApiResponse>(`/promotion-kits/${id}`, data),

  // 设为默认套装
  setDefault: (id: string) =>
    api.put<ApiResponse>(`/promotion-kits/${id}/set-default`),

  // 删除推广套装
  delete: (id: string) => api.delete<ApiResponse>(`/promotion-kits/${id}`),
};

// 员工相关 API
export const employeeApi = {
  // 获取员工列表
  getList: (params?: { bind_status?: number; department?: string; keyword?: string }) => {
    const query = new URLSearchParams();
    if (params?.bind_status !== undefined) query.append('bind_status', params.bind_status.toString());
    if (params?.department) query.append('department', params.department);
    if (params?.keyword) query.append('keyword', params.keyword);
    return api.get<ApiResponse<any[]>>(`/employees?${query.toString()}`);
  },

  // 获取员工详情
  getDetail: (id: string) =>
    api.get<ApiResponse<any>>(`/employees/${id}`),

  // 添加员工
  add: (data: any) => api.post<ApiResponse>('/employees', data),

  // 更新员工
  update: (id: string, data: any) =>
    api.put<ApiResponse>(`/employees/${id}`, data),

  // 删除员工
  delete: (id: string) => api.delete<ApiResponse>(`/employees/${id}`),
};

// 推广数据相关 API
export const promotionDataApi = {
  // 获取推广记录列表
  getRecords: (params?: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    employeeId?: string;
    accountId?: number;
    startDate?: string;
    endDate?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.pageSize) query.append('pageSize', params.pageSize.toString());
    if (params?.keyword) query.append('keyword', params.keyword);
    if (params?.employeeId) query.append('employeeId', params.employeeId);
    if (params?.accountId) query.append('accountId', params.accountId.toString());
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    return api.get<ApiResponse<any>>(`/promotion/records?${query.toString()}`);
  },

  // 获取推广统计数据
  getStats: (params?: {
    employeeId?: string;
    accountId?: number;
    startDate?: string;
    endDate?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.employeeId) query.append('employeeId', params.employeeId);
    if (params?.accountId) query.append('accountId', params.accountId.toString());
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    return api.get<ApiResponse<any>>(`/promotion/stats?${query.toString()}`);
  },
};

// 概览页相关 API
export const dashboardApi = {
  // 获取概览统计
  getStats: () => api.get<ApiResponse<any>>('/dashboard/stats'),

  // 获取公众号详情列表
  getAccounts: () => api.get<ApiResponse<any[]>>('/dashboard/accounts'),

  // 获取推广排行榜
  getRanking: (period?: 'day' | 'week' | 'month') =>
    api.get<ApiResponse<any[]>>(`/dashboard/ranking?period=${period || 'week'}`),

  // 获取员工绑定状态
  getEmployeeBindStatus: () =>
    api.get<ApiResponse<any>>('/dashboard/employee-bind-status'),
};

// 认证相关 API
export const authApi = {
  // 登录
  login: (username: string, password: string) =>
    api.post<ApiResponse<{ token: string; user: any }>>('/auth/login', {
      username,
      password,
    }),

  // 获取当前用户信息
  getMe: () => api.get<ApiResponse<any>>('/auth/me'),

  // 登出
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// 文件上传相关 API
export const uploadApi = {
  // 上传图片
  uploadImage: (file: File) =>
    api.upload<ApiResponse<{ url: string; filename: string; originalname: string; size: number; mimetype: string }>>(
      '/upload/image',
      file
    ),
};
