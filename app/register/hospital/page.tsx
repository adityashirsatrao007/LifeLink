"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { HOSPITAL_TYPES, INDIAN_STATES } from "@/lib/constants";

export default function HospitalRegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { signup, updateProfile, isLoading, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    hospitalName: "",
    licenseNumber: "",
    phoneNumber: "",
    contactPersonName: "",
    contactPersonDesignation: "",
    hospitalType: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
  });

  const [errors, setErrors] = useState<any>({});

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors((prev: any) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors: any = {};

    if (!formData.username || formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.hospitalName) {
      newErrors.hospitalName = "Hospital name is required";
    }
    if (!formData.licenseNumber) {
      newErrors.licenseNumber = "License number is required";
    }
    if (!formData.phoneNumber || !/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid 10-digit phone number";
    }
    if (!formData.contactPersonName) {
      newErrors.contactPersonName = "Contact person name is required";
    }
    if (!formData.hospitalType) {
      newErrors.hospitalType = "Hospital type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validate()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    try {
      // First, create the user account
      await signup(formData.username, formData.email, formData.password, "Hospital");
      
      // Then update the hospital profile
      await updateProfile({
        hospitalName: formData.hospitalName,
        licenseNumber: formData.licenseNumber,
        phoneNumber: formData.phoneNumber,
        contactPersonName: formData.contactPersonName,
        contactPersonDesignation: formData.contactPersonDesignation,
        hospitalType: formData.hospitalType,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pinCode: formData.pinCode,
      });

      toast({
        title: "Registration Successful!",
        description: "Your hospital account has been created. Please wait for admin approval.",
      });

      router.push("/hospital/dashboard");
    } catch (err: any) {
      toast({
        title: "Registration Failed",
        description: err.message || "An error occurred during registration",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <span className="text-5xl">🏥</span>
          </div>
          <CardTitle className="text-2xl text-center">Register Hospital</CardTitle>
          <CardDescription className="text-center">
            Register your hospital to connect with blood donors
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Account Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleChange("username", e.target.value)}
                    disabled={isLoading}
                  />
                  {errors.username && <p className="text-sm text-red-600">{errors.username}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    disabled={isLoading}
                  />
                  {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    disabled={isLoading}
                  />
                  {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    disabled={isLoading}
                  />
                  {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            {/* Hospital Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Hospital Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hospitalName">Hospital Name *</Label>
                  <Input
                    id="hospitalName"
                    value={formData.hospitalName}
                    onChange={(e) => handleChange("hospitalName", e.target.value)}
                    disabled={isLoading}
                  />
                  {errors.hospitalName && <p className="text-sm text-red-600">{errors.hospitalName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">License Number *</Label>
                  <Input
                    id="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={(e) => handleChange("licenseNumber", e.target.value)}
                    disabled={isLoading}
                  />
                  {errors.licenseNumber && <p className="text-sm text-red-600">{errors.licenseNumber}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hospitalType">Hospital Type *</Label>
                  <Select value={formData.hospitalType} onValueChange={(value) => handleChange("hospitalType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {HOSPITAL_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.hospitalType && <p className="text-sm text-red-600">{errors.hospitalType}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => handleChange("phoneNumber", e.target.value)}
                    placeholder="10 digits"
                    disabled={isLoading}
                  />
                  {errors.phoneNumber && <p className="text-sm text-red-600">{errors.phoneNumber}</p>}
                </div>
              </div>
            </div>

            {/* Contact Person */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Contact Person</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPersonName">Name *</Label>
                  <Input
                    id="contactPersonName"
                    value={formData.contactPersonName}
                    onChange={(e) => handleChange("contactPersonName", e.target.value)}
                    disabled={isLoading}
                  />
                  {errors.contactPersonName && <p className="text-sm text-red-600">{errors.contactPersonName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPersonDesignation">Designation</Label>
                  <Input
                    id="contactPersonDesignation"
                    value={formData.contactPersonDesignation}
                    onChange={(e) => handleChange("contactPersonDesignation", e.target.value)}
                    placeholder="e.g., Administrator"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Address</h3>
              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Select value={formData.state} onValueChange={(value) => handleChange("state", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDIAN_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pinCode">PIN Code</Label>
                  <Input
                    id="pinCode"
                    value={formData.pinCode}
                    onChange={(e) => handleChange("pinCode", e.target.value)}
                    placeholder="6 digits"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Your hospital account will be pending approval. 
                An administrator will review your registration before you can create blood requests.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Register Hospital"}
            </Button>
            <div className="text-sm text-center text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:underline font-semibold">
                Login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
