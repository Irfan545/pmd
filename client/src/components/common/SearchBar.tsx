"use client";

import React, { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { SearchIcon } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
  initialQuery?: string;
  buttonText?: string;
  buttonClassName?: string;
  inputClassName?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search...",
  className = "",
  onSearch,
  initialQuery = "",
  buttonText = "Search",
  buttonClassName = "",
  inputClassName = "",
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const router = useRouter();

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      // Default behavior: navigate to search page with query
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.set('search', searchQuery);
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
      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyPress}
        className={inputClassName}
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