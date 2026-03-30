/**
 * AppFabrik App Base — Generic API Client
 * =========================================
 * Axios-basierter API-Client mit:
 * - JWT Auth (auto-refresh)
 * - Offline-Erkennung
 * - Retry-Logic
 * - Request/Response Logging
 */

import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import NetInfo from '@react-native-community/netinfo';
import * as SecureStore from 'expo-secure-store';
import { tenantConfig } from '../config/tenant';

const TOKEN_KEY = `${tenantConfig.slug}_auth_token`;
const REFRESH_KEY = `${tenantConfig.slug}_refresh_token`;

// ─── Client Factory ───────────────────────────────────────────────────────────

export function createApiClient(config?: Partial<AxiosRequestConfig>): AxiosInstance {
  const client = axios.create({
    baseURL: `${tenantConfig.api.baseUrl}${tenantConfig.api.versionPrefix}`,
    timeout: tenantConfig.api.timeoutMs,
    headers: {
      'Content-Type': 'application/json',
      'X-App-Tenant': tenantConfig.slug,
      'X-App-Version': tenantConfig.version,
    },
    ...config,
  });

  // ─── Request Interceptor: JWT einfügen ──────────────────────────────────
  client.interceptors.request.use(async (req: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (token && req.headers) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
  });

  // ─── Response Interceptor: 401 → Token-Refresh ──────────────────────────
  let isRefreshing = false;
  let refreshQueue: Array<(token: string) => void> = [];

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // Warte auf laufenden Refresh
          return new Promise((resolve) => {
            refreshQueue.push((token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(client(originalRequest));
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
          if (!refreshToken) throw new Error('Kein Refresh-Token');

          const resp = await axios.post(
            `${tenantConfig.api.baseUrl}${tenantConfig.api.versionPrefix}/auth/refresh`,
            { refreshToken },
          );

          const newToken: string = resp.data.token;
          await SecureStore.setItemAsync(TOKEN_KEY, newToken);

          refreshQueue.forEach((cb) => cb(newToken));
          refreshQueue = [];

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return client(originalRequest);
        } catch (refreshError) {
          // Refresh fehlgeschlagen → Logout
          await SecureStore.deleteItemAsync(TOKEN_KEY);
          await SecureStore.deleteItemAsync(REFRESH_KEY);
          throw refreshError;
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    },
  );

  return client;
}

// ─── Offline-Check ────────────────────────────────────────────────────────────

export async function isOnline(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return state.isConnected === true && state.isInternetReachable !== false;
}

// ─── Singleton ────────────────────────────────────────────────────────────────

export const apiClient = createApiClient();

export default apiClient;
