'use client'
import { useHomePageCategoryStore } from "@/store/useHomePageCategoryStore";
import { useEffect, useState, Suspense } from "react";
import ProductDetailsSkeleton from "./[id]/productSkeleton";
import ProductCard from "@/components/dashboard/catalogue/ProductCard";
import { useProductStore } from "@/store/useProductStore";
import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter } from "next/navigation";

const HomePageContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { products, loading: productsLoading, fetchProductsForClient, totalPages, currentPage, setCurrentPage } = useProductStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get category from URL params
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams]);

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

  // Fetch products when component mounts or category changes
  useEffect(() => {
    if (selectedCategory) {
      fetchProductsForClient({
        page: 1,
        limit: 20,
        categories: [selectedCategory],
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
    } else {
      // Fetch all products if no category is selected
      fetchProductsForClient({
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
    }
  }, [selectedCategory, fetchProductsForClient]);

  const handleProductClick = (productId: number) => {
    router.push(`/listing/${productId}`);
  };
 
  return (
    <div className="w-full">
      {productsLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading products...</div>
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="space-y-4 mt-8">
            {products.map((product) => (
              <div 
                key={product.id} 
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleProductClick(product.id)}
              >
                <ProductCard product={product} />
              </div>
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
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-500">No products found in this category</div>
        </div>
      )}
    </div>
  );
};

const HomePage = () => (
  <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="text-lg">Loading products...</div></div>}>
    <HomePageContent />
  </Suspense>
);

export default HomePage;