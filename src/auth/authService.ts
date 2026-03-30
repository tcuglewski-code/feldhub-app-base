/**
 * AppFabrik App Base — Auth Service
 * ===================================
 * Generic Auth für alle Tenants.
 * - JWT Login / Logout
 * - Token in SecureStore
 * - Biometrie-Support (optional)
 * - Offline-Auth (Cached Token)
 */

import * as SecureStore from 'expo-secure-store';
import { apiClient } from '../api/client';
import { tenantConfig } from '../config/tenant';

const TOKEN_KEY = `${tenantConfig.slug}_auth_token`;
const REFRESH_KEY = `${tenantConfig.slug}_refresh_token`;
const USER_KEY = `${tenantConfig.slug}_user`;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  teamId?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthTokens {
  token: string;
  refreshToken: string;
  expiresAt: number;
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function login(credentials: LoginCredentials): Promise<AuthUser> {
  const response = await apiClient.post<{ token: string; refreshToken: string; user: AuthUser }>(
    '/auth/login',
    credentials,
  );

  const { token, refreshToken, user } = response.data;

  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await SecureStore.setItemAsync(REFRESH_KEY, refreshToken);
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));

  return user;
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout');
  } catch {
    // Ignoriere Netzwerkfehler beim Logout
  } finally {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  }
}

// ─── Current User ─────────────────────────────────────────────────────────────

export async function getCurrentUser(): Promise<AuthUser | null> {
  const raw = await SecureStore.getItemAsync(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

// ─── Token Check ─────────────────────────────────────────────────────────────

export async function hasValidToken(): Promise<boolean> {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  return !!token;
}

// ─── Update Cached User ───────────────────────────────────────────────────────

export async function updateCachedUser(user: Partial<AuthUser>): Promise<void> {
  const current = await getCurrentUser();
  if (!current) return;
  const updated = { ...current, ...user };
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(updated));
}
