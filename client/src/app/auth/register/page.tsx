"use client";
import Image from "next/image";
import React, { use, useEffect, useState } from "react";
import banner from "../../../../public/images/banner.jpg";
import logo from "../../../../public/images/logo.png";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, EyeClosedIcon, EyeIcon } from "lucide-react";
import Link from "next/link";
import { ProtectSignUpActions } from "@/actions/auth";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { register, isLoading } = useAuthStore();
  const router = useRouter();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const checkValidation = await ProtectSignUpActions(formData.email);
    if (!checkValidation.success) {
      toast(checkValidation.error, {
        className: "bg-red-500 text-white",
      });
      const userId = await register(
        formData.name,
        formData.email,
        formData.password
      );
      if (userId) {
        toast("Account created successfully");
      }
      // else {
      //   toast("User Already Exist. Please login");
      // }

      if (userId) router.push("/auth/login");

      return;
    }
  };
  return (
    <div className="min-h-screen bg-[#f5f5f5] flex">
      <div className="hidden lg:block w-1/2 bg-[#f5f5f5] relative overflow-hidden">
        <Image
          src={banner}
          alt="Register"
          fill
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
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your name"
                required
                className="bg-[#fff] rounded-none mt-2"
                value={formData.name}
                onChange={handleOnChange}
              />
            </div>
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
                <EyeIcon
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-8 cursor-pointer w-5 h-5"
                />
              ) : (
                <EyeClosedIcon
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
                "Creating Account..."
              ) : (
                <>
                  CREATE ACCOUNT
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
            <p className="text-center text-[#3f3d56] text-sm">
              Already have an account?{" "}
              <Link
                href={"/auth/login"}
                className="text-[#000] hover:underline font-bold"
              >
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
