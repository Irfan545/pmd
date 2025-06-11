"use client";

import { usePathname } from "next/navigation";
import Header from "../user/header";
import SearchBar from "./SearchBar";
import UsefulLinks from "./Navbar";

const pathsNotToShowHeaders = ["/auth", "/super-admin"];

function CommonLayout({ children }: { children: React.ReactNode }) {
  const pathName = usePathname();

  const showHeader = !pathsNotToShowHeaders.some((currentPath) =>
    pathName.startsWith(currentPath)
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full bg-background shadow-sm border-b border-border  mb-10">
        <div className="container mx-auto">
      {showHeader && <div className="">
        <Header />
        <SearchBar
          className="w-3/5 mx-auto mt-8 mb-8"
          buttonClassName="rounded-none text-secondary bg-primary hover:bg-accent hover:text-primary"
          inputClassName="rounded-none bg-white "
          placeholder="Search by part number or name"
        />
        <UsefulLinks/>
        </div>
      }
      </div>
      </div>
      <main>{children}</main>
    </div>
  );
}

export default CommonLayout;
