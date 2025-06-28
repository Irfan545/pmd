import { API_ROUTES } from "@/utils/api";
import axiosInstance from "@/utils/api";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useCartStore } from "./useCartStore";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axiosInstance.post(API_ROUTES.AUTH.LOGIN, {
            email,
            password,
          });

          if (response.data.success) {
            set({ 
              user: response.data.user, 
              isLoading: false 
            });
            
            // Fetch cart details after successful login
            try {
              await useCartStore.getState().fetchCart();
            } catch (error) {
              console.error("Error fetching cart after login:", error);
            }
            
            // Redirect to home page after successful login
            if (typeof window !== 'undefined') {
              window.location.href = '/';
            }
          } else {
            throw new Error(response.data.message || "Login failed");
          }
        } catch (error) {
          console.error("Login error:", error);
          set({ 
            error: error instanceof Error ? error.message : "Login failed", 
            isLoading: false 
          });
          throw error;
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axiosInstance.post(API_ROUTES.AUTH.REGISTER, {
            name,
            email,
            password,
          });

          if (response.data.success) {
            set({ 
              user: response.data.user, 
              isLoading: false 
            });
            return true;
          } else {
            throw new Error(response.data.message || "Registration failed");
          }
        } catch (error) {
          console.error("Registration error:", error);
          set({ 
            error: error instanceof Error ? error.message : "Registration failed", 
            isLoading: false 
          });
          return false;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await axiosInstance.post(API_ROUTES.AUTH.LOGOUT);
        } catch (error) {
          console.error("Logout error:", error);
          // Continue with logout even if API call fails
        } finally {
          // Always clear the state and cookies
          set({ user: null, isLoading: false, error: null });
          
          // Clear cart on logout
          useCartStore.getState().items = [];
          
          // Clear any stored tokens
          if (typeof window !== 'undefined') {
            document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          }
          
          // Redirect to login page after logout
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
        }
      },
    }),
    { name: "auth-storage", partialize: (state) => ({ user: state.user }) }
  )
);
