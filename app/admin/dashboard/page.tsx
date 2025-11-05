"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import Parse from "@/lib/parse";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

export default function AdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, checkAuth, logout } = useAuthStore();
  const [pendingHospitals, setPendingHospitals] = useState<Parse.Object[]>([]);
  const [allHospitals, setAllHospitals] = useState<Parse.Object[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectionReasons, setRejectionReasons] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user && user.get("userType") !== "Admin") {
      router.push("/login");
    } else if (user) {
      fetchHospitals();
    }
  }, [user, router]);

  const fetchHospitals = async () => {
    setIsLoading(true);
    try {
      // Fetch pending hospitals
      const pendingQuery = new Parse.Query("HospitalProfile");
      pendingQuery.equalTo("verificationStatus", "Pending");
      pendingQuery.include("user");
      const pending = await pendingQuery.find();
      setPendingHospitals(pending);

      // Fetch all hospitals
      const allQuery = new Parse.Query("HospitalProfile");
      allQuery.include("user");
      allQuery.descending("createdAt");
      const all = await allQuery.find();
      setAllHospitals(all);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (hospitalProfileId: string, hospitalName: string) => {
    try {
      await Parse.Cloud.run("approveHospital", { hospitalProfileId });
      toast({
        title: "Hospital Approved",
        description: `${hospitalName} has been approved successfully.`,
      });
      await fetchHospitals();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleReject = async (hospitalProfileId: string, hospitalName: string) => {
    const reason = rejectionReasons[hospitalProfileId];
    if (!reason || reason.trim() === "") {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }

    try {
      await Parse.Cloud.run("rejectHospital", { hospitalProfileId, reason });
      toast({
        title: "Hospital Rejected",
        description: `${hospitalName} has been rejected.`,
      });
      setRejectionReasons((prev) => {
        const updated = { ...prev };
        delete updated[hospitalProfileId];
        return updated;
      });
      await fetchHospitals();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">👨‍💼</span>
            <h1 className="text-2xl font-bold">LifeLink Admin</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Welcome, <strong>Admin</strong>
            </span>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-600">
                {pendingHospitals.length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Hospitals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">
                {allHospitals.length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Approved Hospitals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {allHospitals.filter(h => h.get("verificationStatus") === "Approved").length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Hospitals */}
        {pendingHospitals.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Pending Hospital Approvals</CardTitle>
              <CardDescription>
                Review and approve/reject hospital registrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingHospitals.map((hospital) => (
                    <div
                      key={hospital.id}
                      className="p-4 border rounded-lg bg-yellow-50 border-yellow-200"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">
                            {hospital.get("hospitalName")}
                          </h3>
                          <p className="text-sm text-gray-600">
                            <strong>License:</strong> {hospital.get("licenseNumber")}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Contact:</strong> {hospital.get("contactPersonName")} 
                            ({hospital.get("contactPersonDesignation")})
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Phone:</strong> {hospital.get("phoneNumber")}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Type:</strong> {hospital.get("hospitalType")}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Location:</strong> {hospital.get("city")}, {hospital.get("state")}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Registered:</strong>{" "}
                            {new Date(hospital.get("createdAt")).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant="secondary">Pending</Badge>
                      </div>

                      <div className="space-y-2">
                        <Textarea
                          placeholder="Rejection reason (required for rejection)"
                          value={rejectionReasons[hospital.id] || ""}
                          onChange={(e) =>
                            setRejectionReasons((prev) => ({
                              ...prev,
                              [hospital.id]: e.target.value,
                            }))
                          }
                          rows={2}
                        />
                        <div className="flex space-x-2">
                          <Button
                            onClick={() =>
                              handleApprove(hospital.id, hospital.get("hospitalName"))
                            }
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={() =>
                              handleReject(hospital.id, hospital.get("hospitalName"))
                            }
                            variant="destructive"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* All Hospitals */}
        <Card>
          <CardHeader>
            <CardTitle>All Hospitals</CardTitle>
            <CardDescription>Complete list of registered hospitals</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : allHospitals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hospitals registered yet
              </div>
            ) : (
              <div className="space-y-4">
                {allHospitals.map((hospital) => (
                  <div
                    key={hospital.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {hospital.get("hospitalName")}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {hospital.get("city")}, {hospital.get("state")} • 
                          License: {hospital.get("licenseNumber")}
                        </p>
                        <p className="text-sm text-gray-600">
                          Registered: {new Date(hospital.get("createdAt")).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        variant={
                          hospital.get("verificationStatus") === "Approved"
                            ? "default"
                            : hospital.get("verificationStatus") === "Rejected"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {hospital.get("verificationStatus")}
                      </Badge>
                    </div>
                    {hospital.get("verificationStatus") === "Rejected" &&
                      hospital.get("rejectionReason") && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                          <strong>Rejection Reason:</strong> {hospital.get("rejectionReason")}
                        </div>
                      )}
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
