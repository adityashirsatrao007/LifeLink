"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useRequestStore } from "@/stores/requestStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle } from "lucide-react";

export default function HospitalDashboard() {
  const router = useRouter();
  const { user, profile, checkAuth, logout } = useAuthStore();
  const { requests, fetchRequests, isLoading } = useRequestStore();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user && user.get("userType") !== "Hospital") {
      router.push("/login");
    }
    if (profile) {
      fetchRequests();
    }
  }, [user, profile, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const verificationStatus = profile.get("verificationStatus");
  const isApproved = verificationStatus === "Approved";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">🏥</span>
            <h1 className="text-2xl font-bold">LifeLink</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              <strong>{profile.get("hospitalName")}</strong>
            </span>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Verification Status */}
        {!isApproved && (
          <Card className="mb-8 border-yellow-300 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-900">
                    Account Pending Approval
                  </h3>
                  <p className="text-sm text-yellow-800 mt-1">
                    Your hospital account is currently under review by an administrator. 
                    You will be able to create blood requests once your account is approved.
                  </p>
                  {verificationStatus === "Rejected" && profile.get("rejectionReason") && (
                    <p className="text-sm text-red-600 mt-2">
                      <strong>Rejection Reason:</strong> {profile.get("rejectionReason")}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hospital Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Hospital Information</CardTitle>
            <CardDescription>Your hospital details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">License Number</p>
                <p className="text-lg font-semibold">{profile.get("licenseNumber")}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Hospital Type</p>
                <p className="text-lg font-semibold">{profile.get("hospitalType")}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Verification Status</p>
                <Badge
                  variant={
                    verificationStatus === "Approved"
                      ? "default"
                      : verificationStatus === "Rejected"
                      ? "destructive"
                      : "secondary"
                  }
                  className="mt-1"
                >
                  {verificationStatus}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create Request Button */}
        {isApproved && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Need Blood?</h3>
                  <p className="text-sm text-gray-600">
                    Create a new blood request to notify available donors
                  </p>
                </div>
                <Button 
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => router.push("/hospital/create-request")}
                >
                  Create Blood Request
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Your Blood Requests</CardTitle>
            <CardDescription>Manage your hospital's blood requests</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {isApproved
                  ? "No blood requests yet. Create your first request!"
                  : "You can create requests after your account is approved"}
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {request.get("bloodType")} Blood Needed
                        </h3>
                        <p className="text-sm text-gray-600">
                          Quantity: <strong>{request.get("unitsRequired") || request.get("quantityNeeded")} units</strong> • 
                          Accepted: <strong>{request.get("acceptedCount") || 0}</strong>
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Created: {new Date(request.get("createdAt")).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge
                          variant={
                            request.get("urgencyLevel") === "Critical"
                              ? "destructive"
                              : "default"
                          }
                        >
                          {request.get("urgencyLevel")}
                        </Badge>
                        <Badge variant="outline">{request.get("status")}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
