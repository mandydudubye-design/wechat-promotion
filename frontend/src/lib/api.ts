// API 服务层 - 对接真正的后端

// 使用环境变量或默认值
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// 获取存储的 token
const getToken = () => localStorage.getItem('token');

// API 响应结构
interface ApiResponse<T> {
  code: number;
  message: string;
  timestamp: number;
  data: T;
}

// 通用请求方法
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data: ApiResponse<T> = await response.json();

  // 401 认证失败，清除 token 并跳转到登录页
  if (data.code === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('认证失败，请重新登录');
  }

  if (data.code !== 200) {
    throw new Error(data.message || '请求失败');
  }

  return data.data;
}

// ==================== 认证相关 ====================
export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResult {
  token: string;
  user: {
    id: number;
    username: string;
    name: string | null;
    email: string | null;
    role: string;
  };
}

export async function login(params: LoginParams): Promise<LoginResult> {
  return request<LoginResult>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function getCurrentUser() {
  return request<{ id: number; username: string; name: string | null; email: string | null; role: string; created_at: string }>('/auth/me');
}

// ==================== 员工相关 ====================
export interface Employee {
  employee_id: string;
  name: string;
  department: string | null;
  position: string | null;
  phone: string;
  bind_status: number;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface EmployeeListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  department?: string;
  position?: string;
  bindStatus?: number;
}

export interface EmployeeListResult {
  list: Employee[];
  total: number;
  page: number;
  pageSize: number;
}

export async function getEmployees(params: EmployeeListParams = {}): Promise<EmployeeListResult> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
  if (params.keyword) searchParams.set('keyword', params.keyword);
  if (params.department) searchParams.set('department', params.department);
  if (params.position) searchParams.set('position', params.position);
  if (params.bindStatus !== undefined) searchParams.set('bindStatus', String(params.bindStatus));

  return request<EmployeeListResult>(`/employees?${searchParams.toString()}`);
}

export interface CreateEmployeeParams {
  employee_id: string;
  name: string;
  phone: string;
  department?: string;
  position?: string;
}

export async function createEmployee(params: CreateEmployeeParams): Promise<void> {
  await request<void>('/employees', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export interface UpdateEmployeeParams {
  name?: string;
  phone?: string;
  department?: string;
  position?: string;
}

export async function updateEmployee(employeeId: string, params: UpdateEmployeeParams): Promise<void> {
  await request<void>(`/employees/${employeeId}`, {
    method: 'PUT',
    body: JSON.stringify(params),
  });
}

export async function deleteEmployee(employeeId: string): Promise<void> {
  await request<void>(`/employees/${employeeId}`, {
    method: 'DELETE',
  });
}

export async function disableEmployee(employeeId: string): Promise<void> {
  await request<void>(`/employees/${employeeId}/disable`, {
    method: 'PUT',
  });
}

export async function enableEmployee(employeeId: string): Promise<void> {
  await request<void>(`/employees/${employeeId}/enable`, {
    method: 'PUT',
  });
}

// ==================== 公众号相关 ====================
export interface WechatAccount {
  id: number;
  account_name: string;
  account_id: string;
  account_type: string;
  app_id: string | null;
  app_secret?: string | null;
  qr_code_url: string | null;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface AccountListResult {
  list: WechatAccount[];
  total: number;
}

export async function getAccounts(): Promise<WechatAccount[]> {
  const result = await request<AccountListResult>('/accounts');
  return result.list;
}

export interface CreateAccountParams {
  account_name: string;
  account_id: string;
  account_type: string;
  app_id?: string;
  app_secret?: string;
}

export async function createAccount(params: CreateAccountParams): Promise<void> {
  await request<void>('/accounts', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export interface UpdateAccountParams {
  account_name?: string;
  account_type?: string;
  app_id?: string;
  app_secret?: string;
}

export async function updateAccount(accountDbId: number, params: UpdateAccountParams): Promise<void> {
  await request<void>(`/accounts/${accountDbId}`, {
    method: 'PUT',
    body: JSON.stringify(params),
  });
}

export async function deleteAccount(accountDbId: number): Promise<void> {
  await request<void>(`/accounts/${accountDbId}`, {
    method: 'DELETE',
  });
}

export async function disableAccount(accountDbId: number): Promise<void> {
  await request<void>(`/accounts/${accountDbId}/disable`, {
    method: 'PUT',
  });
}

export async function enableAccount(accountDbId: number): Promise<void> {
  await request<void>(`/accounts/${accountDbId}/enable`, {
    method: 'PUT',
  });
}

// ==================== 推广记录相关 ====================
export interface PromotionRecord {
  id: number;
  employee_id: string;
  employee_name?: string;
  account_id: number;
  account_name?: string;
  scene_str: string;
  qr_code_url: string | null;
  scan_count: number;
  follow_count: number;
  created_at: string;
}

export interface PromotionListParams {
  page?: number;
  pageSize?: number;
  employee_id?: string;
  account_id?: number;
}

export interface PromotionListResult {
  list: PromotionRecord[];
  total: number;
  page: number;
  pageSize: number;
}

export async function getPromotions(params: PromotionListParams = {}): Promise<PromotionListResult> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
  if (params.employee_id) searchParams.set('employee_id', params.employee_id);
  if (params.account_id) searchParams.set('account_id', String(params.account_id));

  return request<PromotionListResult>(`/promotions?${searchParams.toString()}`);
}

// ==================== 关注记录相关 ====================
export interface FollowRecord {
  id: number;
  openid: string;
  employee_id: string;
  employee_name?: string;
  account_id: number;
  account_name?: string;
  promotion_record_id: number;
  nickname: string | null;
  avatar_url: string | null;
  subscribe_time: string | null;
  unsubscribe_time: string | null;
  status: number;
  created_at: string;
}

export interface FollowListParams {
  page?: number;
  pageSize?: number;
  employee_id?: string;
  account_id?: number;
  status?: number;
}

export interface FollowListResult {
  list: FollowRecord[];
  total: number;
  page: number;
  pageSize: number;
}

export async function getFollowRecords(params: FollowListParams = {}): Promise<FollowListResult> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
  if (params.employee_id) searchParams.set('employee_id', params.employee_id);
  if (params.account_id) searchParams.set('account_id', String(params.account_id));
  if (params.status !== undefined) searchParams.set('status', String(params.status));

  return request<FollowListResult>(`/follows?${searchParams.toString()}`);
}

// ==================== 统计相关 ====================
export interface DashboardStats {
  totalEmployees: number;
  boundEmployees: number;
  totalFollowers: number;
  activeFollowers: number;
  totalPromotions: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return request<DashboardStats>('/stats/dashboard');
}