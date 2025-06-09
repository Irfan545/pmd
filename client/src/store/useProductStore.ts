import { API_ROUTES } from "@/utils/api";
import axios from "axios";
import { create } from "zustand";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  brand: { id: number; name: string } | string;
  stock: number;
  model: { id: number; name: string } | string;
  engine: string;
  compatibleEngine: string;
  category: { id: number; name: string } | string;
  imageUrl: string[];
  compatibilities: string[];
  carBrand: string;
  carModel: string;
  engineType: string;
  images: string[];
  colors: string[];
}

interface ProductState {
  products: Product[];
  currentPage: number;
  totalProducts: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  fetchAllProductsForAdmin: () => Promise<void>;
  fetchProductById: (id: string) => Promise<Product | null>;
  createProduct: (productData: FormData) => Promise<void>;
  updateProduct: (id: string, productData: FormData) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  setCurrentPage: (page: number) => void;
  fetchProductsForClient: (params: {
    page: number;
    limit: number;
    categories?: string[];
    sizes?: string[];
    colors?: string[];
    brands?: string[];
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) => Promise<void>;
  fetchProducts: (params: {
    categoryId?: number;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  currentPage: 1,
  totalProducts: 0,
  totalPages: 1,
  loading: false,
  error: null,

  setCurrentPage: (page: number) => set({ currentPage: page }),

  fetchProductsForClient: async (params) => {
    console.log('Store: Starting to fetch products with params:', params);
    set({ loading: true, error: null });
    try {
      const serverParams: any = {
        page: params.page,
        limit: params.limit,
        sortBy: params.sortBy || 'createdAt',
        sortOrder: params.sortOrder || 'desc'
      };

      let endpoint = `${API_ROUTES.PRODUCTS}/search`;
      
      // If we have a category, use the category endpoint
      if (params.categories?.[0] && !isNaN(Number(params.categories[0]))) {
        endpoint = `${API_ROUTES.PRODUCTS}/category/${params.categories[0]}`;
      }

      console.log('Store: Making API request to:', endpoint, 'with params:', serverParams);

      const response = await axios.get(endpoint, {
        params: serverParams,
        withCredentials: true,
      });

      console.log('Store: API Response:', response.data);

      if (!response.data.products) {
        throw new Error('Invalid response format: products array is missing');
      }

      const { products, total, totalPages } = response.data;
      
      if (!Array.isArray(products)) {
        throw new Error('Invalid response format: products is not an array');
      }

      console.log('Store: Setting products in state:', products.length);
      set({ 
        products, 
        totalProducts: total,
        totalPages,
        loading: false 
      });
    } catch (error) {
      console.error('Store: Error fetching products:', error);
      let errorMessage = 'Failed to fetch products';
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          errorMessage = 'Category not found';
        } else if (error.response?.data?.details) {
          errorMessage = error.response.data.details;
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      set({ error: errorMessage, loading: false });
      throw error; // Re-throw to be caught by the component
    }
  },

  fetchAllProductsForAdmin: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(
        `${API_ROUTES.PRODUCTS}/fetch-admin-products`,
        {
          withCredentials: true,
        }
      );
      set({ products: response.data, loading: false });
    } catch (error) {
      set({ error: "Failed to fetch products", loading: false });
    }
  },

  createProduct: async (productData: FormData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(
        `${API_ROUTES.PRODUCTS}/create-new-product`,
        productData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      set({ loading: false });
    } catch (error) {
      set({ error: "Failed to create product", loading: false });
    }
  },

  updateProduct: async (id: string, productData: FormData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(
        `${API_ROUTES.PRODUCTS}/${id}`,
        productData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      set({ loading: false });
    } catch (error) {
      set({ error: "Failed to update product", loading: false });
    }
  },

  deleteProduct: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.delete(`${API_ROUTES.PRODUCTS}/${id}`);
      set({ loading: false });
    } catch (error) {
      set({ error: "Failed to delete product", loading: false });
    }
  },

  fetchProductById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_ROUTES.PRODUCTS}/${id}`);
      set({ loading: false });
      return response.data as Product;
    } catch (error) {
      set({ error: "Failed to fetch product", loading: false });
      return null;
    }
  },

  fetchProducts: (params) => {
    set({ loading: true, error: null });
    return axios.get(`${API_ROUTES.PRODUCTS}/search`, {
        params,
        withCredentials: true,
    })
    .then((response) => {
      const { products, total, totalPages } = response.data;
      set({
        products,
        totalProducts: total,
        totalPages,
        loading: false,
      });
    })
    .catch((error) => {
      set({ error: "Failed to fetch products", loading: false });
    });
  },
}));
