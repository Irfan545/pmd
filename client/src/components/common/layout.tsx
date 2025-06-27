"use client";

import { usePathname } from "next/navigation";
import Header from "../user/header";
import SearchBar from "./SearchBar";
import CategoriesSidebar from "./CategoriesSidebar";
import UsefulLinks from "./Navbar";
import Footer from "./footer";
import { useHomePageCategoryStore } from "@/store/useHomePageCategoryStore";
import { useEffect } from "react";

const pathsNotToShowHeaders = ["/auth", "/super-admin"];

function CommonLayout({ children }: { children: React.ReactNode }) {
  const pathName = usePathname();
  const { categories, fetchHomePageCategories, loading: categoriesLoading } = useHomePageCategoryStore();

  useEffect(() => {
    fetchHomePageCategories();
  }, [fetchHomePageCategories]);

  const showHeader = !pathsNotToShowHeaders.some((currentPath) =>
    pathName.startsWith(currentPath)
  );

  const showFooter = !pathsNotToShowHeaders.some((currentPath) =>
    pathName.startsWith(currentPath)
  );

  const handleCategorySelect = (categoryId: string) => {
    // Navigate to listing page with category filter
    window.location.href = `/listing?category=${categoryId}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full bg-background shadow-sm border-b border-border  mb-10">
        <div className="container mx-auto">
      {showHeader && <div className="">
        <Header />
        <SearchBar
          className="w-4/5 mx-auto mt-8 mb-8"
          buttonClassName="rounded-none text-secondary bg-primary hover:bg-accent hover:text-primary"
          inputClassName="rounded-none bg-white border-gray-300"
          placeholder="Search by product name, category, description, or part number"
          showCategoryFilter={true}
        />
        <UsefulLinks/>
        </div>
      }
      </div>
      </div>
      
      {/* Categories Sidebar - Show on listing and search pages */}
      {(pathName.startsWith('/listing') || pathName.startsWith('/search')) && (
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-64">
              <CategoriesSidebar 
                categories={categories} 
                onCategorySelect={handleCategorySelect}
                loading={categoriesLoading}
                title="Categories"
                variant="sidebar"
                showTitle={true}
              />
            </div>
            <div className="flex-1">
              {children}
            </div>
          </div>
        </div>
      )}
      
      {/* Regular content for other pages */}
      {!pathName.startsWith('/listing') && !pathName.startsWith('/search') && (
        <main>{children}</main>
      )}
      
      {showFooter && <Footer />}
    </div>
  );
}

export default CommonLayout;
