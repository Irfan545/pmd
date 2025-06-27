"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import SearchBar from "../common/SearchBar";
import Link from "next/link";

const Header = () => {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  return (
    <div className="pt-6">
      <div className="constainer-fluid">
        <SearchBar
          className="flex"
          buttonClassName="rounded-none ml-4 pt-1.5 pb-1.5 pl-10 pr-10 bg-primary text-white hover:bg-accent"
          inputClassName="bg-white rounded-none border border-black pt-1.5 pb-1.5 pl-10 pr-10 w-full"
          placeholder="Search by product name, category, description, or part number..."
          showCategoryFilter={true}
        />
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
