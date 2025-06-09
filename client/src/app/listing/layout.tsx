import React from "react";
import Header from "@/components/dashboard/header";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="max-w-7xl px-4 mx-auto">
      <Header />
      {children}
    </div>
  );
};

export default layout;
