'use client'

import { HomePageCategory } from '@/store/useHomePageCategoryStore';
import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoriesSidebarProps {
  categories: HomePageCategory[];
  onCategorySelect: (categoryId: string) => void;
  title?: string;
  className?: string;
  showTitle?: boolean;
  variant?: 'sidebar' | 'dropdown' | 'list';
  loading?: boolean;
  selectedCategoryId?: string | null;
}

const CategoriesSidebar: React.FC<CategoriesSidebarProps> = ({ 
  categories, 
  onCategorySelect, 
  title = "Categories",
  className = "",
  showTitle = true,
  variant = 'sidebar',
  loading = false,
  selectedCategoryId = null
}) => {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

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

  const handleCategoryClick = (id: number, subcategories?: HomePageCategory[]) => {
    if (!subcategories || subcategories.length === 0) {
      onCategorySelect(id.toString());
    } else {
      toggleCategory(id);
    }
  };

  const renderCategory = (category: HomePageCategory, level: number = 0) => {
    const isExpanded = expandedIds.has(category.id);
    const hasSubcategories = category.subcategories && category.subcategories.length > 0;
    const isSelected = selectedCategoryId === category.id.toString();

    const baseClasses = cn(
      "flex items-center justify-between p-2 cursor-pointer transition-colors",
      level > 0 && "pl-6",
      isSelected && "bg-primary text-primary-foreground",
      !isSelected && isExpanded && "bg-accent text-accent-foreground",
      !isSelected && !isExpanded && "hover:bg-gray-100"
    );

    const containerClasses = cn(
      "w-full",
      variant === 'dropdown' && "border-b border-gray-200 last:border-b-0",
      variant === 'list' && "mb-1"
    );

    return (
      <div key={category.id} className={containerClasses}>
        <div
          className={baseClasses}
          onClick={() => handleCategoryClick(category.id, category.subcategories)}
        >
          <span className={cn(
            "text-sm font-medium",
            variant === 'dropdown' && "text-base",
            variant === 'list' && "text-sm"
          )}>
            {category.name}
          </span>
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

  const containerClasses = cn(
    "w-full",
    variant === 'sidebar' && "bg-white shadow-sm rounded-lg overflow-hidden",
    variant === 'dropdown' && "bg-white border border-gray-200 rounded-md overflow-hidden",
    variant === 'list' && "space-y-1",
    className
  );

  if (loading) {
    return (
      <div className={containerClasses}>
        {showTitle && <h2 className="text-lg font-semibold mb-4 p-4">{title}</h2>}
        <div className="p-4 space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      {showTitle && (
        <h2 className={cn(
          "font-semibold mb-4",
          variant === 'sidebar' && "text-lg p-4 border-b border-gray-200",
          variant === 'dropdown' && "text-base p-3 bg-gray-50",
          variant === 'list' && "text-sm font-medium"
        )}>
          {title}
        </h2>
      )}
      <div className={cn(
        variant === 'sidebar' && "p-2",
        variant === 'dropdown' && "p-2",
        variant === 'list' && "px-2"
      )}>
        {categories.length === 0 ? (
          <div className="text-gray-500 text-sm p-2">No categories available</div>
        ) : (
          categories.map((category) => renderCategory(category))
        )}
      </div>
    </div>
  );
};

export default CategoriesSidebar; 