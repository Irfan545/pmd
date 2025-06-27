import { create } from "zustand";
import axios from "axios";
import { API_ROUTES } from "@/utils/api";
import { useAuthStore } from "./useAuthStore";
import axiosInstance from "@/utils/api";
import { useRouter } from "next/navigation";

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string[];
  color?: string;
  size?: string;
}

interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateCartItem: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchCart: async () => {
    const { user, isLoading } = useAuthStore.getState();
    if (!user || isLoading) return;

    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + API_ROUTES.CART.FETCH, {
        withCredentials: true,
      });
      if (response.data.success) {
        set({ items: response.data.data, isLoading: false });
      } else {
        throw new Error(response.data.message || "Failed to fetch cart");
      }
    } catch (error) {
      console.error("Fetch cart error:", error);
      set({ 
        error: error instanceof Error ? error.message : "Failed to fetch cart", 
        isLoading: false 
      });
    }
  },

  addToCart: async (productId: number, quantity: number) => {
    const { user } = useAuthStore.getState();
    if (!user) {
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post(API_ROUTES.CART.ADD, {
        productId,
        quantity,
      });

      if (response.data.success) {
        await get().fetchCart();
      } else {
        throw new Error(response.data.message || "Failed to add item to cart");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      set({ 
        error: error instanceof Error ? error.message : "Failed to add item to cart", 
        isLoading: false 
      });
      throw error;
    }
  },

  updateCartItem: async (itemId: number, quantity: number) => {
    const { user } = useAuthStore.getState();
    if (!user) {
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.put(API_ROUTES.CART.UPDATE + `/${itemId}`, {
        quantity,
      });

      if (response.data.success) {
        await get().fetchCart();
      } else {
        throw new Error(response.data.message || "Failed to update cart item");
      }
    } catch (error) {
      console.error("Update cart error:", error);
      set({ 
        error: error instanceof Error ? error.message : "Failed to update cart item", 
        isLoading: false 
      });
      throw error;
    }
  },

  removeFromCart: async (itemId: number) => {
    const { user } = useAuthStore.getState();
    if (!user) {
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.delete(API_ROUTES.CART.REMOVE + `/${itemId}`);

      if (response.data.success) {
        await get().fetchCart();
      } else {
        throw new Error(response.data.message || "Failed to remove item from cart");
      }
    } catch (error) {
      console.error("Remove from cart error:", error);
      set({ 
        error: error instanceof Error ? error.message : "Failed to remove item from cart", 
        isLoading: false 
      });
      throw error;
    }
  },

  clearCart: () => {
    set({ items: [], isLoading: false, error: null });
  },
}));
