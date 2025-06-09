'use client'
import Categories from "@/components/dashboard/category";
import { useHomePageCategoryStore } from "@/store/useHomePageCategoryStore";
import { useEffect, useState } from "react";
import ProductDetailsSkeleton from "./[id]/productSkeleton";
import ProductCard from "@/components/dashboard/catalogue/ProductCard";
import { useProductStore } from "@/store/useProductStore";
import { Button } from "@/components/ui/button";

const HomePage = () => {
  const { categories, fetchHomePageCategories, loading: categoriesLoading } = useHomePageCategoryStore();
  const { products, loading: productsLoading, fetchProductsForClient, totalPages, currentPage, setCurrentPage } = useProductStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchHomePageCategories();
  }, [fetchHomePageCategories]);

  const handlePageChange = async (page: number) => {
    console.log('Changing page to:', page);
    setCurrentPage(page);
    try {
      await fetchProductsForClient({
        page,
        limit: 20,
        categories: selectedCategory ? [selectedCategory] : undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      console.log('Products fetched for page:', page);
    } catch (error) {
      console.error('Error fetching products for page:', page, error);
    }
  };
 
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64">
          <h1 className="text-2xl font-bold mb-4">Categories</h1>
          {categoriesLoading ? (
            <div>Loading categories...</div>
          ) : (
            <Categories 
              categories={categories} 
              onCategorySelect={(categoryId) => {
                setSelectedCategory(categoryId);
                setCurrentPage(1); // Reset to first page when category changes
              }}
            />
          )}
        </div>
        <div className="flex-1">
          <div className="w-full">
            {productsLoading ? (
              <div>Loading products...</div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                {/* Pagination Controls */}
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
            ) : (
              <div>No products found in this category</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;