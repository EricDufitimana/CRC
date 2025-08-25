import { useState, useEffect } from 'react';
import { createClient } from "@/utils/supabase/client";

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

  const fetchUserData = async () => {
    try {
      const supabase = createClient();
      // Get current user session from Supabase client
      const { data: { user }, error: sessionError } = await supabase.auth.getUser();
      
      if (sessionError || !user) {
        console.log('No session found:', sessionError);
        setUserData((prev: UserData) => ({ ...prev, isLoading: false }));
        return;
      }

      const userId = user.id;
      console.log('Session found, userId:', userId);
      
      if (userId) {
        setUserData((prev: UserData) => ({ ...prev, userId }));
        
        // Fetch admin ID if user exists
        const adminResponse = await fetch('/api/fetchAdminId', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId })
        });

        if (adminResponse.ok) {
          const adminData = await adminResponse.json();
          setUserData((prev: UserData) => ({
            ...prev,
            adminId: adminData.adminId,
            isLoading: false
          }));
        } else {
          setUserData((prev: UserData) => ({
            ...prev,
            isLoading: false
          }));
        }
      } else {
        setUserData((prev: UserData) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserData((prev: UserData) => ({
        ...prev,
        error: 'Error fetching user data',
        isLoading: false
      }));
    }
  };

  const initializeUser = async () => {
    try {
      setUserData((prev: UserData) => ({ ...prev, isLoading: true, error: null }));
      await fetchUserData();
    } catch (error) {
      console.error('Error initializing user data:', error);
      setUserData((prev: UserData) => ({
        ...prev,
        error: 'Error initializing user data',
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