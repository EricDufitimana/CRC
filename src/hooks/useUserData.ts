import { useState, useEffect } from 'react';
import { useSupabase } from './useSupabase';

interface UserData {
  userId: string | null;
  adminId: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useUserData() {
  const [userData, setUserData] = useState<UserData>({
    userId: null,
    adminId: null,
    isLoading: true,
    error: null
  });
  
  const { getUserId } = useSupabase();

  const fetchAdminId = async (userId: string) => {
    try {
      const response = await fetch(`/api/fetchAdminId?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserData(prev => ({
          ...prev,
          adminId: data.adminId,
          isLoading: false
        }));
      } else {
        setUserData(prev => ({
          ...prev,
          error: 'Failed to fetch admin ID',
          isLoading: false
        }));
      }
    } catch (error) {
      setUserData(prev => ({
        ...prev,
        error: 'Error fetching admin ID',
        isLoading: false
      }));
    }
  };

  const initializeUser = async () => {
    try {
      setUserData(prev => ({ ...prev, isLoading: true, error: null }));
      
      const userId = await getUserId();
      if (userId) {
        setUserData(prev => ({ ...prev, userId }));
        await fetchAdminId(userId);
      } else {
        setUserData(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      setUserData(prev => ({
        ...prev,
        error: 'Error getting user ID',
        isLoading: false
      }));
    }
  };

  useEffect(() => {
    initializeUser();
  }, []);

  const refreshUserData = () => {
    initializeUser();
  };

  return {
    ...userData,
    refreshUserData
  };
} 