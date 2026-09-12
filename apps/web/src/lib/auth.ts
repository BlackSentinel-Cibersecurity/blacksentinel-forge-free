// ============================================================================
// BlackSentinel Forge - Auth Helper
// ============================================================================

import { api } from './api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: Array<{ resource: string; actions: string[] }>;
  tenantId: string;
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem('forge_user');
  return data ? JSON.parse(data) : null;
}

export function storeUser(user: User, token: string): void {
  localStorage.setItem('forge_user', JSON.stringify(user));
  api.setToken(token);
}

export function clearAuth(): void {
  localStorage.removeItem('forge_user');
  localStorage.removeItem('forge_token');
  api.setToken(null);
}

export function isAuthenticated(): boolean {
  return !!getStoredUser() && !!api.getToken();
}

export function hasPermission(resource: string, action: string): boolean {
  const user = getStoredUser();
  if (!user) return false;

  return user.permissions.some(
    (p) =>
      (p.resource === '*' || p.resource === resource) &&
      (p.actions.includes('*') || p.actions.includes(action)),
  );
}

export function hasRole(role: string): boolean {
  const user = getStoredUser();
  return user?.role === role;
}

export async function login(email: string, password: string): Promise<User> {
  const response = await api.login(email, password);
  const { user, token } = response.data;
  storeUser(user as User, token);
  return user as User;
}

export async function register(
  email: string,
  password: string,
  name: string,
  tenantName: string,
): Promise<User> {
  const response = await api.register(email, password, name, tenantName);
  const { user, token } = response.data;
  storeUser(user as User, token);
  return user as User;
}

export function logout(): void {
  clearAuth();
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
}
