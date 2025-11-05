// lib/constants.ts - Application Constants

export const BLOOD_TYPES = [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"
] as const;

export const URGENCY_LEVELS = {
  CRITICAL: { value: "Critical", label: "Critical", color: "red" },
  URGENT: { value: "Urgent", label: "Urgent", color: "orange" },
  ROUTINE: { value: "Routine", label: "Routine", color: "green" },
} as const;

export const AVAILABILITY_STATUS = {
  AVAILABLE: { value: "Available", label: "Available", color: "green" },
  UNAVAILABLE: { value: "Unavailable", label: "Unavailable", color: "gray" },
  ON_COOLDOWN: { value: "OnCooldown", label: "On Cooldown", color: "yellow" },
} as const;

export const VERIFICATION_STATUS = {
  PENDING: { value: "Pending", label: "Pending Approval", color: "yellow" },
  APPROVED: { value: "Approved", label: "Approved", color: "green" },
  REJECTED: { value: "Rejected", label: "Rejected", color: "red" },
} as const;

export const REQUEST_STATUS = {
  OPEN: { value: "Open", label: "Open", color: "blue" },
  CLOSED: { value: "Closed", label: "Closed", color: "gray" },
  FULFILLED: { value: "Fulfilled", label: "Fulfilled", color: "green" },
} as const;

export const HOSPITAL_TYPES = ["Government", "Private"] as const;

export const USER_TYPES = ["Donor", "Hospital", "Admin"] as const;

// Blood compatibility matrix
export const BLOOD_COMPATIBILITY = {
  "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
  "O+": ["O+", "A+", "B+", "AB+"],
  "A-": ["A-", "A+", "AB-", "AB+"],
  "A+": ["A+", "AB+"],
  "B-": ["B-", "B+", "AB-", "AB+"],
  "B+": ["B+", "AB+"],
  "AB-": ["AB-", "AB+"],
  "AB+": ["AB+"],
} as const;

// Can receive from
export const CAN_RECEIVE_FROM = {
  "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
  "AB-": ["O-", "A-", "B-", "AB-"],
  "B+": ["O-", "O+", "B-", "B+"],
  "B-": ["O-", "B-"],
  "A+": ["O-", "O+", "A-", "A+"],
  "A-": ["O-", "A-"],
  "O+": ["O-", "O+"],
  "O-": ["O-"],
} as const;

export const DONATION_COOLDOWN_DAYS = 90;

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
] as const;
