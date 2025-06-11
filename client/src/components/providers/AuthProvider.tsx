"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
//   const { verify } = useAuthStore();

//   useEffect(() => {
//     verify();
//   }, [verify]);

  return <>{children}</>;
} 