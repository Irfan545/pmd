"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useProductStore } from "@/store/useProductStore";
import { Product } from "@/store/useProductStore";
import { API_ROUTES } from "@/utils/api";
import Image from "next/image";
import { Button } from "@/components/ui/button";

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
  const router = useRouter();
  const { products, loading, error, fetchProducts, currentPage, totalPages, setCurrentPage } = useProductStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const search = searchParams.get("search");
    const category = searchParams.get("category");

    if (search) {
      setSearchTerm(search);
      fetchProducts({
        search,
        categoryId: category ? parseInt(category) : undefined,
        page: currentPage,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }).catch(error => {
        console.error('Error fetching products:', error);
      });
    }
  }, [searchParams, currentPage, fetchProducts, isClient]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (!isClient) {
    return null; // Return null on server-side
  }

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Search Results for "{searchTerm}"
      </h1>
      {products.length === 0 ? (
        <div className="text-center text-gray-500">No products found</div>
      ) : (
        <>
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
                        {typeof product.brand === 'string' ? product.brand : product.brand.name}
                      </span>
                    )}
                  </div>
                  {product.model && (
                    <div className="mt-2 text-sm text-gray-500">
                      Model: {typeof product.model === 'string' ? product.model : product.model.name}
                    </div>
                  )}
                  {product.category && (
                    <div className="mt-2 text-sm text-gray-500">
                      Category: {typeof product.category === 'string' ? product.category : product.category.name}
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
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="mx-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchResults; 