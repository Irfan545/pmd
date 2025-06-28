"use client";
import React, { useEffect, useState, Suspense } from "react";
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

const SearchResultsContent = () => {
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
        limit: 20,
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

  const handleProductClick = (productId: number) => {
    router.push(`/listing/${productId}`);
  };

  if (!isClient) {
    return null; // Return null on server-side
  }

  if (loading) return <div className="flex justify-center items-center h-64"><div className="text-lg">Loading...</div></div>;
  if (error) return <div className="flex justify-center items-center h-64"><div className="text-lg text-red-500">Error: {error}</div></div>;

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-4">
        Search Results for "{searchTerm}"
      </h1>
      {products.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-500">No products found</div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleProductClick(product.id)}
              >
                <div className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <img 
                        src={product?.imageUrl?.[0] || 'https://placehold.co/600x400'} 
                        alt={product.name} 
                        className="w-24 h-24 object-cover rounded" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                      {product.description && (
                        <p className="text-gray-600 mb-2 text-sm line-clamp-2">{product.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          {product.brand && (
                            <span>
                              Brand: {typeof product.brand === 'string' ? product.brand : product.brand.name}
                            </span>
                          )}
                          {product.model && (
                            <span>
                              Model: {typeof product.model === 'string' ? product.model : product.model.name}
                            </span>
                          )}
                          {product.category && (
                            <span>
                              Category: {typeof product.category === 'string' ? product.category : product.category.name}
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-bold">£{product.price.toFixed(2)}</span>
                        </div>
                      </div>
                      {product.partNumbers && product.partNumbers.length > 0 && (
                        <div className="mt-2">
                          <h4 className="text-sm font-semibold mb-1">Part Numbers:</h4>
                          <div className="flex flex-wrap gap-2">
                            {product.partNumbers.map((partNumber) => (
                              <div key={partNumber.id} className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                <span className="font-medium">{partNumber.number}</span>
                                {partNumber.type && (
                                  <span className="ml-1 text-gray-500">({partNumber.type})</span>
                                )}
                                {partNumber.isOriginal && (
                                  <span className="ml-1 text-green-600">Original</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
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

const SearchResults = () => {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="text-lg">Loading search...</div></div>}>
      <SearchResultsContent />
    </Suspense>
  );
};

export default SearchResults; 