import { AuthResponse, User } from './types';

export async function register(email: string, password: string, name: string): Promise<AuthResponse> {
  const response = await fetch('/api/auth/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  return response.json();
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch('/api/auth/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });
  return response.json();
}

export async function logout(): Promise<{ success: boolean; message?: string }> {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
  return response.json();
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/sessions/current', {
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
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  });
  return response.json();
}