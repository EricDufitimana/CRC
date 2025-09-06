"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../zenith/src/components/ui/card";
import { Button } from "../../../zenith/src/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../../zenith/src/components/ui/avatar";
import { Skeleton } from "../../../zenith/src/components/ui/skeleton";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { useUserData } from "@/hooks/useUserData";
import { useRouter } from "next/navigation";
import { ArrowRight, User, FileText, Upload, Image as ImageIcon, Camera, ArrowLeft } from "lucide-react";
import { getAvatars, AvatarData } from "@/actions/avatars/getAvatars";

export default function StudentSetupPage() {
  const [studentData, setStudentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState<'upload' | 'existing'>('upload');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [fetchedAvatars, setFetchedAvatars] = useState<AvatarData[]>([]);
  const [isLoadingAvatars, setIsLoadingAvatars] = useState(false);
  const { userId, studentId, isLoading: userDataLoading } = useUserData();
  const router = useRouter();

  // Fetch student profile data when userId is available
  useEffect(() => {
    const fetchStudentProfile = async () => {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const resp = await fetch(`/api/studentId?userId=${userId}`);
        if (!resp.ok) throw new Error("Failed to fetch student data");
        
        const data = await resp.json();
        console.log('🔍 studentData:', data);
        setStudentData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        console.error("Error fetching student data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStudentProfile();
  }, [userId]);

  const handleContinue = async () => {
    if (currentStep < 2) {
      // Move to next step
      setCurrentStep(prev => prev + 1);
    } else {
      // Complete setup and navigate to dashboard
    try {
      // Mark user as no longer new
      const response = await fetch('/api/mark-user-completed-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        console.error('Failed to mark user as completed setup');
      }

      // Navigate to the main dashboard
      router.push('/dashboard/student');
    } catch (error) {
      console.error('Error completing setup:', error);
      // Still navigate to dashboard even if marking fails
      router.push('/dashboard/student');
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Fetch avatars from server action
  const fetchAvatarsFromServer = async () => {
    setIsLoadingAvatars(true);
    try {
      const result = await getAvatars();
      if (result.success) {
        setFetchedAvatars(result.avatars);
      } else {
        console.error('Error fetching avatars:', result.error);
        // Keep fallback avatars if server fetch fails
      }
    } catch (error) {
      console.error('Error fetching avatars:', error);
    } finally {
      setIsLoadingAvatars(false);
    }
  };

  // Fetch avatars when component mounts
  useEffect(() => {
    fetchAvatarsFromServer();
  }, []);

  const setupSteps = [
    {
      icon: Camera,
      title: "Choose Profile Picture",
      description: "Select your profile picture"
    },
    {
      icon: FileText,
      title: "Upload Report",
      description: "Upload your academic report"
    },
    {
      icon: FileText,
      title: "Upload Resume",
      description: "Upload your resume"
    }
  ];

  // Use fetched avatars from Supabase, fallback to sample avatars if none loaded
  const sampleAvatars = [
    { id: 'avatar-1', src: '/images/avatars/avatar-001.png', name: 'Professional' },
    { id: 'avatar-2', src: '/images/avatars/avatar-002.png', name: 'Casual' },
    { id: 'avatar-3', src: '/images/avatars/avatar-003.png', name: 'Creative' },
  ];
  
  const avatarsToShow = fetchedAvatars.length > 0 ? fetchedAvatars : sampleAvatars;

  if (userDataLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <p className="text-red-500">Error loading profile: {error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>  
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6 pt-[70px]">
      <Card className="w-full max-w-lg shadow-lg border-0 relative z-50 ring-1 ring-white/20 backdrop-blur-sm bg-white/90 mx-auto">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900 mb-2">
            {currentStep === 0 && "Welcome to CRC Platform!"}
            {currentStep === 1 && "Profile Setup"}
            {currentStep === 2 && "Upload Documents"}
          </CardTitle>
          
          <p className="text-sm text-gray-600">
            {currentStep === 0 && "Let's get you set up with your profile and documents."}
            {currentStep === 1 && "Choose your profile picture to personalize your account."}
            {currentStep === 2 && "Upload your academic reports and resume to complete your profile."}
          </p>
          <div className="absolute top-0 right-6 z-50">
              <span className="text-green-600 font-semibold text-xs">
                Step {currentStep} of 3
              </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 relative">
          {/* Step Counter - Show on all steps */}
         

          {/* Setup Steps Preview - Only show on step 0 */}
          {currentStep === 0 && (
            <div className="space-y-4">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900 text-center">
              Setup steps:
            </h3>
            
            <div className="space-y-2">
              {setupSteps.map((step, index) => {
                const IconComponent = step.icon;
                return (
                      <div key={index} className="flex items-center space-x-3 p-3 rounded-md backdrop-blur-sm border bg-white/60 border-white/30">
                    <div className="flex-shrink-0">
                      <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <IconComponent className="h-3 w-3 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{step.title}</h4>
                      <p className="text-xs text-gray-600">{step.description}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="h-4 w-4 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">{index + 1}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
            </div>
          )}

          {/* Profile Picture Selection - Only show on step 1 */}
          {currentStep === 1 && (
            <div className="space-y-8">
              {/* Avatar Preview */}
              <div className="flex justify-center">
                <Avatar className="h-28 w-28 ring-4 ring-white/30 shadow-2xl">
                  <AvatarImage src={selectedAvatar || '/images/avatars/avatar-001.png'} />
                  <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 text-white">
                    {studentData?.first_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Toggle */}
              <div className="flex justify-center">
                <div className="inline-flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('upload')}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      activeTab === 'upload'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Upload New
                  </button>
                  <button
                    onClick={() => setActiveTab('existing')}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      activeTab === 'existing'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Choose Avatar
                  </button>
                </div>
              </div>

              {/* Minimalist Content */}
              <div className="min-h-[160px]">
                {activeTab === 'upload' ? (
                  <div className="flex justify-center">
                    <div className="w-full max-w-xs">
                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-blue-300 transition-colors duration-200 cursor-pointer">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                          <Upload className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Drop your photo</p>
                        <p className="text-xs text-gray-500 mb-4">or click to browse</p>
                        <Button variant="ghost" size="sm" className="text-sm text-blue-600 hover:text-blue-700">
                          Choose File
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {isLoadingAvatars ? (
                      <div className="flex justify-center items-center py-12">
                        <div className="flex space-x-2">
                          <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
                          <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="ml-3 text-sm text-gray-600">Loading avatars...</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
                        {avatarsToShow.map((avatar) => (
                          <button
                            key={avatar.id}
                            onClick={() => setSelectedAvatar(avatar.src)}
                            className={`relative aspect-square rounded-lg overflow-hidden transition-all duration-200 ${
                              selectedAvatar === avatar.src
                                ? 'ring-2 ring-blue-500'
                                : 'hover:ring-2 hover:ring-gray-300'
                            }`}
                          >
                            <Avatar className="h-full w-full">
                              <AvatarImage src={avatar.src} alt={avatar.name} />
                              <AvatarFallback className="bg-gray-100 text-gray-600 text-sm font-medium">
                                {avatar.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            {selectedAvatar === avatar.src && (
                              <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                  <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Upload Documents - Only show on step 2 */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 text-center">
                Upload your documents
              </h3>
              
              <div className="space-y-4">
                {/* Academic Reports Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200">
                  <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Academic Reports</h4>
                  <p className="text-xs text-gray-600 mb-3">Upload your transcripts or academic reports</p>
                  <Button variant="outline" size="sm" className="text-xs">
                    Choose File
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">PDF, DOC up to 5MB</p>
                </div>

                {/* Resume Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200">
                  <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Resume/CV</h4>
                  <p className="text-xs text-gray-600 mb-3">Upload your resume or curriculum vitae</p>
                  <Button variant="outline" size="sm" className="text-xs">
                    Choose File
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">PDF, DOC up to 5MB</p>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="flex items-center space-x-2">
                  <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs text-green-700">
                    Don't worry! You can always update these documents later from your dashboard.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          {currentStep === 0 ? (
            /* Centered Continue Button for Step 0 */
          <div className="text-center pt-2">
            <Button 
              onClick={handleContinue}
              size="sm"
                className="group inline-flex items-center justify-center gap-3 px-7 py-3 bg-dark border border-dark text-white font-medium rounded-md hover:bg-gray-800 shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition-all duration-200 ease-linear"
              >
                <span>Continue</span>
                <ArrowRight className="w-5 h-5 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" />
              </Button>
              
              <p className="text-xs text-gray-500 mt-2">
                You can update these later
              </p>
            </div>
          ) : (
            /* Back and Continue Buttons for Steps 1 and 2 */
            <div className="flex items-center justify-between pt-2">
              {/* Back Button */}
              <Button 
                onClick={handleBack}
                variant="outline"
                size="sm"
                className="group inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border-gray-300 hover:bg-gray-50 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 transition-all duration-300 group-hover:-translate-x-1" />
                <span>Back</span>
              </Button>
              
              {/* Continue Button */}
              <div className="text-center">
                <Button 
                  onClick={handleContinue}
                  size="sm"
                  className="group inline-flex items-center justify-center gap-3 px-7 py-3 bg-dark border border-dark text-white font-medium rounded-md hover:bg-gray-800 shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition-all duration-200 ease-linear"
                >
                  <span>{currentStep < 2 ? 'Continue' : 'Complete Setup'}</span>
                  <ArrowRight className="w-5 h-5 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" />
            </Button>
            
            <p className="text-xs text-gray-500 mt-2">
              You can update these later
            </p>
          </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </>
  );
}

