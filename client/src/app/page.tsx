"use client";

import SearchBar from "@/components/common/SearchBar";
import Categories from "@/components/dashboard/category";
import { Button } from "@/components/ui/button";
import { useCategoryStore } from "@/store/useCategoryStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

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
  const { banners, featuredProducts, fetchFeaturedProducts, fetchBanners } =
    useSettingsStore();
  const { categories, fetchCategories } = useCategoryStore();
  const router = useRouter();

  // Memoize the fetch functions to prevent unnecessary re-renders
  const fetchData = useCallback(async () => {
    await Promise.all([
      fetchBanners(),
      fetchFeaturedProducts(),
      fetchCategories()
    ]);
  }, [fetchBanners, fetchFeaturedProducts, fetchCategories]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (banners.length > 0) {
      const bannerTimer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % banners.length);
      }, 5000);

      return () => clearInterval(bannerTimer);
    }
  }, [banners]);

  const handleCategorySelect = useCallback((categoryId: string) => {
    // Handle category selection
  }, []);

  return (<>
  <div className="container mx-auto px-4">
    <SearchBar
      className="w-3/5 mx-auto mt-10 mb-10"
      buttonClassName="rounded-none bg-primary hover:bg-accent"
      inputClassName="rounded-none"
      placeholder="Search for products..."
    />
    {/* {categories.length > 0 && (
      <div className="mt-4 max-w-xs mx-auto">
        <Categories categories={categories} onCategorySelect={handleCategorySelect} />
      </div>
    )} */}
  </div>
    <div className="min-h-screen bg-white">
      <section className="relative h-[600px] overflow-hidden">
        {banners.map((bannerItem, index) => (
          <div
            className={`absolute inset-0 transition-opacity duration-1000 ${
              currentSlide === index ? "opacity-100" : "opacity-0"
            }`}
            key={bannerItem.id}
          >
            <div className="absolute inset-0">
              <img
                src={bannerItem.imageUrl}
                alt={`Banner ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-20" />
            </div>
            <div className="relative h-full container mx-auto px-4 flex items-center">
              <div className="text-white space-y-6">
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight ">
                  AI MOTOR SPARES
                  <br />
                  
                  Built to Fit. Made to Last.
                </h1>
                <p className="text-lg">
                Power Every Drive. Precision in Every Part.
                  <br />
OEM-quality parts, tested and trusted by professionals.
                </p>
                <Button className="bg-white text-black hover:bg-accent px-8 py-6 text-lg rounded-none" onClick={() => router.push('/listing')}>
                  SHOP NOW
                </Button>
              </div>
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
      </section>

      {/* grid section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-semibold mb-2">
            OUR PRODUCTS
          </h2>
          <p className="text-center text-gray-500 mb-8">
          Tested. Trusted. Delivered. The parts your car depends on.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {gridItems.map((gridItem, index) => (
              <div key={index} className="relative group overflow-hidden">
                <div className="aspect-[3/4]">
                  <img
                    src={gridItem.image}
                    alt={gridItem.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="text-center text-white p-4">
                    <h3 className="text-xl font-semibold mb-2">
                      {gridItem.title}
                    </h3>
                    <p className="text-sm">{gridItem.subtitle}</p>
                    <Button className="mt-4 bg-white text-black hover:bg-gray-100">
                      SHOP NOW
                    </Button>
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
          <h2 className="text-center text-3xl font-semibold mb-2">
            NEW ARRIVALS
          </h2>
          <p className="text-center text-gray-500 mb-8">
            Shop our new arrivals from established brands
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredProducts.map((productItem, index) => (
              <div key={index} className="relative group overflow-hidden">
                <div className="aspect-[3/4]">
                  <img
                    src={productItem.images[0]}
                    alt={productItem.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="text-center text-white p-4">
                    <h3 className="text-xl font-semibold mb-2">
                      {productItem.name}
                    </h3>
                    <p className="text-sm">{productItem.price}</p>
                    <Button className="mt-4 bg-white text-black hover:bg-gray-100">
                      QUICK ViEW
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  </>
  );
}

export default HomePage;

