import { create } from "zustand";
import { API_ROUTES } from "@/utils/api";
import axiosInstance from "@/lib/axios";
import axios from "axios";

export interface HomePageCategory {
  id: number;
  name: string;
  parentId: number | null;
  subcategories: HomePageCategory[];
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  brand: { id: number; name: string } | null;
  model: { id: number; name: string } | null;
  category: HomePageCategory | null;
  imageUrl: string[];
}

interface ProductCache {
  [categoryId: number]: Product[];
}

interface HomePageCategoryState {
  categories: HomePageCategory[];
  selectedCategory: HomePageCategory | null;
  products: Product[];
  productCache: ProductCache;
  loading: boolean;
  error: string | null;
  totalPages: number;
  initialized: boolean;
  fetchHomePageCategories: () => Promise<void>;
  setSelectedCategory: (category: HomePageCategory | null) => void;
  fetchProductsByCategory: (categoryId: number, page?: number, limit?: number) => Promise<void>;
  clearProducts: () => void;
}

const isBrowser = typeof window !== 'undefined';

export const useHomePageCategoryStore = create<HomePageCategoryState>((set, get) => ({
  categories: [],
  selectedCategory: null,
  products: [],
  productCache: {},
  loading: false,
  error: null,
  totalPages: 1,
  initialized: false,

  fetchHomePageCategories: async () => {
    const state = get();
    if (state.loading) return;

    set({ loading: true, error: null });
    try {
      console.log('Fetching categories from:', `${API_ROUTES.HOME_CATEGORIES}/main`);
      const response = await axiosInstance.get(`${API_ROUTES.HOME_CATEGORIES}/main`);
      console.log('Categories response:', response.data);
      const categories = response.data;
      set({ 
        categories, 
        loading: false,
        initialized: true 
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      set({ 
        error: "Failed to fetch home page categories", 
        loading: false,
        initialized: true
      });
    }
  },

  setSelectedCategory: (category) => {
    console.log('Setting selected category:', category);
    set({ selectedCategory: category });
  },

  fetchProductsByCategory: async (categoryId: number, page: number = 1, limit: number = 10) => {
    const state = get();
    if (state.loading) {
      console.log('Already loading products, skipping request');
      return;
    }
    
    // First check memory cache
    if (state.productCache[categoryId] && page === 1) {
      console.log('Using cached products for category:', categoryId);
      console.log('Cached products:', state.productCache[categoryId]);
      set({ products: state.productCache[categoryId], loading: false });
      return;
    }

    set({ loading: true, error: null });
    try {
      console.log('Fetching products for category:', categoryId);
      console.log('Request URL:', `${API_ROUTES.HOME_CATEGORIES}/${categoryId}/products`);
      console.log('Request params:', { page, limit });
      
      const response = await axiosInstance.get(
        `${API_ROUTES.HOME_CATEGORIES}/${categoryId}/products`,
        {
          params: { page, limit },
        }
      );
      
      console.log('Products API Response:', response);
      console.log('Products Response Data:', response.data);
      
      if (!response.data.success) {
        console.error('API request was not successful:', response.data);
        throw new Error('API request was not successful');
      }

      const products = response.data.data?.products || [];
      const total = response.data.data?.total || 0;
      const totalPages = Math.ceil(total / limit);
      
      console.log('Processed products:', products);
      console.log('Total products:', total);
      console.log('Total pages:', totalPages);
      
      // Update cache and current products
      const newCache = { ...state.productCache, [categoryId]: products };
      set({ 
        products,
        productCache: newCache,
        loading: false,
        totalPages
      });

      // Save to localStorage only for first page and only in browser
      if (page === 1 && isBrowser) {
        try {
          console.log('Saving to localStorage:', { products, newCache });
          localStorage.setItem('products', JSON.stringify(products));
          localStorage.setItem('productCache', JSON.stringify(newCache));
        } catch (storageError) {
          console.error('Error saving to localStorage:', storageError);
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: error.config
        });
      }
      set({ 
        error: error instanceof Error ? error.message : "Failed to fetch products", 
        loading: false,
        products: [] 
      });
      // Clear localStorage on error only in browser
      if (isBrowser) {
        try {
          console.log('Clearing localStorage due to error');
          localStorage.removeItem('products');
          localStorage.removeItem('productCache');
        } catch (storageError) {
          console.error('Error clearing localStorage:', storageError);
        }
      }
    }
  },

  clearProducts: () => {
    console.log('Clearing products from state and localStorage');
    set({ products: [] });
    if (isBrowser) {
      try {
        localStorage.removeItem('products');
      } catch (error) {
        console.error('Error clearing localStorage:', error);
      }
    }
  }
})); 