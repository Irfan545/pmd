import axios from 'axios';

// Ensure we're using the correct API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
axiosInstance.interceptors.request.use(
  (config) => {
    if (config.baseURL && config.url) {
      console.log('Making request to:', config.baseURL + config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
// Store pending requests
let failedQueue: any[] = [];

const processQueue = (error: any = null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get the token from cookies
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('accessToken='))
      ?.split('=')[1];

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is not 401 or request has already been retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Skip refresh for auth-related endpoints
    if (originalRequest.url?.includes('/auth/')) {
      return Promise.reject(error);
    }

    // If already refreshing, add request to queue
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Get refresh token from cookies
      const refreshToken = document.cookie
        .split('; ')
        .find((row) => row.startsWith('refreshToken='))
        ?.split('=')[1];

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // Add refresh token to request headers
      const response = await axios.post(
        `${API_URL}/auth/refresh-token`,
        {},
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        // Process any queued requests
        processQueue(null, response.data.accessToken);
        
        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
        return axiosInstance(originalRequest);
      } else {
        throw new Error('Failed to refresh token');
      }
    } catch (refreshError) {
      processQueue(refreshError, null);
      
      // Clear tokens
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      // Only redirect if we're not already on the login page and not on a public route
      const currentPath = window.location.pathname;
      const isPublicRoute = currentPath === '/auth/login' || currentPath === '/auth/register';
      if (typeof window !== 'undefined' && !isPublicRoute) {
        window.location.href = '/auth/login';
      }
      
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export const API_ROUTES = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    LOGOUT: "/api/auth/logout",
    VERIFY: "/api/auth/verify",
    REFRESH_TOKEN: "/api/auth/refresh-token",
  },
  PRODUCTS: {
    FETCH_ALL: "/api/products",
    FETCH_ALL_ADMIN: "/api/products/admin/all",
    FETCH_ONE: "/api/products",
    FETCH_BY_CATEGORY: "/api/products/category",
    SEARCH: "/api/products/search",
    CATEGORY: "/api/products/category",
  },
  CART: {
    FETCH: "/api/cart/fetch-cart",
    ADD: "/api/cart/add-to-cart",
    UPDATE: "/api/cart/update",
    REMOVE: "/api/cart/remove",
  },
  SETTINGS: {
    FETCH: "/api/settings",
    FETCH_BANNERS: "/api/settings/banners",
    FETCH_FEATURED_PRODUCTS: "/api/settings/fetch-feature-products",
    ADD_BANNERS: "/api/settings/banners",
    UPDATE_FEATURED_PRODUCTS: "/api/settings/update-feature-products",
  },
  CATEGORIES: {
    MAIN: '/api/categories/main',
    ALL: '/api/categories',
  },
  HOME_CATEGORIES: '/api/home-categories',
  ORDER: {
    BASE: '/api/orders',
    GET_USER_ORDERS: '/api/orders/get-order-by-user-id',
    CREATE: '/api/orders/create-final-order',
    GET_ONE: '/api/orders/get-single-order',
    GET_ALL_FOR_ADMIN: '/api/orders/get-all-orders-for-admin',
    UPDATE_STATUS: '/api/orders',
    CREATE_PAYPAL_ORDER: '/api/orders/create-paypal-order',
    CAPTURE_PAYPAL_ORDER: '/api/orders/capture-paypal-order',
  },
  COUPON: {
    BASE: '/api/coupon',
    CREATE: '/api/coupon/create-coupon',
    FETCH_ALL: '/api/coupon/fetch-all-coupons',
  },
  ADDRESS: {
    BASE: '/api/address',
    GET_ALL: '/api/address/get-address',
    ADD: '/api/address/add-address',
    UPDATE: '/api/address/update-address',
    DELETE: '/api/address/delete-address',
  },
  COUPONS: '/api/coupons',
};

// Validate API routes
Object.entries(API_ROUTES).forEach(([key, value]) => {
  if (!value) {
    console.error(`API route ${key} is not properly defined`);
  }
});

export default axiosInstance;