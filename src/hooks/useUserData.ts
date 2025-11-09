import { useState, useEffect } from 'react';
import { createClient } from "@/utils/supabase/client";

interface UserData {
  userId: string | null;
  adminId: string | null;
  studentId: number | null;
  isLoading: boolean;
  error: string | null;
}

export function useUserData() {
  const [userData, setUserData] = useState<UserData>({
    userId: null,
    adminId: null,
    studentId: null,
    isLoading: true,
    error: null
  });

  const fetchUserData = async () => {
    try {
      const supabase = createClient();
      
      // Get current user session from Supabase client
      const { data: { user }, error: sessionError } = await supabase.auth.getUser();
      
      if (sessionError) {
        setUserData((prev: UserData) => ({ ...prev, isLoading: false }));
        return;
      }
      
      if (!user) {
        setUserData((prev: UserData) => ({ ...prev, isLoading: false }));
        return;
      }

      const userId = user.id;
      
      if (userId) {
        setUserData((prev: UserData) => ({ ...prev, userId }));
        
        // Fetch admin ID if user exists
        try {
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
          } else if (adminResponse.status === 404) {
            // User is not an admin, which is fine
            setUserData((prev: UserData) => ({
              ...prev,
              adminId: null,
              isLoading: false
            }));
          } else {
            setUserData((prev: UserData) => ({
              ...prev,
              isLoading: false
            }));
          }
        } catch (error) {
          // Continue with student data fetch even if admin fetch fails
          setUserData((prev: UserData) => ({
            ...prev,
            isLoading: false
          }));
        }
        
        // Fetch student ID via API
        const studentResponse = await fetch(`/api/studentId?userId=${userId}`);
        
        if (studentResponse.ok) {
          const studentData = await studentResponse.json();
          if (studentData.studentId) {
            setUserData((prev: UserData) => ({
              ...prev,
              studentId: studentData.studentId
            }));
          }
        }
      } else {
        setUserData((prev: UserData) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setUserData((prev: UserData) => ({
        ...prev,
        error: `Error fetching user data: ${errorMessage}`,
        isLoading: false
      }));
    }
  };

  const initializeUser = async () => {
    try {
      setUserData((prev: UserData) => ({ ...prev, isLoading: true, error: null }));
      await fetchUserData();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setUserData((prev: UserData) => ({
        ...prev,
        error: `Error initializing user data: ${errorMessage}`,
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