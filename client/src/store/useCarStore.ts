import { API_ROUTES } from "@/utils/api";
import axios from "axios";
import { create } from "zustand";

interface Brand {
  id: number;
  name: string;
}

interface Model {
  id: number;
  brandId: number;
  name: string;
  yearStart?: number;
  yearEnd?: number;
}

interface Engine {
  id: number;
  modelId: number;
  type?: string;
  displacement?: string;
  horsepower?: number;
}

interface CarState {
  brands: Brand[];
  models: Model[];
  engines: Engine[];
  loading: boolean;
  error: string | null;
  fetchBrands: () => Promise<void>;
  fetchModelsByBrand: (brandId: number) => Promise<void>;
  fetchEnginesByModel: (modelId: number) => Promise<void>;
}

export const useCarStore = create<CarState>((set) => ({
  brands: [],
  models: [],
  engines: [],
  loading: false,
  error: null,
  fetchBrands: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_ROUTES.CARS}/brands`);
      set({ brands: response.data, loading: false });
      console.log(response.data, "response.data");
    } catch (error) {
      set({ error: "Failed to fetch brands", loading: false });
    }
  },
  fetchModelsByBrand: async (brandId: number) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(
        `${API_ROUTES.CARS}/brands/${brandId}/models`
      );
      set({ models: response.data, loading: false });
    } catch (error) {
      set({ error: "Failed to fetch models", loading: false });
    }
  },
  fetchEnginesByModel: async (modelId: number) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(
        `${API_ROUTES.CARS}/models/${modelId}/engines`
      );
      set({ engines: response.data, loading: false });
    } catch (error) {
      set({ error: "Failed to fetch engines", loading: false });
    }
  },
}));
