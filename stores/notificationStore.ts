// stores/notificationStore.ts - Notification State Management
import { create } from 'zustand';
import Parse from '@/lib/parse';

interface NotificationState {
  notifications: Parse.Object[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearError: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const currentUser = Parse.User.current();
      if (!currentUser) return;

      const query = new Parse.Query('Notification');
      query.equalTo('recipient', currentUser);
      query.include('relatedRequest');
      query.descending('sentAt');
      query.limit(50);
      
      const notifications = await query.find();
      const unreadCount = notifications.filter(n => !n.get('isRead')).length;
      
      set({ notifications, unreadCount, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      const query = new Parse.Query('Notification');
      const notification = await query.get(notificationId);
      notification.set('isRead', true);
      await notification.save();
      
      await get().fetchNotifications();
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
    }
  },

  markAllAsRead: async () => {
    set({ isLoading: true, error: null });
    try {
      const { notifications } = get();
      const unreadNotifications = notifications.filter(n => !n.get('isRead'));
      
      unreadNotifications.forEach(n => n.set('isRead', true));
      await Parse.Object.saveAll(unreadNotifications);
      
      await get().fetchNotifications();
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
