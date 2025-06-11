"use client";
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
import { useHomePageCategoryStore } from "@/store/useHomePageCategoryStore";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";

const Header = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const { categories, fetchHomePageCategories } = useHomePageCategoryStore();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    fetchHomePageCategories();
  }, [fetchHomePageCategories]);

  const handleSearch = () => {
    const queryParams = new URLSearchParams();
    if (searchQuery) queryParams.set('search', searchQuery);
    if (selectedCategory && selectedCategory !== 'all') queryParams.set('category', selectedCategory);
    
    router.push(`/search?${queryParams.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  return (
    <div className="pt-6">
      <div className="constainer-fluid">
        <div className="search-bar flex">
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="bg-white rounded-none border border-black pt-1.5 pl-1.5 pr-1.5 pb-1.5 text- outline-0 mr-2 w-[396px]">
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
          <Input
            type="text"
            className="bg-white rounded-none border border-black pt-1.5 pb-1.5 pl-10 pr-10 w-full"
            placeholder="I'm looking for..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button 
            className="rounded-none ml-4 pt-1.5 pb-1.5 pl-10 pr-10 bg-primary text-white hover:bg-accent"
            onClick={handleSearch}
          >
            Search
          </Button>
        </div>
      </div>
{/*       
      <div className="navbar-header">
        <a href="#" className=" ">
          {" "}
          Home
        </a>
        <a href="#" className=" ">
          {" "}
          LV Parts
        </a>
        <a href="#" className=" ">
          {" "}
          CV Parts
        </a>
        <a href="#" className=" ">
          {" "}
          Maintenance and Accessories
        </a>

        <a href="#">
          Vehicle Search <b className="caret"></b>{" "}
        </a>
        <a href="#" className=" ">
          {" "}
          Applications
        </a>
        <a href="#" className=" ">
          {" "}
          CV parts Extra
        </a>
        <a href="#" className=" ">
          {" "}
          Orders History
        </a>
      </div> */}
    </div>
  );
};

export default Header;
