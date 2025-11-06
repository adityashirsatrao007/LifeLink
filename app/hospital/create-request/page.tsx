"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useRequestStore } from "@/stores/requestStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { BLOOD_TYPES } from "@/lib/constants";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateBloodRequestPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, profile } = useAuthStore();
  const { createRequest, isLoading } = useRequestStore();

  const [formData, setFormData] = useState({
    bloodType: "",
    unitsRequired: "1",
    urgencyLevel: "Medium",
    patientName: "",
    description: "",
    requiredBy: "",
  });

  const [errors, setErrors] = useState<any>({});

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors((prev: any) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors: any = {};

    if (!formData.bloodType) {
      newErrors.bloodType = "Blood type is required";
    }
    if (!formData.unitsRequired || parseInt(formData.unitsRequired) < 1) {
      newErrors.unitsRequired = "Please enter valid quantity (at least 1)";
    }
    if (!formData.urgencyLevel) {
      newErrors.urgencyLevel = "Urgency level is required";
    }
    if (!formData.patientName) {
      newErrors.patientName = "Patient name is required";
    }
    if (!formData.description) {
      newErrors.description = "Description is required";
    }
    if (!formData.requiredBy) {
      newErrors.requiredBy = "Required date is required";
    } else {
      const selectedDate = new Date(formData.requiredBy);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.requiredBy = "Date cannot be in the past";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    try {
      await createRequest({
        hospital: profile,  // Changed from user to profile (HospitalProfile)
        bloodType: formData.bloodType,
        unitsRequired: parseInt(formData.unitsRequired),
        urgencyLevel: formData.urgencyLevel,
        patientName: formData.patientName,
        description: formData.description,
        requiredBy: new Date(formData.requiredBy),
        status: "Active",
      });

      toast({
        title: "Success!",
        description: "Blood request created successfully. Matching donors will be notified.",
      });

      router.push("/hospital/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create blood request",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <Link href="/hospital/dashboard" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create Blood Request</CardTitle>
            <CardDescription>
              Fill in the details to request blood from donors
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* Blood Type */}
              <div className="space-y-2">
                <Label htmlFor="bloodType">Blood Type *</Label>
                <Select value={formData.bloodType} onValueChange={(value) => handleChange("bloodType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOD_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.bloodType && <p className="text-sm text-red-600">{errors.bloodType}</p>}
              </div>

              {/* Units Required */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unitsRequired">Units Required *</Label>
                  <Input
                    id="unitsRequired"
                    type="number"
                    min="1"
                    value={formData.unitsRequired}
                    onChange={(e) => handleChange("unitsRequired", e.target.value)}
                    disabled={isLoading}
                  />
                  {errors.unitsRequired && <p className="text-sm text-red-600">{errors.unitsRequired}</p>}
                </div>

                {/* Urgency Level */}
                <div className="space-y-2">
                  <Label htmlFor="urgencyLevel">Urgency Level *</Label>
                  <Select value={formData.urgencyLevel} onValueChange={(value) => handleChange("urgencyLevel", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.urgencyLevel && <p className="text-sm text-red-600">{errors.urgencyLevel}</p>}
                </div>
              </div>

              {/* Patient Name */}
              <div className="space-y-2">
                <Label htmlFor="patientName">Patient Name/ID *</Label>
                <Input
                  id="patientName"
                  value={formData.patientName}
                  onChange={(e) => handleChange("patientName", e.target.value)}
                  placeholder="Enter patient name or ID"
                  disabled={isLoading}
                />
                {errors.patientName && <p className="text-sm text-red-600">{errors.patientName}</p>}
              </div>

              {/* Required By Date */}
              <div className="space-y-2">
                <Label htmlFor="requiredBy">Required By Date *</Label>
                <Input
                  id="requiredBy"
                  type="date"
                  value={formData.requiredBy}
                  onChange={(e) => handleChange("requiredBy", e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  disabled={isLoading}
                />
                {errors.requiredBy && <p className="text-sm text-red-600">{errors.requiredBy}</p>}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Provide additional details about the blood requirement"
                  rows={4}
                  disabled={isLoading}
                />
                {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Request..." : "Create Blood Request"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
