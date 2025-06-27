"use client";

/**
 * Enhanced SearchBar Component
 * 
 * Features:
 * - Search by product name, category, description, or part number
 * - Category filtering dropdown
 * - Customizable styling and behavior
 * - Optional category filter (can be disabled)
 * 
 * Usage Examples:
 * 
 * // Basic usage with category filter
 * <SearchBar />
 * 
 * // Without category filter
 * <SearchBar showCategoryFilter={false} />
 * 
 * // Custom search handler
 * <SearchBar onSearch={(query, category) => {
 *   console.log('Search:', query, 'Category:', category);
 * }} />
 * 
 * // Pre-filled search
 * <SearchBar initialQuery="oil filter" initialCategory="5" />
 */

import React, { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useRouter } from "next/navigation";
import { SearchIcon } from "lucide-react";
import { useHomePageCategoryStore } from "@/store/useHomePageCategoryStore";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string, category?: string) => void;
  initialQuery?: string;
  initialCategory?: string;
  buttonText?: string;
  buttonClassName?: string;
  inputClassName?: string;
  showCategoryFilter?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search by product name, category, description, or part number...",
  className = "",
  onSearch,
  initialQuery = "",
  initialCategory = "",
  buttonText = "Search",
  buttonClassName = "",
  inputClassName = "",
  showCategoryFilter = true,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const router = useRouter();
  const { categories, fetchHomePageCategories } = useHomePageCategoryStore();

  useEffect(() => {
    fetchHomePageCategories();
  }, [fetchHomePageCategories]);

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchQuery, selectedCategory);
    } else {
      // Default behavior: navigate to search page with query and category
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.set('search', searchQuery);
      if (selectedCategory && selectedCategory !== 'all') queryParams.set('category', selectedCategory);
      router.push(`/search?${queryParams.toString()}`, { scroll: false });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      {showCategoryFilter && (
        <Select
          value={selectedCategory}
          onValueChange={setSelectedCategory}
        >
          <SelectTrigger className="bg-white rounded-none border border-gray-300 pt-1.5 pl-1.5 pr-1.5 pb-1.5 text-outline-0 mr-2 w-[200px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyPress}
        className={`flex-1 ${inputClassName}`}
      />
      <Button 
        onClick={handleSearch}
        className={buttonClassName}
      >
       <SearchIcon className="w-4 h-4" /> {buttonText}
      </Button>
    </div>
  );
};

export default SearchBar; 