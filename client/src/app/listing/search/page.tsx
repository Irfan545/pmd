"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { API_ROUTES } from "@/utils/api";
import Image from "next/image";

interface PartNumber {
  id: number;
  number: string;
  type: string;
  manufacturer: string;
  isOriginal: boolean;
}

interface Brand {
  id: number;
  name: string;
}

interface Model {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
  type: string;
}

interface ProductWithPartNumbers {
  id: number;
  name: string;
  description: string | null;
  price: number;
  brand: Brand | null;
  model: Model | null;
  category: Category | null;
  imageUrl: string[];
  partNumbers: PartNumber[];
}

const SearchResults = () => {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<ProductWithPartNumbers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const search = searchParams.get("search");
    const category = searchParams.get("category");

    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        if (search) queryParams.set("search", search);
        if (category) queryParams.set("categoryId", category);

        const response = await fetch(`${API_ROUTES.PRODUCTS}?${queryParams.toString()}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error('Search error:', err);
        setError(err instanceof Error ? err.message : "An error occurred while searching");
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchParams]);
  // console.log(products[0].imageUrl)

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Search Results</h1>
      {products.length === 0 ? (
        <div className="text-center text-gray-500">No products found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-4">
                <img 
                  src={product?.imageUrl?.[0] || 'https://placehold.co/600x400'} 
                  alt={product.name} 
                  className="w-full h-40 object-cover" 
                />
                <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                {product.description && (
                  <p className="text-gray-600 mb-2">{product.description}</p>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold">£{product.price.toFixed(2)}</span>
                  {product.brand && (
                    <span className="text-sm text-gray-500">
                      {product.brand.name}
                    </span>
                  )}
                </div>
                {product.model && (
                  <div className="mt-2 text-sm text-gray-500">
                    Model: {product.model.name}
                  </div>
                )}
                {product.category && (
                  <div className="mt-2 text-sm text-gray-500">
                    Category: {product.category.name}
                  </div>
                )}
                {product.partNumbers && product.partNumbers.length > 0 && (
                  <div className="mt-2">
                    <h4 className="text-sm font-semibold mb-1">Part Numbers:</h4>
                    <div className="space-y-1">
                      {product.partNumbers.map((partNumber) => (
                        <div key={partNumber.id} className="text-sm text-gray-600">
                          <span className="font-medium">{partNumber.number}</span>
                          {partNumber.type && (
                            <span className="ml-2 text-gray-500">({partNumber.type})</span>
                          )}
                          {partNumber.isOriginal && (
                            <span className="ml-2 text-green-600">Original</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults; 