import { create } from "zustand";
import { API_ROUTES } from "@/utils/api";
import axiosInstance from "@/lib/axios";

export interface Category {
  id: number;
  name: string;
  parentId: number | null;
  subcategories: Category[];
}

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<Category[]>;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  loading: false,
  error: null,
  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get(`${API_ROUTES.CATEGORIES}/main`);
      const categories = response.data;
      set({ categories, loading: false });
      return categories;
    } catch (error) {
      set({ error: "Failed to fetch categories" });
      return [];
    }
  },
}));
