// stores/requestStore.ts - Blood Request State Management
import { create } from 'zustand';
import Parse from '@/lib/parse';
import { BloodRequest, DonorResponse } from '@/types/request';

interface RequestState {
  requests: Parse.Object[];
  selectedRequest: Parse.Object | null;
  responses: Parse.Object[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchRequests: (filters?: any) => Promise<void>;
  fetchRequestById: (requestId: string) => Promise<void>;
  createRequest: (data: any) => Promise<Parse.Object>;
  fetchResponses: (requestId: string) => Promise<void>;
  respondToRequest: (requestId: string, responseType: 'Accepted' | 'Declined') => Promise<void>;
  closeRequest: (requestId: string) => Promise<void>;
  clearError: () => void;
}

export const useRequestStore = create<RequestState>((set, get) => ({
  requests: [],
  selectedRequest: null,
  responses: [],
  isLoading: false,
  error: null,

  fetchRequests: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const query = new Parse.Query('BloodRequest');
      query.include('hospital');
      query.descending('createdAt');
      
      // Apply filters
      if (filters.status) {
        query.equalTo('status', filters.status);
      }
      if (filters.bloodType) {
        query.equalTo('bloodType', filters.bloodType);
      }
      if (filters.urgencyLevel) {
        query.equalTo('urgencyLevel', filters.urgencyLevel);
      }
      
      const requests = await query.find();
      set({ requests, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchRequestById: async (requestId: string) => {
    set({ isLoading: true, error: null });
    try {
      const query = new Parse.Query('BloodRequest');
      query.include('hospital');
      const request = await query.get(requestId);
      set({ selectedRequest: request, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createRequest: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const BloodRequest = Parse.Object.extend('BloodRequest');
      const request = new BloodRequest();
      
      Object.keys(data).forEach(key => {
        request.set(key, data[key]);
      });
      
      await request.save();
      set({ isLoading: false });
      
      // Refresh requests list
      await get().fetchRequests();
      
      return request;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchResponses: async (requestId: string) => {
    set({ isLoading: true, error: null });
    try {
      const query = new Parse.Query('DonorResponse');
      const request = new Parse.Object('BloodRequest');
      request.id = requestId;
      query.equalTo('bloodRequest', request);
      query.include('donor');
      query.descending('respondedAt');
      
      const responses = await query.find();
      set({ responses, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  respondToRequest: async (requestId: string, responseType: 'Accepted' | 'Declined') => {
    set({ isLoading: true, error: null });
    try {
      const currentUser = Parse.User.current();
      if (!currentUser) throw new Error('Must be logged in');

      // Get donor profile
      const profileQuery = new Parse.Query('DonorProfile');
      profileQuery.equalTo('user', currentUser);
      const donorProfile = await profileQuery.first();
      
      if (!donorProfile) throw new Error('Donor profile not found');

      // Get blood request
      const requestQuery = new Parse.Query('BloodRequest');
      const request = await requestQuery.get(requestId);
      const hospital = request.get('hospital');

      // Create response
      const DonorResponse = Parse.Object.extend('DonorResponse');
      const response = new DonorResponse();
      response.set('bloodRequest', request);
      response.set('donor', donorProfile);
      response.set('hospital', hospital);
      response.set('responseType', responseType);
      response.set('respondedAt', new Date());
      response.set('isConfirmed', false);
      response.set('donationCompleted', false);
      
      await response.save();
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  closeRequest: async (requestId: string) => {
    set({ isLoading: true, error: null });
    try {
      const query = new Parse.Query('BloodRequest');
      const request = await query.get(requestId);
      request.set('status', 'Closed');
      request.set('closedAt', new Date());
      await request.save();
      
      set({ isLoading: false });
      await get().fetchRequests();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
