"use client";
import Image from "next/image";
import React, { useState } from "react";
import banner from "../../../../public/images/login_banner.jpg";
import logo from "../../../../public/images/logo.png";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ProtectLoginActions } from "@/actions/auth";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading } = useAuthStore();
  const router = useRouter();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const checkValidation = await ProtectLoginActions(formData.email);
      
      if (checkValidation && !checkValidation.success) {
        toast(checkValidation.error, {
          className: "bg-red-500 text-white",
        });
        return;
      }

      const success = await login(formData.email, formData.password);
      
      if (success) {
        toast("Log-In successfully");
        const user = useAuthStore.getState().user;
        if (user?.role === "SUPER_ADMIN") {
          router.push("/super-admin");
        } else {
          router.push("/");
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast("Login failed. Please try again.", {
        className: "bg-red-500 text-white",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex">
      <div className="hidden lg:block w-1/2 bg-[#f5f5f5] relative overflow-hidden">
        <Image
          src={banner}
          alt="Register"
          width={1000}
          height={1000}
          style={{ objectFit: "cover", objectPosition: "center" }}
          priority
        />
      </div>
      <div className="w-full lg:w-1/2 flex flex-col p-8 lg:p-16 justify-center">
        <div className="max-w-md w-full mx-auto">
          <div className="flex justify-center">
            <Image src={logo} width={200} height={50} alt="Logo" />
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
                className="bg-[#fff] rounded-none mt-2"
                value={formData.email}
                onChange={handleOnChange}
              />
            </div>
            <div className="space-y-1 relative">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                required
                className="bg-[#fff] rounded-none mt-2"
                value={formData.password}
                onChange={handleOnChange}
              />
              {showPassword ? (
                <EyeOff
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-8 cursor-pointer w-5 h-5"
                />
              ) : (
                <Eye
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-8 cursor-pointer w-5 h-5"
                />
              )}
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white transition-colors cursor-pointer rounded-none mt-4 hover:bg-blue-800 hover:shadow-lg duration-300"
            >
              {isLoading ? (
                "Loging In..."
              ) : (
                <>
                  Log In
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
            <p className="text-center text-[#3f3d56] text-sm">
              Don't have an account?{" "}
              <Link
                href={"/auth/register"}
                className="text-[#000] hover:underline font-bold"
              >
                Create an account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
