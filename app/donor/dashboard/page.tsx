"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useRequestStore } from "@/stores/requestStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DonorDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, profile, checkAuth, logout } = useAuthStore();
  const { requests, myResponses, fetchRequests, fetchMyResponses, respondToRequest, isLoading } = useRequestStore();

  useEffect(() => {
    checkAuth();
    fetchRequests({ status: "Active" });
    fetchMyResponses(); // Fetch donor's existing responses
  }, []);

  useEffect(() => {
    if (user && user.get("userType") !== "Donor") {
      router.push("/login");
    }
  }, [user, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleAccept = async (requestId: string) => {
    try {
      await respondToRequest(requestId, "Accepted");
      toast({
        title: "Request Accepted",
        description: "The hospital will be notified of your acceptance.",
      });
      await fetchMyResponses(); // Refresh to show updated status
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDecline = async (requestId: string) => {
    try {
      await respondToRequest(requestId, "Declined");
      toast({
        title: "Request Declined",
        description: "The request has been declined.",
      });
      await fetchMyResponses(); // Refresh to show updated status
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const bloodType = profile.get("bloodType");
  const isAvailable = profile.get("isAvailable");
  const availabilityStatus = isAvailable ? "Available" : "Unavailable";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">🩸</span>
            <h1 className="text-2xl font-bold">LifeLink</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Welcome, <strong>{profile.get("fullName")}</strong>
            </span>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Profile Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>Donor Information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Blood Type</p>
                <p className="text-2xl font-bold text-red-600">{bloodType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Availability Status</p>
                <Badge 
                  variant={availabilityStatus === "Available" ? "default" : "secondary"}
                  className="mt-1"
                >
                  {availabilityStatus}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Donation</p>
                <p className="text-lg font-semibold">
                  {profile.get("lastDonationDate") 
                    ? new Date(profile.get("lastDonationDate")).toLocaleDateString() 
                    : "Never"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blood Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Active Blood Requests</CardTitle>
            <CardDescription>
              Blood requests that match your type ({bloodType})
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No active blood requests at the moment
              </div>
            ) : (
              <div className="space-y-4">
                {requests
                  .filter(req => req.get("bloodType") === bloodType)
                  .map((request) => {
                    const hospital = request.get("hospital");
                    const myResponse = myResponses.get(request.id);
                    const hasResponded = !!myResponse;
                    const responseType = myResponse?.get("responseType");
                    
                    return (
                      <div
                        key={request.id}
                        className="p-4 border rounded-lg hover:bg-gray-50 transition"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {hospital?.get("hospitalName") || "Hospital"}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Blood Type: <strong>{request.get("bloodType")}</strong> • 
                              Quantity: <strong>{request.get("unitsRequired")} units</strong>
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {request.get("description") || request.get("additionalNotes")}
                            </p>
                          </div>
                          <Badge
                            variant={
                              request.get("urgencyLevel") === "Critical"
                                ? "destructive"
                                : "default"
                            }
                          >
                            {request.get("urgencyLevel")}
                          </Badge>
                        </div>
                        
                        {hasResponded ? (
                          <div className="mt-3">
                            <Badge 
                              variant={responseType === "Accepted" ? "default" : "secondary"}
                              className={responseType === "Accepted" ? "bg-green-600" : ""}
                            >
                              {responseType === "Accepted" ? "✓ Request Accepted" : "Request Declined"}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">
                              Responded on {new Date(myResponse.get("respondedAt")).toLocaleDateString()}
                            </p>
                          </div>
                        ) : (
                          <div className="mt-3 flex space-x-2">
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleAccept(request.id)}
                              disabled={isLoading}
                            >
                              Accept
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDecline(request.id)}
                              disabled={isLoading}
                            >
                              Decline
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
