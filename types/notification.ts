// types/notification.ts - Notification Types

export type NotificationType = 
  | "BloodRequest" 
  | "Approval" 
  | "Rejection"
  | "Reminder" 
  | "DonationConfirmed"
  | "RequestFulfilled";

export type NotificationChannel = "push" | "sms" | "email";

export interface Notification {
  objectId: string;
  recipient: Parse.User;
  type: NotificationType;
  title: string;
  message: string;
  relatedRequest?: Parse.Object;
  isRead: boolean;
  sentAt: Date;
  channels: NotificationChannel[];
  createdAt: Date;
  updatedAt: Date;
}
