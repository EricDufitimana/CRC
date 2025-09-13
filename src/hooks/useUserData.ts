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
      console.log('🔍 useUserData: Starting fetchUserData function');
      
      const supabase = createClient();
      console.log('🔍 useUserData: Supabase client created successfully');
      
      // Get current user session from Supabase client
      console.log('🔍 useUserData: Calling supabase.auth.getUser()...');
      const { data: { user }, error: sessionError } = await supabase.auth.getUser();
      console.log('🔍 useUserData: supabase.auth.getUser() response:', { user, sessionError });
      
      if (sessionError) {
        console.error('❌ useUserData: Session error:', sessionError);
        setUserData((prev: UserData) => ({ ...prev, isLoading: false }));
        return;
      }
      
      if (!user) {
        console.log('🔍 useUserData: No user found in session');
        setUserData((prev: UserData) => ({ ...prev, isLoading: false }));
        return;
      }

      const userId = user.id;
      console.log('🔍 useUserData: Session found, userId:', userId);
      
      if (userId) {
        console.log('🔍 useUserData: Setting userId in state:', userId);
        setUserData((prev: UserData) => ({ ...prev, userId }));
        
        // Fetch admin ID if user exists
        console.log('🔍 useUserData: Fetching admin ID via API for userId:', userId);
        try {
          const adminResponse = await fetch('/api/fetchAdminId', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId })
          });
          
          console.log('🔍 useUserData: Admin API response status:', adminResponse.status);
          
          if (adminResponse.ok) {
            const adminData = await adminResponse.json();
            console.log('🔍 useUserData: Admin API response data:', adminData);
            setUserData((prev: UserData) => ({
              ...prev,
              adminId: adminData.adminId,
              isLoading: false
            }));
          } else if (adminResponse.status === 404) {
            // User is not an admin, which is fine
            console.log('🔍 useUserData: User is not an admin (404)');
            setUserData((prev: UserData) => ({
              ...prev,
              adminId: null,
              isLoading: false
            }));
          } else {
            console.log('🔍 useUserData: Admin API request failed with status:', adminResponse.status);
            setUserData((prev: UserData) => ({
              ...prev,
              isLoading: false
            }));
          }
        } catch (error) {
          console.log('🔍 useUserData: Admin API request failed with error:', error);
          // Continue with student data fetch even if admin fetch fails
          setUserData((prev: UserData) => ({
            ...prev,
            isLoading: false
          }));
        }
        
        // Fetch student ID via API
        console.log('🔍 useUserData: Fetching student ID via API for userId:', userId);
        const studentResponse = await fetch(`/api/studentId?userId=${userId}`);
        console.log('🔍 useUserData: Student API response status:', studentResponse.status);
        
        if (studentResponse.ok) {
          const studentData = await studentResponse.json();
          console.log('🔍 useUserData: Student API response data:', studentData);
          if (studentData.studentId) {
            console.log('🔍 useUserData: Setting studentId in state:', studentData.studentId);
            setUserData((prev: UserData) => ({
              ...prev,
              studentId: studentData.studentId
            }));
          }
        } else {
          console.log('🔍 useUserData: Student API request failed');
        }
      } else {
        console.log('🔍 useUserData: No userId available');
        setUserData((prev: UserData) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('❌ useUserData: Error fetching user data:', error);
      if (error instanceof Error) {
        console.error('❌ useUserData: Error stack:', error.stack);
      }
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
      console.error('Error initializing user data:', error);
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