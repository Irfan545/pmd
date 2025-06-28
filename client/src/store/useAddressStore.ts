import { API_ROUTES } from "@/utils/api";
import axios from "axios";
import { create } from "zustand";

export interface Address {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;
}

interface AddressStore {
  addresses: Address[];
  isLoading: boolean;
  error: string | null;
  fetchAddresses: () => Promise<void>;
  createAddress: (address: Omit<Address, "id">) => Promise<Address | null>;
  updateAddress: (
    id: string,
    address: Partial<Address>
  ) => Promise<Address | null>;
  deleteAddress: (id: string) => Promise<boolean>;
}

export const useAddressStore = create<AddressStore>((set, get) => ({
  addresses: [],
  isLoading: false,
  error: null,
  fetchAddresses: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}${API_ROUTES.ADDRESS.GET_ALL}`,
        { withCredentials: true }
      );
      set({ isLoading: false, addresses: response.data.address || [] });
      return response.data.address;
    } catch (error) {
      console.error("Address fetch error:", error);
      set({ error: "Failed to fetch addresses", isLoading: false, addresses: [] });
      return null;
    }
  },
  createAddress: async (address) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}${API_ROUTES.ADDRESS.ADD}`,
        address,
        {
          withCredentials: true,
        }
      );

      const newAddress = response.data.address;

      set((state) => ({
        addresses: [newAddress, ...state.addresses],
        isLoading: false,
      }));

      return newAddress;
    } catch (e) {
      set({ isLoading: false, error: "Failed to create address" });
      return null;
    }
  },
  updateAddress: async (id, address) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}${API_ROUTES.ADDRESS.UPDATE}/${id}`,
        address,
        {
          withCredentials: true,
        }
      );

      const updatedAddress = response.data.address;

      set((state) => ({
        addresses: state.addresses.map((item) =>
          item.id === id ? updatedAddress : item
        ),
        isLoading: false,
      }));

      return updatedAddress;
    } catch (e) {
      set({ isLoading: false, error: "Failed to update address" });
      return null;
    }
  },
  deleteAddress: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}${API_ROUTES.ADDRESS.DELETE}/${id}`, {
        withCredentials: true,
      });

      set((state) => ({
        addresses: state.addresses.filter((address) => address.id !== id),
        isLoading: false,
      }));

      return true;
    } catch (e) {
      set({ isLoading: false, error: "Failed to delete address" });
      return false;
    }
  },
}));
