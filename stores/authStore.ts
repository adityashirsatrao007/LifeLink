// stores/authStore.ts - Authentication State Management
import { create } from 'zustand';
import Parse from '@/lib/parse';
import { UserType } from '@/types/user';

interface AuthState {
  user: Parse.User | null;
  userType: UserType | null;
  profile: Parse.Object | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string, userType: UserType) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  userType: null,
  profile: null,
  isLoading: false,
  error: null,

  login: async (username: string, password: string) => {
    // Helper: timeout wrapper to avoid indefinite loading on network stalls
    const withTimeout = <T,>(promise: Promise<T>, ms: number, timeoutMessage: string): Promise<T> => {
      return new Promise<T>((resolve, reject) => {
        const id = setTimeout(() => reject(new Error(timeoutMessage)), ms);
        promise
          .then((val) => {
            clearTimeout(id);
            resolve(val);
          })
          .catch((err) => {
            clearTimeout(id);
            reject(err);
          });
      });
    };

    set({ isLoading: true, error: null });
    try {
      // Attempt login with a 15s timeout to prevent UI from getting stuck
      console.debug('[Auth] Attempting login for', username);
      const user = await withTimeout(
        Parse.User.logIn(username, password),
        15000,
        'Login timed out. Please check your internet connection and try again.'
      );
      const userType = user.get('userType') as UserType;
      set({ user, userType });

      // Fetch profile after login (non-blocking for UI responsiveness)
      await get().fetchProfile();

      console.debug('[Auth] Login successful for', username, 'type:', userType);
    } catch (error: any) {
      console.error('[Auth] Login failed:', error);
      set({ error: error.message });
      throw error;
    } finally {
      // Always clear loading, even on timeout or unexpected errors
      set({ isLoading: false });
    }
  },

  signup: async (username: string, email: string, password: string, userType: UserType) => {
    set({ isLoading: true, error: null });
    try {
      const user = new Parse.User();
      user.set('username', username);
      user.set('email', email);
      user.set('password', password);
      user.set('userType', userType);

      await user.signUp();
      set({ user, userType });

      // Wait a moment for cloud code to create profile
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await get().fetchProfile();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await Parse.User.logOut();
      set({ user: null, userType: null, profile: null, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchProfile: async () => {
    const { user, userType } = get();
    if (!user || !userType) return;

    try {
      const className = userType === 'Donor' ? 'DonorProfile' : 
                       userType === 'Hospital' ? 'HospitalProfile' : null;
      
      if (!className) return;

      const query = new Parse.Query(className);
      query.equalTo('user', user);
      const profile = await query.first();
      
      set({ profile });
    } catch (error: any) {
      console.error('Error fetching profile:', error);
    }
  },

  updateProfile: async (data: any) => {
    const { profile } = get();
    if (!profile) throw new Error('No profile to update');

    set({ isLoading: true, error: null });
    try {
      Object.keys(data).forEach(key => {
        profile.set(key, data[key]);
      });
      
      await profile.save();
      set({ profile, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  checkAuth: async () => {
    const currentUser = Parse.User.current();
    if (currentUser) {
      const userType = currentUser.get('userType') as UserType;
      set({ user: currentUser, userType });
      await get().fetchProfile();
    }
  },

  clearError: () => set({ error: null }),
}));
