'use client'

import { HomePageCategory, useHomePageCategoryStore } from '@/store/useHomePageCategoryStore';
import { useProductStore } from '@/store/useProductStore';
import React, { useEffect, useState } from 'react';
import ProductCard from './catalogue/ProductCard';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoriesProps {
  categories: HomePageCategory[];
  onCategorySelect: (categoryId: string) => void;
}

const Categories = ({ categories, onCategorySelect }: CategoriesProps) => {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const { setSelectedCategory } = useHomePageCategoryStore();
  const { products, loading, fetchProductsForClient } = useProductStore();

  // Debug: Log categories structure
  useEffect(() => {
    console.log('Categories received in Categories component:', categories);
    if (categories && categories.length > 0) {
      console.log('First category structure:', categories[0]);
      console.log('First category subcategories:', categories[0].subcategories);
    }
  }, [categories]);

  const toggleCategory = (id: number) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleClick = async (id: number, subcategories?: HomePageCategory[]) => {
    console.log('Category clicked:', { id, subcategories });
    if (!subcategories || subcategories.length === 0) {
      console.log('Fetching products for category:', id);
      try {
        setSelectedCategory({
          id: id,
          name: '',
          subcategories: [],
          parentId: null
        });
        onCategorySelect(id.toString());
        await fetchProductsForClient({
          page: 1,
          limit: 20,
          categories: [id.toString()],
          sortBy: 'createdAt',
          sortOrder: 'desc'
        });
        console.log('Products fetched successfully');
      } catch (error) {
        console.error('Failed to fetch products:', error);
        return;
      }
    } else {
      toggleCategory(id);
    }
  };

  const renderCategory = (category: HomePageCategory, level: number = 0) => {
    const isExpanded = expandedIds.has(category.id);
    const hasSubcategories = category.subcategories && category.subcategories.length > 0;

    return (
      <div key={category.id} className="w-full">
        <div
          className={cn(
            "flex items-center justify-between p-2 cursor-pointer transition-colors",
            level > 0 && "pl-6",
            isExpanded 
              ? "bg-accent text-accent-foreground" 
              : "hover:bg-gray-100"
          )}
          onClick={() => handleClick(category.id, category.subcategories)}
        >
          <span className="text-sm font-medium">{category.name}</span>
          {hasSubcategories && (
            <ChevronRight
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                isExpanded && "transform rotate-90"
              )}
            />
          )}
        </div>
        {hasSubcategories && (
          <div
            className={cn(
              "overflow-hidden transition-all duration-300 ease-in-out",
              isExpanded ? "max-h-[1000px]" : "max-h-0"
            )}
          >
            {category.subcategories.map((subcategory) => renderCategory(subcategory, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full bg-white shadow-sm rounded-lg overflow-hidden">
      {categories.map((category) => renderCategory(category))}
    </div>
  );
};

export default Categories;
