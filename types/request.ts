// types/request.ts - Blood Request Types

import { BloodType } from "./user";

export type UrgencyLevel = "Critical" | "Urgent" | "Routine";

export type RequestStatus = "Open" | "Closed" | "Fulfilled";

export type ResponseType = "Accepted" | "Declined";

export interface BloodRequest {
  objectId: string;
  hospital: Parse.Object;
  bloodType: BloodType;
  quantityNeeded: number;
  urgencyLevel: UrgencyLevel;
  requiredByDate: Date;
  requiredByTime: string;
  additionalNotes?: string;
  status: RequestStatus;
  acceptedCount: number;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DonorResponse {
  objectId: string;
  bloodRequest: Parse.Object;
  donor: Parse.Object;
  hospital: Parse.Object;
  responseType: ResponseType;
  distance?: number;
  respondedAt: Date;
  isConfirmed: boolean;
  donationCompleted: boolean;
  donationDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DonationHistory {
  objectId: string;
  donor: Parse.Object;
  hospital: Parse.Object;
  bloodRequest: Parse.Object;
  bloodType: BloodType;
  quantityDonated: number;
  donationDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
