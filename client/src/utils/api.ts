const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
// Ensure BASE_URL is properly defined
if (!BASE_URL) {
  console.error('API_BASE_URL is not defined');
}

export const API_ROUTES = {
  AUTH: `${BASE_URL}/api/auth`,
  PRODUCTS: `${BASE_URL}/api/products`,
  CATEGORIES: `${BASE_URL}/api/categories`,
  HOME_CATEGORIES: `${BASE_URL}/api/home-categories`,
  CARS: `${BASE_URL}/api/cars`,
  COUPON: `${BASE_URL}/api/coupon`,
  SETTINGS: `${BASE_URL}/api/settings`,
  CART: `${BASE_URL}/api/cart`,
  ADDRESS: `${BASE_URL}/api/address`,
  ORDER: `${BASE_URL}/api/order`,
} as const;
// Validate API routes
Object.entries(API_ROUTES).forEach(([key, value]) => {
  if (!value) {
    console.error(`API route ${key} is not properly defined`);
  }
});