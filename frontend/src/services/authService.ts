// Auth service - handles authentication
import type { User, AuthTokens, ApiResponse } from '../types';

const API_BASE = '/api';
const ACCESS_TOKEN_KEY = 'lyriclab_access_token';
const REFRESH_TOKEN_KEY = 'lyriclab_refresh_token';
const USER_KEY = 'lyriclab_user';

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(tokens: AuthTokens): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): User | null {
  const data = localStorage.getItem(USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function setStoredUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

export async function register(email: string, password: string): Promise<User> {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data: ApiResponse<User> = await response.json();

  if (data.code !== 0) {
    throw new Error(data.message || '注册失败');
  }

  return data.data!;
}

export async function login(email: string, password: string): Promise<AuthTokens> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data: ApiResponse<AuthTokens> = await response.json();

  if (data.code !== 0) {
    throw new Error(data.message || '登录失败');
  }

  setTokens(data.data!);
  return data.data!;
}

export async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token');
  }

  const response = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  const data: ApiResponse<{ accessToken: string }> = await response.json();

  if (data.code !== 0) {
    clearTokens();
    throw new Error(data.message || 'Token refresh failed');
  }

  const { accessToken } = data.data!;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  return accessToken;
}

export async function fetchCurrentUser(): Promise<User> {
  const response = await fetch(`${API_BASE}/auth/me`, {
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });

  const data: ApiResponse<User> = await response.json();

  if (data.code !== 0) {
    throw new Error(data.message || 'Failed to fetch user');
  }

  setStoredUser(data.data!);
  return data.data!;
}

export async function ensureValidToken(): Promise<string> {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  try {
    // Try to use the token
    return token;
  } catch {
    // Try to refresh
    return await refreshAccessToken();
  }
}

export async function logout(): Promise<void> {
  clearTokens();
}

export function getAuthHeaders(): Record<string, string> {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}