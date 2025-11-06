"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useRequestStore } from "@/stores/requestStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Phone, Mail, MapPin, User } from "lucide-react";
import Link from "next/link";

export default function RequestDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const requestId = params.id as string;
  
  const { user, profile, checkAuth } = useAuthStore();
  const { selectedRequest, responses, fetchRequestById, fetchResponses, isLoading } = useRequestStore();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (requestId) {
      fetchRequestById(requestId);
      fetchResponses(requestId);
    }
  }, [requestId]);

  useEffect(() => {
    if (user && user.get("userType") !== "Hospital") {
      router.push("/login");
    }
  }, [user, router]);

  if (!user || !profile || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!selectedRequest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Request not found</p>
          <Button onClick={() => router.push("/hospital/dashboard")} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const acceptedResponses = responses.filter(r => r.get("responseType") === "Accepted");
  const declinedResponses = responses.filter(r => r.get("responseType") === "Declined");

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
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Link 
          href="/hospital/dashboard" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>

        {/* Request Details */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">Blood Request Details</CardTitle>
                <CardDescription>
                  Created on {new Date(selectedRequest.get("createdAt")).toLocaleString()}
                </CardDescription>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <Badge
                  variant={
                    selectedRequest.get("urgencyLevel") === "Critical"
                      ? "destructive"
                      : "default"
                  }
                >
                  {selectedRequest.get("urgencyLevel")}
                </Badge>
                <Badge variant="outline">{selectedRequest.get("status")}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-sm text-gray-600 mb-2">Request Information</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600">Blood Type</p>
                    <p className="text-2xl font-bold text-red-600">{selectedRequest.get("bloodType")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Units Required</p>
                    <p className="text-lg font-semibold">{selectedRequest.get("unitsRequired")} units</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Patient Name</p>
                    <p className="text-lg">{selectedRequest.get("patientName")}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-600 mb-2">Additional Details</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600">Required By</p>
                    <p className="text-lg">
                      {new Date(selectedRequest.get("requiredBy")).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Description</p>
                    <p className="text-sm">{selectedRequest.get("description")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Responses</p>
                    <p className="text-lg font-semibold">
                      <span className="text-green-600">{acceptedResponses.length} Accepted</span>
                      {" • "}
                      <span className="text-gray-500">{declinedResponses.length} Declined</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accepted Donors */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="text-green-600 mr-2">✓</span>
              Donors Who Accepted ({acceptedResponses.length})
            </CardTitle>
            <CardDescription>
              Contact these donors to arrange blood donation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {acceptedResponses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No donors have accepted this request yet
              </div>
            ) : (
              <div className="space-y-4">
                {acceptedResponses.map((response) => {
                  const donor = response.get("donor");
                  return (
                    <div
                      key={response.id}
                      className="p-4 border-2 border-green-200 rounded-lg bg-green-50"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg flex items-center">
                            <User className="h-5 w-5 mr-2 text-green-600" />
                            {donor?.get("fullName")}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Blood Type: <strong className="text-red-600">{donor?.get("bloodType")}</strong>
                          </p>
                        </div>
                        <Badge className="bg-green-600">Accepted</Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <div className="flex items-center space-x-2 text-sm">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">
                            {donor?.get("phoneNumber") || "Not provided"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">
                            {donor?.get("email") || donor?.get("user")?.get("email") || "Not provided"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">
                            {donor?.get("city")}, {donor?.get("state")}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Responded: {new Date(response.get("respondedAt")).toLocaleString()}
                        </div>
                      </div>

                      <div className="mt-4 flex space-x-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            const phone = donor?.get("phoneNumber");
                            if (phone) window.location.href = `tel:${phone}`;
                          }}
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          Call Donor
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const email = donor?.get("email") || donor?.get("user")?.get("email");
                            if (email) window.location.href = `mailto:${email}`;
                          }}
                        >
                          <Mail className="h-4 w-4 mr-1" />
                          Email Donor
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Declined Donors (collapsed by default) */}
        {declinedResponses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-600">
                Donors Who Declined ({declinedResponses.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {declinedResponses.map((response) => {
                  const donor = response.get("donor");
                  return (
                    <div
                      key={response.id}
                      className="p-3 border rounded-lg bg-gray-50 text-sm"
                    >
                      <span className="font-semibold">{donor?.get("fullName")}</span>
                      <span className="text-gray-500 ml-2">
                        • Declined on {new Date(response.get("respondedAt")).toLocaleDateString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
