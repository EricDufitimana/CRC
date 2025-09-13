import { useState, useEffect } from 'react';
import { createClient } from "@/utils/supabase/client";

interface SessionData {
  userId: string | null;
  adminId: string | null;
  studentId: number | null;
  isLoading: boolean;
  error: string | null;
}

export function getSession() {
  const [sessionData, setSessionData] = useState<SessionData>({
    userId: null,
    adminId: null,
    studentId: null,
    isLoading: true,
    error: null
  });

  const fetchSessionData = async () => {
    try {
      console.log('🔍 getSession: Starting fetchSessionData function');
      
      const supabase = createClient();
      console.log('🔍 getSession: Supabase client created successfully');
      
      // Get current user session from Supabase client using getSession
      console.log('🔍 getSession: Calling supabase.auth.getSession()...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('🔍 getSession: supabase.auth.getSession() response:', { session, sessionError });
      
      if (sessionError) {
        console.error('❌ getSession: Session error:', sessionError);
        setSessionData((prev: SessionData) => ({ ...prev, isLoading: false }));
        return;
      }
      
      if (!session || !session.user) {
        console.log('🔍 getSession: No session or user found');
        setSessionData((prev: SessionData) => ({ ...prev, isLoading: false }));
        return;
      }

      const userId = session.user.id;
      console.log('🔍 getSession: Session found, userId:', userId);
      
      if (userId) {
        console.log('🔍 getSession: Setting userId in state:', userId);
        setSessionData((prev: SessionData) => ({ ...prev, userId }));
        
        // Fetch admin ID if user exists
        console.log('🔍 getSession: Fetching admin ID via API for userId:', userId);
        try {
          const adminResponse = await fetch('/api/fetchAdminId', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId })
          });
          
          console.log('🔍 getSession: Admin API response status:', adminResponse.status);
          
          if (adminResponse.ok) {
            const adminData = await adminResponse.json();
            console.log('🔍 getSession: Admin API response data:', adminData);
            setSessionData((prev: SessionData) => ({
              ...prev,
              adminId: adminData.adminId,
              isLoading: false
            }));
          } else if (adminResponse.status === 404) {
            // User is not an admin, which is fine
            console.log('🔍 getSession: User is not an admin (404)');
            setSessionData((prev: SessionData) => ({
              ...prev,
              adminId: null,
              isLoading: false
            }));
          } else {
            console.log('🔍 getSession: Admin API request failed with status:', adminResponse.status);
            setSessionData((prev: SessionData) => ({
              ...prev,
              isLoading: false
            }));
          }
        } catch (error) {
          console.log('🔍 getSession: Admin API request failed with error:', error);
          // Continue with student data fetch even if admin fetch fails
          setSessionData((prev: SessionData) => ({
            ...prev,
            isLoading: false
          }));
        }
        
        // Fetch student ID via API
        console.log('🔍 getSession: Fetching student ID via API for userId:', userId);
        const studentResponse = await fetch(`/api/studentId?userId=${userId}`);
        console.log('🔍 getSession: Student API response status:', studentResponse.status);
        
        if (studentResponse.ok) {
          const studentData = await studentResponse.json();
          console.log('🔍 getSession: Student API response data:', studentData);
          if (studentData.studentId) {
            console.log('🔍 getSession: Setting studentId in state:', studentData.studentId);
            setSessionData((prev: SessionData) => ({
              ...prev,
              studentId: studentData.studentId
            }));
          }
        } else {
          console.log('🔍 getSession: Student API request failed');
        }
      } else {
        console.log('🔍 getSession: No userId available');
        setSessionData((prev: SessionData) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('❌ getSession: Error fetching session data:', error);
      if (error instanceof Error) {
        console.error('❌ getSession: Error stack:', error.stack);
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setSessionData((prev: SessionData) => ({
        ...prev,
        error: `Error fetching session data: ${errorMessage}`,
        isLoading: false
      }));
    }
  };

  const initializeSession = async () => {
    try {
      setSessionData((prev: SessionData) => ({ ...prev, isLoading: true, error: null }));
      await fetchSessionData();
    } catch (error) {
      console.error('Error initializing session data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setSessionData((prev: SessionData) => ({
        ...prev,
        error: `Error initializing session data: ${errorMessage}`,
        isLoading: false
      }));
    }
  };

  useEffect(() => {
    initializeSession();
  }, []);

  const refreshSessionData = () => {
    initializeSession();
  };

  return {
    ...sessionData,
    refreshSessionData
  };
}
