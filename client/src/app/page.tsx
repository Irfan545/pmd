"use client";

import SearchBar from "@/components/common/SearchBar";
import CategoriesSidebar from "@/components/common/CategoriesSidebar";
import Categories from "@/components/dashboard/category";
import { Button } from "@/components/ui/button";
import { useCategoryStore } from "@/store/useCategoryStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Image from "./../../public/images/F1_Banner.png"
import CarPartsSearch from "@/components/CarPartsSearch";

const gridItems = [
  {
    title: "Oil Additives",
    subtitle: "Cleaner engines, better mileage",
    image:
      "https://media.istockphoto.com/id/2127482957/photo/engine-oil-maintenance-vehicle-service-000-maintenance.jpg?s=2048x2048&w=is&k=20&c=zDwirMlXARfzCub-KYFv3hW4WgzP73MO-6fdkC8FKqI=",
  },
  {
    title: "Breaking",
    subtitle: "Brake components you can rely on",
    image:
      "https://media.istockphoto.com/id/1193247877/photo/handsome-mechanic-in-uniform.jpg?s=2048x2048&w=is&k=20&c=dqhC8q-oOtEDw8NF2_vC-X73CSMBZZJqLQyY9MmtAfY=",
  },
  {
    title: "Filters",
    subtitle: "From air to oil, our filters trap what others miss ",
    image:
      "https://media.istockphoto.com/id/1472450130/photo/the-composition-different-car-accessories.jpg?s=2048x2048&w=is&k=20&c=u8vCZHSprDwmUxX3VSyb9PqAoiJZSupDvOlMuEVu1ow=",
  },
  {
    title: "Wiper Blades",
    subtitle: "Wipers that last through the toughest weather.",
    image:
      "https://media.istockphoto.com/id/612655834/photo/man-hand-picking-up-windscreen-wiper.jpg?s=612x612&w=0&k=20&c=8J5dN-Y6V1zMgx0Bf9gTuXU7LlNV1Mi0yKrgDDXBMuw=",
  },
];

function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { banners, featuredProducts, fetchFeaturedProducts, fetchBanners } = useSettingsStore();
  const { categories, fetchCategories, loading: categoriesLoading } = useCategoryStore();
  const router = useRouter();

  // Memoize the fetch functions to prevent unnecessary re-renders
  const fetchData = useCallback(async () => {
    try {
      await Promise.all([
        fetchBanners(),
        fetchFeaturedProducts(),
        fetchCategories()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [fetchBanners, fetchFeaturedProducts, fetchCategories]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Banner timer effect
  useEffect(() => {
    if (!banners.length) return;

    const bannerTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(bannerTimer);
  }, [banners.length]);

  const handleCategorySelect = useCallback((categoryId: string) => {
    router.push(`/listing?category=${categoryId}`);
  }, [router]);

  return (
    <>
      {/* <div className="container mx-auto px-4">
      </div> */}
      <div className="min-h-screen bg-white">
        <section className="relative h-[600px] flex">
          <div className="container mx-auto flex">
            {/* Left side - Dropdown menus */}
            <CarPartsSearch/>

            {/* Right side - Image slider */}
            <div className="w-3/6 h-4/6 relative">
              {banners.map((bannerItem, index) => (
                <div
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    currentSlide === index ? "opacity-100" : "opacity-0"
                  }`}
                  key={bannerItem.id}
                >
                  <div className="relative h-full">
                    <img
                      src={bannerItem.imageUrl}
                      alt={`Banner ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20" />
                  </div>
                </div>
              ))}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      currentSlide === index
                        ? "bg-white w-6"
                        : "bg-white/50 hover:bg-white/75"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Categories section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-center text-3xl font-semibold mb-2">
              Browse by Category
            </h2>
            <p className="text-center text-gray-500 mb-8">
              Find the parts you need by category
            </p>
            <div className="max-w-4xl mx-auto">
              <CategoriesSidebar 
                categories={categories} 
                onCategorySelect={handleCategorySelect}
                loading={categoriesLoading}
                title=""
                variant="list"
                showTitle={false}
                className="bg-white shadow-lg rounded-lg"
              />
            </div>
          </div>
        </section>

        {/* grid section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-center text-3xl font-semibold mb-2">
            Buy car parts online            </h2>
            <p className="text-center text-gray-500 mb-8">
              Tested. Trusted. Delivered. The parts your car depends on.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {gridItems.map((gridItem, index) => (
                <div key={index} className="relative group overflow-hidden cursor-pointer" onClick={() => router.push('/listing')}>
                  <div className="aspect-[5/4]">
                    <img
                      src={gridItem.image}
                      alt={gridItem.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-25 flex items-center justify-center opacity-100 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="text-center text-white p-4">
                      <h3 className="text-xl font-semibold mb-2">
                        {gridItem.title}
                      </h3>
                      <p className="text-sm">{gridItem.subtitle}</p>
                      {/* <Button 
                        className="mt-4 bg-white text-black hover:bg-gray-100"
                        onClick={() => router.push('/listing')}
                      >
                        SHOP NOW
                      </Button> */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature products section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-center text-2xl font-semibold mb-2">
             Our Best sellers: buy auto car parts online at a good price
            </h2>
            <p className="text-center text-gray-500 mb-8">
              Shop our best sellers from established brands
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredProducts.map((productItem) => {
                const productId = typeof productItem.id === 'number' ? productItem.id : parseInt(productItem.id);
                return (
                  <div 
                    key={productId} 
                    className="relative group overflow-hidden cursor-pointer" 
                    onClick={() => router.push(`/listing/${productId}`)}
                  >
                    <div className="aspect-[3/4]">
                      <img
                        src={productItem.images?.[0] || Image.src}
                        alt={productItem.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="text-center text-white p-4">
                        <h3 className="text-xl font-semibold mb-2">
                          {productItem.name}
                        </h3>
                        <p className="text-sm">£{productItem.price.toFixed(2)}</p>
                        <Button 
                          className="mt-4 bg-white text-black hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/listing/${productId}`);
                          }}
                        >
                          QUICK VIEW
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16">

        </section>
      </div>
    </>
  );
}

export default HomePage;

