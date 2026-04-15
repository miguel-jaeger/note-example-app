import { createClient } from '@insforge/sdk';

const insforge = createClient({
  baseUrl: 'https://backendapp-7vxqqu38.us-east.insforge.app',
  anonKey: '7vxqqu38',
});

export default insforge;

// Auth helper functions
export async function register(email: string, password: string, name: string) {
  const response = await fetch('/api/auth/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  return response.json();
}

export async function login(email: string, password: string) {
  const response = await fetch('/api/auth/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });
  return response.json();
}

export async function logout() {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
  return response.json();
}

export async function getCurrentUser() {
  const response = await fetch('/api/auth/sessions/current', {
    credentials: 'include',
  });
  if (!response.ok) return null;
  const data = await response.json();
  return data.user;
}

export async function refreshToken() {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  });
  return response.json();
}