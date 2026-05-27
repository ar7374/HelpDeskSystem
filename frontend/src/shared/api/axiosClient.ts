import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse, RefreshTokenResponse } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7167';

export const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Crucial for SignalR & CORS authentication cookie scenarios
});

// Flag to prevent infinite looping on refresh requests
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Automatically inject JWT Bearer Token
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Unwrap envelope + Catch 401 & Auto Refresh
axiosClient.interceptors.response.use(
  (response) => {
    // If it's a successful response, return the standard ApiResponse wrapper directly
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Check if error is 401 Unauthorized and request hasn't been retried yet
    const isUnauthorized = error.response?.status === 401;
    
    // Do not attempt to refresh if we are already trying to login or refresh
    const isAuthRequest = originalRequest.url?.includes('auth/login') || originalRequest.url?.includes('auth/refresh');

    if (isUnauthorized && !isAuthRequest) {
      if (isRefreshing) {
        // Queue this request while another token refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        // No refresh token available, force clear auth and fail
        isRefreshing = false;
        localStorage.clear();
        return Promise.reject(error);
      }

      try {
        // Attempt to fetch a new token pair from the backend anonymously
        const response = await axios.post<ApiResponse<RefreshTokenResponse>>(
          `${BASE_URL}/api/auth/refresh`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        if (response.data && response.data.status && response.data.data) {
          const { token: newAccessToken, refreshToken: newRefreshToken } = response.data.data;
          
          localStorage.setItem('accessToken', newAccessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          // Retry pending requests with the new token
          processQueue(null, newAccessToken);
          isRefreshing = false;

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          return axiosClient(originalRequest);
        } else {
          throw new Error('Invalid refresh response');
        }
      } catch (refreshError) {
        // Refresh token expired or revoked, clean up and redirect to login
        processQueue(refreshError, null);
        isRefreshing = false;
        localStorage.clear();
        window.location.reload(); // Hard reload to clear active UI state and trigger login redirect
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
