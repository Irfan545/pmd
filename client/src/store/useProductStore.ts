import { API_ROUTES } from "@/utils/api";
import axios from "axios";
import { create } from "zustand";

export interface Product {
  id: number;
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
  images?: string[];
  colors: string[];
  isFeatured?: boolean;
  partNumbers?: {
    id: number;
    number: string;
    type: string;
    manufacturer: string;
    isOriginal: boolean;
  }[];
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

      let endpoint = API_ROUTES.PRODUCTS.SEARCH;
      
      // If we have a category, use the category endpoint
      if (params.categories?.[0] && !isNaN(Number(params.categories[0]))) {
        endpoint = `${API_ROUTES.PRODUCTS.CATEGORY}/${params.categories[0]}`;
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const url = `${baseUrl}${endpoint}`;

      console.log('Store: Making API request to:', url, 'with params:', serverParams);

      const response = await axios.get(url, {
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
      throw error;
    }
  },

  fetchAllProductsForAdmin: async () => {
    console.log('Fetching admin products...');
    set({ loading: true, error: null });
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}${API_ROUTES.PRODUCTS.FETCH_ALL_ADMIN}`;
      console.log('Making request to:', url);
      
      const response = await axios.get(url, {
        withCredentials: true,
      });
      
      console.log('Response received:', response.data);
      
      // Handle both array and paginated response formats
      const productsData = response.data.products || response.data;
      console.log('Products data:', productsData);
      
      // Add computed images field for backward compatibility
      const productsWithImages = productsData.map((product: any) => ({
        ...product,
        images: product.imageUrl || []
      }));
      
      set({ products: productsWithImages, loading: false });
    } catch (error) {
      console.error('Error fetching admin products:', error);
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
    console.log('Fetching product by ID:', id);
    set({ loading: true, error: null });
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`;
      console.log('Making request to:', url);
      
      const response = await axios.get(url, {
        withCredentials: true
      });
      
      console.log('Product response:', response.data);
      set({ loading: false });
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      set({ error: "Failed to fetch product", loading: false });
      return null;
    }
  },

  fetchProducts: async (params) => {
    set({ loading: true, error: null });
    try {
      console.log('Fetching products with params:', params);
      const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + API_ROUTES.PRODUCTS.SEARCH, {
        params: {
          ...params,
          page: params.page || 1,
          limit: params.limit || 10,
          sortBy: params.sortBy || 'createdAt',
          sortOrder: params.sortOrder || 'desc'
        },
        withCredentials: true,
      });

      console.log('Search response:', response.data);

      if (!response.data.products) {
        throw new Error('Invalid response format: products array is missing');
      }

      const { products, total, totalPages } = response.data;
      
      if (!Array.isArray(products)) {
        throw new Error('Invalid response format: products is not an array');
      }

      set({
        products,
        totalProducts: total,
        totalPages,
        loading: false,
      });
    } catch (error) {
      console.error('Error in fetchProducts:', error);
      let errorMessage = 'Failed to fetch products';
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          errorMessage = 'No products found';
        } else if (error.response?.data?.details) {
          errorMessage = error.response.data.details;
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },
}));
