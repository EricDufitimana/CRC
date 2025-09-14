"use client";


import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Label from "@/components/form/Label";
import { supabase } from '@/lib/supabase'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../zenith/src/components/ui/select";
import { Input } from "../../../../zenith/src/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "../../../../zenith/src/components/ui/button";
import { showToastError } from "@/components/toasts";
import * as motion from "motion/react-client";

export default function SignUpForm() {
  const router = useRouter();
  const[email, setEmail] = useState("");
  const[password, setPassword] = useState("");
  const[firstName, setFirstName] = useState("");
  const[lastName, setLastName] = useState("");
  const[studentCode, setStudentCode] = useState("");
  const[selectedStudentId, setSelectedStudentId] = useState("");
  const[unassignedStudents, setUnassignedStudents] = useState([]);
  const[isLoadingStudents, setIsLoadingStudents] = useState(true);
  const[studentSearchQuery, setStudentSearchQuery] = useState("");
  const[isGoogleSignUpLoading, setIsGoogleSignUpLoading] = useState(false);

  // Fetch unassigned students on component mount
  useEffect(() => {
    const fetchUnassignedStudents = async () => {
      console.log('🚀 Register: Starting to fetch unassigned students...');
      setIsLoadingStudents(true);
      
      try {
        console.log('📡 Register: Making API request to /api/students/unassigned...');
        const response = await fetch('/api/students/unassigned');
        
        console.log('📊 Register: Response status:', response.status);
        console.log('📊 Register: Response ok:', response.ok);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Register: Successfully fetched students:', data);
          console.log('✅ Register: Number of students:', data.length);
          setUnassignedStudents(data);
        } else {
          const errorData = await response.json();
          console.error('❌ Register: Failed to fetch unassigned students:', errorData);
          console.error('❌ Register: Response status:', response.status);
        }
      } catch (error) {
        console.error('💥 Register: Error fetching unassigned students:', error);
      } finally {
        console.log('🏁 Register: Setting loading to false');
        setIsLoadingStudents(false);
      }
    };

    fetchUnassignedStudents();
  }, []);

  // Update student code when a student is selected
  useEffect(() => {
    console.log('🔄 Register: Student selection changed:', selectedStudentId);
    console.log('🔄 Register: Available students:', unassignedStudents);
    
    if (selectedStudentId) {
      const selectedStudent = unassignedStudents.find(student => student.id === parseInt(selectedStudentId));
      console.log('🎯 Register: Found selected student:', selectedStudent);
      
      if (selectedStudent) {
        console.log('✅ Register: Setting student data:', {
          studentCode: selectedStudent.student_id,
          firstName: selectedStudent.first_name,
          lastName: selectedStudent.last_name
        });
        setStudentCode(selectedStudent.student_id);
        setFirstName(selectedStudent.first_name);
        setLastName(selectedStudent.last_name);
      }
    }
  }, [selectedStudentId, unassignedStudents]);

  // Filter students based on search query
  const filteredStudents = unassignedStudents.filter(student => {
    if (!studentSearchQuery.trim()) return true;
    
    const query = studentSearchQuery.toLowerCase();
    const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
    const studentId = student.student_id?.toLowerCase() || '';
    
    return fullName.includes(query) || studentId.includes(query);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(email, password, firstName, lastName, studentCode);

    // Add a small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));

    try{
      const {data, error} = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            student_code: studentCode,
            full_name: `${firstName} ${lastName}`
          }
        }
      })

      if(error){
        console.error("SignUp error:", error);
        alert(`Registration failed: ${error.message}`);
        return;
      }

      console.log("SignUp response:", data);
      
      // Check if user was created successfully
      if(data.user && data.user.id){
        const user_id = data.user.id;
      console.log("User ID:", user_id);
      
        // Create student record
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user_id,
          email: email,
          password: password,
          firstName: firstName,
          lastName: lastName,
          studentCode: studentCode,
        })
      })
        
      if(res.ok){
        console.log("Student created successfully");
          alert("Registration successful! Please check your email for confirmation.");
        router.push("/login");
      }else{
        const body = await res.json();
          console.error("Student creation failed:", body);
          alert(`Student creation failed: ${body.message || 'Unknown error'}`);
        }
      } else if(data.user && !data.user.email_confirmed_at) {
        // User created but needs email confirmation
        console.log("User created but needs email confirmation");
        alert("Registration successful! Please check your email and confirm your account before logging in.");
        router.push("/login");
      } else {
        console.log("Unexpected response:", data);
        alert("Registration completed but there was an unexpected response. Please try logging in.");
        router.push("/login");
      }
    }catch(error){
      console.error("Something Went Wrong Submit", error);
      alert(`Registration failed: ${error.message}`);
    }
  }
  const handleGoogleSignUp = async () => {
    if (!selectedStudentId) {
      showToastError({
        headerText: "Student record required",
        paragraphText: "Please select your student record before signing up with Google"
      });
      return;
    }
    
    try{
      setIsGoogleSignUpLoading(true);
      console.log('Initiating Google OAuth with student code:', studentCode);
      // Store student code in localStorage for the callback to access
      localStorage.setItem('pendingStudentCode', studentCode);
      
      const {data, error} = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })
      
      if(error){
        console.error("Google OAuth error:", error);
        alert(`Google OAuth error: ${error.message}`);
        setIsGoogleSignUpLoading(false);
      }else{
        console.log("Google OAuth initiated successfully");
        console.log("OAuth data:", data);
        // The user will be redirected to Google for authentication
        // Note: Loading state will be cleared when redirect happens
      }
    }catch(error){
      console.error("Something Went Wrong Google", error);
      alert(`Google OAuth failed: ${error.message}`);
      setIsGoogleSignUpLoading(false);
    }
  }


  
  return (
    <div className="flex flex-col flex-1  w-full overflow-y-auto lg:w-1/2 no-scrollbar py-4">
      <div className="w-full max-w-md mx-auto mb-5  sm:pt-10">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeft className="size-5" />
          Back to Landing Page
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-little-sm dark:text-white/90 sm:text-title-md">
              Sign Up
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Select your student record to sign up!
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div>
                  <Label>
                    Select Your Student Record
                  </Label>
                  <Select value={selectedStudentId} onValueChange={setSelectedStudentId} disabled={isLoadingStudents}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={isLoadingStudents ? "Loading students..." : "Select a student"}  />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingStudents ? (
                        <div className="p-4 text-center text-sm text-gray-500">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mx-auto mb-2"></div>
                          Loading students...
                        </div>
                      ) : unassignedStudents.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">
                          No unassigned students found
                        </div>
                      ) : (
                        <>
                          {/* Search Input */}
                          <div className="p-2 border-b border-gray-100">
                            <div className="relative">
                              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                placeholder="Search by name"
                                value={studentSearchQuery}
                                onChange={(e) => setStudentSearchQuery(e.target.value)}
                                className="pl-8 h-8 text-sm border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>
                          
                          {/* Student List */}
                          <div className="max-h-60 overflow-y-auto">
                            {filteredStudents.length === 0 ? (
                              <div className="p-4 text-center text-sm text-gray-500">
                                No students found matching "{studentSearchQuery}"
                              </div>
                            ) : (
                              filteredStudents.map((student) => (
                                <SelectItem key={student.id} value={student.id.toString()}>
                                  <div className="flex flex-col">
                                    <span className="font-normal">{student.first_name} {student.last_name}</span>
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </div>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  
                </div>
              </div>
            </form>
            
            <div className="mt-5">
              <button 
                onClick={selectedStudentId ? handleGoogleSignUp : () => showToastError({
                  headerText: "Student record required",
                  paragraphText: "Please select your student record first"
                })} 
                disabled={isGoogleSignUpLoading}
                className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200 hover:text-gray-800 w-[100%] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGoogleSignUpLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin"></div>
                    <span>Signing up with Google...</span>
                  </>
                ) : (
                  <>
                    <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18.7511 10.1944C18.7511 9.47495 18.6915 8.94995 18.5626 8.40552H10.1797V11.6527H15.1003C15.0011 12.4597 14.4654 13.675 13.2749 14.4916L13.2582 14.6003L15.9087 16.6126L16.0924 16.6305C17.7788 15.1041 18.7511 12.8583 18.7511 10.1944Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M10.1788 18.75C12.5895 18.75 14.6133 17.9722 16.0915 16.6305L13.274 14.4916C12.5201 15.0068 11.5081 15.3666 10.1788 15.3666C7.81773 15.3666 5.81379 13.8402 5.09944 11.7305L4.99473 11.7392L2.23868 13.8295L2.20264 13.9277C3.67087 16.786 6.68674 18.75 10.1788 18.75Z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.10014 11.7305C4.91165 11.186 4.80257 10.6027 4.80257 9.99992C4.80257 9.3971 4.91165 8.81379 5.09022 8.26935L5.08523 8.1534L2.29464 6.02954L2.20333 6.0721C1.5982 7.25823 1.25098 8.5902 1.25098 9.99992C1.25098 11.4096 1.5982 12.7415 2.20333 13.9277L5.10014 11.7305Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M10.1789 4.63331C11.8554 4.63331 12.9864 5.34303 13.6312 5.93612L16.1511 3.525C14.6035 2.11528 12.5895 1.25 10.1789 1.25C6.68676 1.25 3.67088 3.21387 2.20264 6.07218L5.08953 8.26943C5.81381 6.15972 7.81776 4.63331 10.1789 4.63331Z"
                    fill="#EB4335"
                  />
                                    </svg>
                    <span>Sign up with Google</span>
                  </>
                )}
              </button>
            </div>


            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Already have an account? {""}
                <Link
                  href="/login"
                  className="text-primary hover:text-brand-600 hover:underline dark:text-orange-400"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div> 
        </div>
      </div>
    </div>
  );
}



