"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "../../../zenith/src/components/ui/card";
import { Button } from "../../../zenith/src/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../../zenith/src/components/ui/avatar";
import { Skeleton } from "../../../zenith/src/components/ui/skeleton";
import { Input } from "../../../zenith/src/components/ui/input";
import { FileUpload } from "../../../zenith/src/components/ui/file-upload";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { useUserData } from "@/hooks/useUserData";
import { useRouter } from "next/navigation";
import { ArrowRight, User, FileText, Upload, Image as ImageIcon, Camera, ArrowLeft, Link, Loader2 } from "lucide-react";
import { getAvatars, AvatarData as BaseAvatarData } from "@/actions/avatars/getAvatars";
import { getAvatarsWithSignedUrls, AvatarData } from "@/actions/avatars/getAvatarsWithSignedUrls";
import { useAvatarFetch } from "@/hooks/useAvatarFetch";
import { AnimatedText } from "@/components/animation/AnimatedText";
import imageCompression from "browser-image-compression";

// URL validation schema
const urlSchema = z.string().url("Please enter a valid URL");

export default function StudentSetupPage() {
  const [studentData, setStudentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState<'upload' | 'existing'>('upload');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [selectedAvatarPath, setSelectedAvatarPath] = useState<string | null>(null);
  const [selectedBackground, setSelectedBackground] = useState<string>('statColors-1');
  
  // Use the useAvatarFetch hook
  const { 
    avatars: fetchedAvatars, 
    isLoading: isLoadingAvatars, 
    error: avatarError,
    fetchAvatars 
  } = useAvatarFetch();
  const [academicReportFile, setAcademicReportFile] = useState<File[]>([]);
  const [resumeLink, setResumeLink] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedAvatarFile, setUploadedAvatarFile] = useState<File[]>([]);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [showWelcomeText, setShowWelcomeText] = useState<boolean>(false);
  const [showButton, setShowButton] = useState<boolean>(false);
  const [resumeUrlError, setResumeUrlError] = useState<string | null>(null);
  const { userId, studentId, isLoading: userDataLoading } = useUserData();
  const router = useRouter();

  // Image compression function
  async function compressImage(file: File): Promise<File> {
    if (!file) return file;
    try {
      console.log(`🔧 Setup: Compressing image: ${file.name} (${file.size} bytes)`);
      const options = {
        maxSizeMB: 2,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);
      console.log(`✅ Setup: Compression complete: ${file.name} - ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
      return compressedFile;
    } catch (error) {
      console.error(`❌ Setup: Error compressing image:`, error);
      return file; // Return original file if compression fails
    }
  }

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
    console.log('🚀 Setup: handleContinue called', { currentStep, isUploading });
    
    // Clear any previous errors
    setSetupError(null);
    setResumeUrlError(null);
    
    // Validate required fields on step 3 (final step)
    if (currentStep === 3) {
      if (academicReportFile.length === 0) {
        setSetupError('Academic report is required to complete setup.');
        return;
      }
      
      // Validate resume URL if provided
      if (resumeLink.trim()) {
        const urlValidation = urlSchema.safeParse(resumeLink.trim());
        if (!urlValidation.success) {
          setResumeUrlError(urlValidation.error.errors[0].message);
          return;
        }
      }
    }
    
    if (currentStep < 3) {
      // Move to next step
      console.log('📝 Setup: Moving to next step', { from: currentStep, to: currentStep + 1 });
      setCurrentStep(prev => prev + 1);
    } else {
      // Complete setup and upload documents
      console.log('🎯 Setup: Starting final setup process...');
      try {
        setIsUploading(true);
        
        // Log all current state values
        console.log('📊 Setup: Current state values:', {
          studentId,
          userId,
          selectedAvatar,
          selectedAvatarPath,
          activeTab,
          uploadedAvatarFile: uploadedAvatarFile.length,
          academicReportFile: academicReportFile.length,
          resumeLink,
          selectedBackground
        });
        
        // Update profile with all selected data using unified API
        const formData = new FormData();
        formData.append('student_id', studentId?.toString() || '');
        formData.append('user_id', userId || '');
        
        // Add avatar path if selected from existing avatars
        if (selectedAvatarPath && activeTab === 'existing') {
          console.log('🖼️ Setup: Adding existing avatar path:', selectedAvatarPath);
          formData.append('avatar_path', selectedAvatarPath);
        }
        
        // Add uploaded avatar file if provided
        if (uploadedAvatarFile.length > 0) {
          console.log('📤 Setup: Adding uploaded avatar file:', {
            fileName: uploadedAvatarFile[0].name,
            fileSize: uploadedAvatarFile[0].size,
            fileType: uploadedAvatarFile[0].type
          });
          formData.append('avatar', uploadedAvatarFile[0]);
        }
        
        // Add academic report if provided
        if (academicReportFile.length > 0) {
          console.log('📄 Setup: Adding academic report file:', {
            fileName: academicReportFile[0].name,
            fileSize: academicReportFile[0].size,
            fileType: academicReportFile[0].type
          });
          formData.append('academic_report', academicReportFile[0]);
        }
        
        // Add resume link if provided
        if (resumeLink.trim()) {
          console.log('🔗 Setup: Adding resume link:', resumeLink.trim());
          formData.append('resume_link', resumeLink.trim());
        }
        
        // Add profile background
        console.log('🎨 Setup: Adding profile background:', selectedBackground);
        formData.append('profile_background', selectedBackground);

        // Log FormData contents
        console.log('📋 Setup: FormData contents (Profile Update with AI Processing):');
        console.log('  student_id:', formData.get('student_id'));
        console.log('  user_id:', formData.get('user_id'));
        console.log('  avatar_path:', formData.get('avatar_path'));
        console.log('  avatar:', formData.get('avatar') ? 'File present' : 'No file');
        console.log('  academic_report:', formData.get('academic_report') ? 'File present' : 'No file');
        console.log('  resume_link:', formData.get('resume_link'));
        console.log('  profile_background:', formData.get('profile_background'));
        console.log('📋 Setup: Update-profile API will handle AI processing of documents');

        console.log('🌐 Setup: Sending request to /api/students/update-profile...');
        const profileResponse = await fetch('/api/students/update-profile', {
          method: 'POST',
          body: formData,
        });

        console.log('📡 Setup: Profile response status:', profileResponse.status);
        
        if (!profileResponse.ok) {
          const errorData = await profileResponse.json();
          console.error('❌ Setup: Failed to update profile:', errorData);
          setSetupError(`Profile update failed: ${errorData.error || 'Unknown error'}`);
          return; // Stop execution and don't redirect
        } else {
          const successData = await profileResponse.json();
          console.log('✅ Setup: Profile updated successfully:', successData);
        }

        // Mark user as having completed setup
        console.log('👤 Setup: Marking user as having completed setup...');
        const response = await fetch('/api/mark-setup-completed', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        });

        console.log('📡 Setup: Mark setup completed response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('❌ Setup: Failed to mark user as having completed setup:', errorData);
          setSetupError(`Setup completion failed: ${errorData.error || 'Unknown error'}`);
          return; // Stop execution and don't redirect
        } else {
          console.log('✅ Setup: User marked as having completed setup');
        }

        // Only navigate to dashboard if everything succeeded
        console.log('🏠 Setup: All operations successful, navigating to dashboard...');
        
        // Keep uploading state true until redirect
        setTimeout(() => {
          router.push('/dashboard/student');
        }, 1000);
      } catch (error) {
        console.error('💥 Setup: Error completing setup:', error);
        setSetupError(`Setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setIsUploading(false); // Reset uploading state on error
        // Don't redirect on error
      } finally {
        // Don't set isUploading to false here - let it stay true until redirect
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };


  // Fetch avatars when component mounts
  useEffect(() => {
    fetchAvatars();
  }, [fetchAvatars]);

  // Sequential animation timing for step 0
  useEffect(() => {
    if (currentStep === 0 && studentData?.first_name) {
      // Reset animation states
      setShowWelcomeText(false);
      setShowButton(false);
      
      // Show welcome text after greeting animation completes (estimated 2.5 seconds)
      const welcomeTimer = setTimeout(() => {
        console.log('Setting showWelcomeText to true');
        setShowWelcomeText(true);
        
        // Force a longer delay to ensure the element is mounted and scroll trigger is ready
        setTimeout(() => {
          // Force ScrollTrigger to refresh and recalculate
          if (typeof window !== 'undefined' && (window as any).ScrollTrigger) {
            (window as any).ScrollTrigger.refresh();
            // Force trigger the animation by scrolling
            window.scrollTo(0, window.scrollY + 1);
            window.scrollTo(0, window.scrollY - 1);
          }
        }, 500);
      }, 2500);
      
      // Show button after welcome text animation completes (estimated 6 seconds total)
      const buttonTimer = setTimeout(() => {
        setShowButton(true);
      }, 5100);
      
      return () => {
        clearTimeout(welcomeTimer);
        clearTimeout(buttonTimer);
      };
    } else if (currentStep !== 0) {
      // Reset animation states when not on step 0
      setShowWelcomeText(false);
      setShowButton(false);
    }
  }, [currentStep, studentData?.first_name]);


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

  const totalSteps = 3; // Steps Overview (1), Profile Setup (2), Documents (3)

  // Use fetched avatars from Supabase, fallback to sample avatars if none loaded
  const sampleAvatars = [
    { id: 'avatar-1', src: '/images/avatars/avatar-001.png', name: 'Professional', folder: 'sample', filePath: 'default/1/avatar-001.png' },
    { id: 'avatar-2', src: '/images/avatars/avatar-002.png', name: 'Casual', folder: 'sample', filePath: 'default/2/avatar-002.png' },
    { id: 'avatar-3', src: '/images/avatars/avatar-003.png', name: 'Creative', folder: 'sample', filePath: 'default/3/avatar-003.png' },
  ];
  
  const avatarsToShow = fetchedAvatars.length > 0 ? fetchedAvatars : sampleAvatars;

  // Background color options from statColors
  const backgroundColors = [
    { id: 'statColors-1', name: 'Green', class: 'bg-statColors-1' },
    { id: 'statColors-2', name: 'Teal', class: 'bg-statColors-2' },
    { id: 'statColors-3', name: 'Orange', class: 'bg-statColors-3' },
    { id: 'statColors-4', name: 'Cream', class: 'bg-statColors-4' },
    { id: 'statColors-5', name: 'Light Cream', class: 'bg-statColors-5' },
    { id: 'statColors-6', name: 'Pale Yellow', class: 'bg-statColors-6' },
    { id: 'statColors-7', name: 'Light Blue', class: 'bg-statColors-7' },
    { id: 'statColors-8', name: 'Coral', class: 'bg-statColors-8' },
    { id: 'statColors-9', name: 'Dark Orange', class: 'bg-statColors-9' },
  ];

  if (userDataLoading || isLoading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: 'url("/images/setup/setup-background.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-2 border-gray-200 dark:border-gray-700 border-t-primary rounded-full animate-spin"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Loading Setup Page...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while the setup page gets ready
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="flex items-center justify-center h-full min-h-screen overflow-hidden"
        style={{
          backgroundImage: 'url("/images/setup/setup-background.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="text-center space-y-4">
          <p className="text-red-500">Error loading profile: {error}</p>
          <Button onClick={() => window.location.reload()} className="bg-dark hover:bg-dark/90  text-white">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>  
      {/* Content Container with Background */}
      <div 
        className="relative flex items-center justify-center min-h-screen p-6 pt-[70px] overflow-hidden"
        style={{
          backgroundImage: 'url("/images/setup/setup-background.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Decorative Illustrations - Above background, below content */}
        <div className="absolute inset-0 pointer-events-none z-10">
          {/* Top Left - Setup Stars */}
          <div className="absolute top-0 left-4 opacity-70">
            <Image 
              src="/images/setup/setup-stars.svg" 
              alt="Decorative stars" 
              width={100}
              height={100}
              className="object-contain"
            />
          </div>
          
          {/* Top Right - Setup Wave */}
          <div className="absolute bottom-0 -left-32 opacity-70">
            <Image 
              src="/images/setup/setup-wave.svg" 
              alt="Decorative wave" 
              width={400}
              height={400}
              className="object-contain"
            />
          </div>
          
          {/* Bottom Left - Setup Blob */}
          <div className="absolute bottom-0 -right-16">
            <Image 
              src="/images/setup/setup-blob.svg" 
              alt="Decorative blob" 
              width={400}
              height={400}
              className="object-contain opacity-90"
            />
          </div>
          
          {/* Bottom Right - Setup Illustration */}
          <div className="absolute top-0 right-0">
            <Image 
              src="/images/setup/setup-illustration.svg" 
              alt="Setup illustration" 
              width={112}
              height={112}
              className="object-contain"
            />
          </div>
        </div>

        {/* Main Content - Above illustrations */}
        <div className="relative z-20 w-full">
      <Card className="w-full max-w-lg shadow-lg border-0 relative z-50 ring-1 ring-white/20 backdrop-blur-sm bg-white/90 mx-auto">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900 mb-2">
            {currentStep === 0 && (
              <div className="text-center">
                <AnimatedText 
                  animation="letters-fade-in"
                  as="div"
                  className="text-4xl font-bold text-gray-900 mb-4 font-cal-sans"
                  startTrigger="top center"
                >
                  {studentData?.first_name && studentData?.last_name 
                    ? `Hi, ${studentData.first_name} ${studentData.last_name}!` 
                    : studentData?.first_name 
                      ? `Hi, ${studentData.first_name}!` 
                      : 'Hi!'
                  }
                </AnimatedText>
                {showWelcomeText && (
                  <div className="mt-2">
                    <AnimatedText 
                      animation="letters-fade-in"
                      as="div"
                    className="text-xl font-light text-gray-500 "
                      startTrigger="top bottom"
                    >
                      Welcome to the CRC Platform!
                    </AnimatedText>
                  </div>
                )}
              </div>
            )}
            {currentStep === 1 && "Setup Overview"}
            {currentStep === 2 && "Profile Setup"}
            {currentStep === 3 && "Upload Documents"}
          </CardTitle>
          
          <div className="text-sm text-gray-600">
            {currentStep === 1 && <p>Here&apos;s what we&apos;ll do together to set up your profile.</p>}
            {currentStep === 2 && <p>Choose your profile picture to personalize your account.</p>}
            {currentStep === 3 && <p>Upload your academic reports and resume to complete your profile.</p>}
          </div>
          {currentStep > 0 && (
            <div className="absolute top-0 right-6 z-50">
              <span className="text-green-600 font-semibold text-xs">
                Step {currentStep} of {totalSteps}
              </span>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6 relative">
          {/* Step Counter - Show on all steps */}
         

          {/* Setup Steps Preview - Only show on step 1 */}
          {currentStep === 1 && (
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
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <IconComponent className="h-4 w-4 text-blue-600" />
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

          {/* Profile Picture Selection - Only show on step 2 */}
          {currentStep === 2 && (
            <div className="space-y-8">
              {/* Avatar Preview */}
              <div className="flex justify-center">
                <div className="relative">
                  <Avatar className={`h-28 w-28 ring-4 ring-white/30 shadow-2xl bg-${selectedBackground}`}>
                    <AvatarImage 
                      src={
                        activeTab === 'upload' && uploadedAvatarFile.length > 0
                          ? URL.createObjectURL(uploadedAvatarFile[0])
                          : selectedAvatar || '/images/avatars/avatar-001.png'
                      } 
                    />
                    <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 text-white">
                      {studentData?.first_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
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
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-4">Upload your own profile picture</p>
                      <FileUpload
                        multiple={false}
                        accept="image/*"
                        value={uploadedAvatarFile}
                        onChange={async (files) => {
                          console.log('📤 Setup: Avatar file selected:', files.length > 0 ? {
                            fileName: files[0].name,
                            fileSize: files[0].size,
                            fileType: files[0].type
                          } : 'No files');
                          
                          if (files.length > 0 && activeTab === 'upload') {
                            console.log('🔧 Setup: Starting image compression for avatar upload...');
                            try {
                              const compressedImage = await compressImage(files[0]);
                              console.log('✅ Setup: Avatar compression result:', {
                                name: compressedImage.name,
                                size: compressedImage.size,
                                type: compressedImage.type
                              });
                              setUploadedAvatarFile([compressedImage]);
                            } catch (error) {
                              console.error('❌ Setup: Error compressing avatar image:', error);
                              // Fallback to original file if compression fails
                              setUploadedAvatarFile(files);
                            }
                          } else {
                            setUploadedAvatarFile(files);
                          }
                        }}
                        placeholder="Drop your photo here or click to upload"
                        helperText="JPEG, PNG, GIF, WebP up to 2MB"
                        className="max-w-md mx-auto"
                      />
                    </div>
                    
           
                  </div>
                ) : (
                  <div className="space-y-6">
                    {isLoadingAvatars ? (
                      <div className="flex flex-col justify-center items-center py-16">
                        <div className="relative mb-6">
                          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Camera className="h-6 w-6 text-blue-500 animate-pulse" />
                          </div>
                        </div>
                        <div className="text-center space-y-2">
                          <h3 className="text-lg font-semibold text-gray-900">Loading Avatars</h3>
                          <p className="text-sm text-gray-600">Fetching your personalized avatar options...</p>
                          <div className="flex justify-center space-x-1 mt-4">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Avatar and Background Selection Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Avatar Selection */}
                          <div className="space-y-4">
                            <h4 className="text-sm font-medium text-gray-900 text-center">Choose Avatar</h4>
                            
                            {/* Show folder organization if we have many avatars */}
                            {avatarsToShow.length > 8 && (
                              <div className="text-center">
                                <p className="text-xs text-gray-500">
                                  {avatarsToShow.length} available avatars
                                </p>
                              </div>
                            )}
                            
                            {/* Avatar Grid - Bigger */}
                            <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
                              {avatarsToShow.map((avatar, index) => (
                                <button
                                  key={avatar.id}
                                  onClick={() => {
                                    const filePath = 'filePath' in avatar && avatar.filePath ? avatar.filePath : `default/${avatar.folder}/${'fileName' in avatar ? avatar.fileName : avatar.name.toLowerCase().replace(/\s+/g, '-')}.png`;
                                    console.log('🖼️ Setup: Avatar selected:', { 
                                      id: avatar.id, 
                                      src: avatar.src, 
                                      name: avatar.name,
                                      folder: avatar.folder,
                                      filePath: filePath
                                    });
                                    setSelectedAvatar(avatar.src); // For display
                                    setSelectedAvatarPath(filePath); // For storage
                                  }}
                                  className={`relative aspect-square rounded-lg overflow-hidden transition-all duration-200 transform hover:scale-105 ${
                                    selectedAvatar === avatar.src
                                      ? 'ring-2 ring-blue-500 shadow-lg scale-105'
                                      : 'hover:ring-2 hover:ring-gray-300 hover:shadow-md'
                                  }`}
                                >
                                  <Avatar className="h-full w-full">
                                    <AvatarImage 
                                      src={avatar.src} 
                                      alt={avatar.name}
                                      className="object-cover"
                                      onLoad={() => {
                                        // Avatar loaded successfully
                                      }}
                                      onError={() => {
                                        // Handle avatar load error
                                        console.warn('Failed to load avatar:', avatar.src);
                                      }}
                                    />
                                    <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 text-xs font-medium animate-pulse">
                                      <div className="w-full h-full flex items-center justify-center">
                                        <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                                      </div>
                                    </AvatarFallback>
                                  </Avatar>
                                  
                                  {/* Selection indicator */}
                                  {selectedAvatar === avatar.src && (
                                    <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                                        <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      </div>
                                    </div>
                                  )}
                                 
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Background Color Selection */}
                          <div className="space-y-4">
                            <h4 className="text-sm font-medium text-gray-900 text-center">Choose Background</h4>
                            
                            {/* Background Color Grid */}
                            <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
                              {backgroundColors.map((color) => (
                                <button
                                  key={color.id}
                                  onClick={() => {
                                    console.log('🎨 Setup: Background color selected:', { 
                                      id: color.id, 
                                      name: color.name,
                                      class: color.class 
                                    });
                                    setSelectedBackground(color.id);
                                  }}
                                  className={`relative aspect-square rounded-lg overflow-hidden transition-all duration-200 transform hover:scale-105 ${
                                    selectedBackground === color.id
                                      ? 'ring-2 ring-blue-500 shadow-lg scale-105'
                                      : 'hover:ring-2 hover:ring-gray-300 hover:shadow-md'
                                  }`}
                                >
                                  <div className={`h-full w-full ${color.class} flex items-center justify-center`}>
                                    {/* Selection indicator */}
                                    {selectedBackground === color.id && (
                                      <div className="w-6 h-6 bg-white/80 rounded-full flex items-center justify-center shadow-lg">
                                        <svg className="h-4 w-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Color name */}
                                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                                    {color.name}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                     </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Upload Documents - Only show on step 3 */}
          {currentStep === 3 && (
            <div className="space-y-6">
       
              
              <div className="space-y-6">
                {/* Academic Reports Upload */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-gray-600" />
                    <h4 className="text-base font-medium text-gray-900">Academic Reports</h4>
                    <span className="text-red-500 text-xs">*Required</span>
                  </div>
                  <FileUpload
                    multiple={false}
                    accept=".pdf,.doc,.docx"
                    value={academicReportFile}
                    onChange={(files) => {
                      console.log('📄 Setup: Academic report file selected:', files.length > 0 ? {
                        fileName: files[0].name,
                        fileSize: files[0].size,
                        fileType: files[0].type
                      } : 'No files');
                      setAcademicReportFile(files);
                    }}
                    placeholder="Drop your academic report here or click to upload"
                    helperText="PDF, DOC, DOCX up to 5MB"
                    className="max-w-full"
                  />
                </div>

                {/* Resume Link Input */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Link className="h-5 w-5 text-gray-600" />
                    <h4 className="text-base font-medium text-gray-900">Resume/CV Link</h4>
                    <span className="text-gray-400 text-xs">(Optional)</span>
                  </div>
                  <Input
                    type="url"
                    placeholder="https://docs.google.com/document/..."
                    value={resumeLink}
                    onChange={(e) => {
                      console.log('🔗 Setup: Resume link changed:', e.target.value);
                      setResumeLink(e.target.value);
                      
                      // Clear URL error when user starts typing
                      if (resumeUrlError) {
                        setResumeUrlError(null);
                      }
                      
                      // Real-time validation if there's content
                      if (e.target.value.trim()) {
                        const urlValidation = urlSchema.safeParse(e.target.value.trim());
                        if (!urlValidation.success) {
                          setResumeUrlError(urlValidation.error.errors[0].message);
                        }
                      }
                    }}
                  />
                  {resumeUrlError && (
                    <p className="text-red-500 text-xs mt-1">{resumeUrlError}</p>
                  )}
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="flex items-center space-x-2">
                  <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs text-green-700">
                    Don&apos;t worry! You can always update these documents later from your dashboard.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {setupError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2">
                <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-800">Setup Error</h3>
                  <p className="text-sm text-red-700 mt-1">{setupError}</p>
                </div>
              </div>
              <div className="mt-3 flex space-x-2">
                <Button
                  onClick={() => setSetupError(null)}
                  variant="outline"
                  size="sm"
                  className="text-red-700 border-red-300 hover:bg-red-100"
                >
                  Dismiss
                </Button>
                <Button
                  onClick={handleContinue}
                  size="sm"
                  disabled={isUploading}
                  className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                >
                  {isUploading ? 'Retrying...' : 'Try Again'}
                </Button>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          {currentStep === 0 && (
            /* Centered Continue Button for Step 0 */
            showButton && (
              <div className="text-center pt-2 animate-fade-in">
                <Button 
                  onClick={handleContinue}
                  size="sm"
                  disabled={isUploading}
                  className="group inline-flex items-center justify-center gap-3 px-7 py-3 bg-dark border border-dark text-white font-medium rounded-md hover:bg-gray-800 shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition-all duration-200 ease-linear disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-5 h-5 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" />
                </Button>
              </div>
            )
          )}
          {currentStep === 1 &&  (
            /* Back and Continue Buttons for Steps 1 */
            <div className="pt-2">
              <div className="flex items-center justify-center">
              
                {/* Continue Button */}
                <Button 
                  onClick={handleContinue}
                  size="sm"
                  disabled={isUploading}
                  className="group inline-flex items-center justify-center gap-3 px-7 py-3 bg-dark border border-dark text-white font-medium rounded-md hover:bg-gray-800 shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition-all duration-200 ease-linear disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>
                    {isUploading 
                      ? 'Uploading...' 
                      : currentStep < 3 
                        ? 'Continue' 
                        : 'Complete Setup'
                    }
                  </span>
                  {!isUploading && (
                    <ArrowRight className="w-5 h-5 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" />
                  )}
                </Button>
              </div>
              
              {/* Centered paragraph below buttons */}
              <div className="text-center mt-2">
                <p className="text-xs text-gray-500">
                  You can update these later
                </p>
              </div>
            </div>
          ) 
        }
        {(currentStep === 2 || currentStep === 3) && (
            <div className="pt-2">
            <div className="flex items-center justify-between">
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
              <Button 
                onClick={handleContinue}
                size="sm"
                disabled={isUploading}
                className="group inline-flex items-center justify-center gap-3 px-7 py-3 bg-dark border border-dark text-white font-medium rounded-md hover:bg-gray-800 shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition-all duration-200 ease-linear disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>
                  {isUploading 
                    ?
                    <div className="flex items-center gap-2">
                     <Loader2 className="w-4 h-4 animate-spin text-white" />
                     Uploading...
                    </div> 
                    
                    : currentStep < 3 
                      ? 'Continue' 
                      : 'Complete Setup'
                  }
                </span>
                {!isUploading && (
                  <ArrowRight className="w-5 h-5 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" />
                )}
              </Button>
            </div>
            
            {/* Centered paragraph below buttons */}
            <div className="text-end mt-2">
              <p className="text-xs text-gray-500">
                You can update these later
              </p>
            </div>
          </div>
          )}
          
        </CardContent>
      </Card>
        </div>
      </div>
    </>
  );
}

