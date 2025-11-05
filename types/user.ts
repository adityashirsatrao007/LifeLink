// types/user.ts - User and Profile Types

export type UserType = "Donor" | "Hospital" | "Admin";

export type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

export type AvailabilityStatus = "Available" | "Unavailable" | "OnCooldown";

export type VerificationStatus = "Pending" | "Approved" | "Rejected";

export type HospitalType = "Government" | "Private";

export interface DonorProfile {
  objectId: string;
  user: Parse.User;
  fullName: string;
  phoneNumber: string;
  dateOfBirth: Date;
  bloodType: BloodType;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  location: Parse.GeoPoint;
  availabilityStatus: AvailabilityStatus;
  lastDonationDate?: Date;
  nextEligibleDate?: Date;
  profilePhoto?: Parse.File;
  createdAt: Date;
  updatedAt: Date;
}

export interface HospitalProfile {
  objectId: string;
  user: Parse.User;
  hospitalName: string;
  licenseNumber: string;
  phoneNumber: string;
  contactPersonName: string;
  contactPersonDesignation: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  location: Parse.GeoPoint;
  hospitalType: HospitalType;
  verificationStatus: VerificationStatus;
  licenseDocument?: Parse.File;
  registrationDocument?: Parse.File;
  rejectionReason?: string;
  approvedBy?: Parse.User;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithProfile extends Parse.User {
  userType: UserType;
  profile?: DonorProfile | HospitalProfile;
}
