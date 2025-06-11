import { API_ROUTES } from "@/utils/api";
import axiosInstance from "@/utils/api";
import { create } from "zustand";

interface FeatureBanner {
  id: string;
  imageUrl: string;
}

interface FeaturedProduct {
  id: number;
  name: string;
  price: number;
  images: string[];
  brand?: { name: string };
  model?: { name: string };
  category?: { name: string };
}

interface SettingsState {
  banners: FeatureBanner[];
  featuredProducts: FeaturedProduct[];
  isLoading: boolean;
  error: string | null;
  fetchBanners: () => Promise<void>;
  fetchFeaturedProducts: () => Promise<void>;
  addBanners: (files: File[]) => Promise<boolean>;
  updateFeaturedProducts: (productIds: string[]) => Promise<boolean>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  banners: [],
  featuredProducts: [],
  isLoading: false,
  error: null,
  fetchBanners: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(API_ROUTES.SETTINGS.FETCH_BANNERS);
      if (response.data.success) {
        set({ banners: response.data.banners, isLoading: false });
      } else {
        throw new Error(response.data.message || 'Failed to fetch banners');
      }
    } catch (e) {
      console.error(e);
      set({ error: "Failed to fetch banners", isLoading: false });
    }
  },
  fetchFeaturedProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(API_ROUTES.SETTINGS.FETCH_FEATURED_PRODUCTS);
      console.log('Featured products response:', response.data);
      if (response.data.success && Array.isArray(response.data.featuredProducts)) {
        set({
          featuredProducts: response.data.featuredProducts,
          isLoading: false,
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (e) {
      console.error(e);
      set({ error: "Failed to fetch featured products", isLoading: false });
    }
  },
  addBanners: async (files: File[]) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("images", file));
      const response = await axiosInstance.post(
        API_ROUTES.SETTINGS.ADD_BANNERS,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      set({
        isLoading: false,
      });

      return response.data.success;
    } catch (e) {
      console.error(e);
      set({ error: "Failed to add banners", isLoading: false });
      return false;
    }
  },
  updateFeaturedProducts: async (productIds: string[]) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post(
        API_ROUTES.SETTINGS.UPDATE_FEATURED_PRODUCTS,
        { productIds }
      );
      set({
        isLoading: false,
      });
      return response.data.success;
    } catch (e) {
      console.error(e);
      set({ error: "Failed to update featured products", isLoading: false });
      return false;
    }
  },
}));
