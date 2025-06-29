"use client";
import React, { useEffect, useState } from "react";
import { useHomePageCategoryStore, HomePageCategory } from "@/store/useHomePageCategoryStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const LoadingSkeleton = () => (
  <div className="flex gap-4 p-4">
    <div className="flex justify-between items-center mb-6">
      <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
    </div>
    <div className="mb-6 flex gap-4">
      <div className="max-w-md h-10 bg-gray-200 rounded animate-pulse"></div>
      <div className="w-[200px] h-10 bg-gray-200 rounded animate-pulse"></div>
    </div>
    <div className="space-y-4 w-full">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-gray-200 animate-pulse rounded"></div>
              </div>
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="flex justify-between items-center">
                  <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Catalogue = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { 
    categories, 
    selectedCategory, 
    products, 
    loading, 
    error,
    totalPages,
    setSelectedCategory,
    fetchProductsByCategory,
    clearProducts
  } = useHomePageCategoryStore();

  // Handle category selection
  useEffect(() => {
    if (selectedCategory) {
      console.log('Selected category changed:', selectedCategory);
      fetchProductsByCategory(selectedCategory.id, currentPage, 20);
    } else {
      clearProducts();
    }
  }, [selectedCategory, currentPage, fetchProductsByCategory, clearProducts]);

  // Filter products based on search query
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const findCategoryById = (categories: HomePageCategory[], id: string) => {
    // First check main categories
    const mainCategory = categories.find(cat => cat.id.toString() === id);
    if (mainCategory) return mainCategory;

    // Then check subcategories
    for (const category of categories) {
      const subcategory = category.subcategories?.find((sub: HomePageCategory) => sub.id.toString() === id);
      if (subcategory) return subcategory;
    }
    return null;
  };

  const handleCategoryChange = (categoryId: string) => {
    console.log('Category change triggered with ID:', categoryId);
    if (categoryId === "all") {
      setSelectedCategory(null);
      setCurrentPage(1);
      return;
    }

    const category = findCategoryById(categories, categoryId);
    console.log('Found category:', category);
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page when changing category
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleProductClick = (productId: number) => {
    router.push(`/listing/${productId}`);
  };

  if (loading) return <LoadingSkeleton />;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Catalogue</h1>
      </div>

      <div className="mb-6 flex flex-col gap-4">
        <div className="flex gap-4">
          <Input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
          <Select
            value={selectedCategory?.id.toString() || ""}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <React.Fragment key={category.id}>
                  <SelectItem value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                  {category.subcategories?.map((subcategory) => (
                    <SelectItem 
                      key={subcategory.id} 
                      value={subcategory.id.toString()}
                      className="pl-6"
                    >
                      {subcategory.name}
                    </SelectItem>
                  ))}
                </React.Fragment>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No products found
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleProductClick(product.id)}
              >
                <div className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <img 
                        src={product.images?.[0] || 'https://placehold.co/600x400'} 
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
                size="icon"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Catalogue;
