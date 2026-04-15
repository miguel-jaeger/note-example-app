import { AuthResponse, User } from './types';
import { authStorage } from './storage';

const API_BASE = process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://7vxqqu38.us-east.insforge.app';

function getAuthHeaders() {
  const token = authStorage.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseAuthResponse(response: Response): Promise<AuthResponse> {
  const data = await response.json().catch(() => ({ error: 'Invalid server response' }));
  if (!response.ok) {
    return {
      ...(typeof data === 'object' && data ? data : {}),
      error: (data as any)?.error || 'Request failed',
      message: (data as any)?.message || (data as any)?.error || 'Request failed',
    };
  }
  return data as AuthResponse;
}

export async function register(email: string, password: string, name: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/api/auth/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
    credentials: 'include',
  });
  return parseAuthResponse(response);
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/api/auth/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });
  return parseAuthResponse(response);
}

export async function logout(): Promise<{ success: boolean; message?: string }> {
  const response = await fetch(`${API_BASE}/api/auth/logout`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  return response.json();
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch(`${API_BASE}/api/auth/sessions/current`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.user;
  } catch {
    return null;
  }
}

export async function refreshToken(): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    credentials: 'include',
  });
  return response.json();
}