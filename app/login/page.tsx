"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login, isLoading, error, clearError } = useAuthStore();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login(username, password);
      
      toast({
        title: "Success!",
        description: "You have been logged in successfully.",
      });

      // Redirect based on user type
      const userType = useAuthStore.getState().userType;
      if (userType === "Donor") {
        router.push("/donor/dashboard");
      } else if (userType === "Hospital") {
        router.push("/hospital/dashboard");
      } else if (userType === "Admin") {
        router.push("/admin/dashboard");
      }
    } catch (err: any) {
      toast({
        title: "Login Failed",
        description: err.message || "Invalid username or password",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <span className="text-5xl">🩸</span>
          </div>
          <CardTitle className="text-2xl text-center">Welcome to LifeLink</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username or Email</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username or email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
            <div className="text-sm text-center text-gray-600">
              Don&apos;t have an account?{" "}
              <Link href="/register/donor" className="text-red-600 hover:underline font-semibold">
                Register as Donor
              </Link>
              {" or "}
              <Link href="/register/hospital" className="text-blue-600 hover:underline font-semibold">
                Register as Hospital
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
