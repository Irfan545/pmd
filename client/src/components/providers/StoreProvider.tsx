"use client";

import React, { useEffect, useState } from "react";
import { useHomePageCategoryStore } from "@/store/useHomePageCategoryStore";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const LoadingSkeleton = () => (
  <div className="flex gap-4 p-4">
    <div className="flex justify-between items-center mb-6">
      <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
    </div>
    <div className="mb-6 flex gap-4">
      <div className="max-w-md h-10 bg-gray-200 rounded animate-pulse"></div>
      <div className="w-[200px] h-10 bg-gray-200 rounded animate-pulse"></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow overflow-hidden">
          <div className="h-48 bg-gray-200 animate-pulse"></div>
          <div className="p-4">
            <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="flex justify-between items-center">
              <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ErrorFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
    <h2 className="text-xl font-semibold text-red-600 mb-2">Failed to load store data</h2>
    <p className="text-gray-600 mb-4">Please try refreshing the page</p>
    <button
      onClick={() => window.location.reload()}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
    >
      Retry
    </button>
  </div>
);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const fetchHomePageCategories = useHomePageCategoryStore(state => state.fetchHomePageCategories);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const initializeStore = async () => {
      try {
        await fetchHomePageCategories();
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize store:", error);
        setIsInitialized(true); // Still set to true to prevent infinite loading
      }
    };

    initializeStore();
  }, [isClient, fetchHomePageCategories]);

  if (!isClient || !isInitialized) {
    return <LoadingSkeleton />;
  }

  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      {children}
    </ErrorBoundary>
  );
} 