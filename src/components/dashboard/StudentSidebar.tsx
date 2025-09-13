"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../../../zenith/src/components/ui/avatar";
import { Skeleton } from "../../../zenith/src/components/ui/skeleton";
import { Button } from "../../../zenith/src/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../zenith/src/components/ui/dialog";
import { FileUpload } from "../../../zenith/src/components/ui/file-upload";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LayoutDashboard, ClipboardList, Briefcase, FileText, LogOut, Home, Edit3, Camera } from "lucide-react";
import { useSupabase } from "@/hooks/useSupabase";
import { signOut } from "@/actions/signOut";
import { useUserData } from "@/hooks/useUserData";
import { getProfilePicture } from "@/actions/avatars/getProfilePicture";
import { getAvatars, AvatarData as BaseAvatarData } from "@/actions/avatars/getAvatars";
import { getAvatarsWithSignedUrls, AvatarData } from "@/actions/avatars/getAvatarsWithSignedUrls";
import { useAvatarFetch } from "@/hooks/useAvatarFetch";
import { updateAvatarAndBackground } from "@/actions/avatars/updateAvatarAndBackground";

interface StudentSidebarProps {
  className?: string;
}

export default function StudentSidebar({ className = "" }: StudentSidebarProps) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;
  const { getUserId } = useSupabase();
  const { userId, studentId, isLoading: userDataLoading, error: userDataError } = useUserData();

  const [studentData, setStudentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [isAvatar, setIsAvatar] = useState<boolean>(false);
  const [profileBackground, setProfileBackground] = useState<string>('statColors-4');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [uploadedAvatarFile, setUploadedAvatarFile] = useState<File[]>([]);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'existing'>('upload');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [selectedAvatarPath, setSelectedAvatarPath] = useState<string | null>(null);
  const [selectedBackground, setSelectedBackground] = useState<string>('statColors-4');
  
  // Replace avatar fetching state with custom hook

  console.log("This is working")
  const { 
    avatars: fetchedAvatars, 
    isLoading: isLoadingAvatars, 
    error: avatarError,
    fetchAvatars 
  } = useAvatarFetch();
  
  console.log('🔍 StudentSidebar: Hook values:', {
    fetchedAvatars: fetchedAvatars.length,
    isLoadingAvatars,
    avatarError,
    fetchAvatarsType: typeof fetchAvatars
  });
  
  // Test: Call fetchAvatars on component mount to see if it works
  useEffect(() => {
    console.log('🧪 StudentSidebar: Testing fetchAvatars on mount...');
    fetchAvatars();
  }, [fetchAvatars]);
  
  // Function to process profile picture
  // Fetch student data from useUserData hook
  useEffect(() => {
    const fetchStudentData = async () => {
      if (!studentId) {
        console.log('No studentId available');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/studentId?userId=${userId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('API error:', errorData);
          throw new Error(`Failed to fetch student data: ${errorData.error || 'Unknown error'}`);
        }
        
        const data = await response.json();
        console.log('Student data loaded:', { name: data.full_name, email: data.email });
        setStudentData(data);
        
        // Process profile picture if available
        if (data.profile_picture) {
          await processProfilePicture(data.profile_picture);
        }
      } catch (err: any) {
        console.error('Error fetching student data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentData();
  }, [studentId, userId]);

  const processProfilePicture = async (profilePicturePath: string) => {
    console.log('Processing profile picture:', { profilePicturePath, studentId });
    try {
      const result = await getProfilePicture(profilePicturePath, studentId!);
      
      if (result.success && result.imageUrl) {
        setProfileImageUrl(result.imageUrl);
        setIsAvatar(result.isAvatar || false);
        // Use the profile background from the database, fallback to default
        const background = result.profileBackground || 'statColors-4';
        setProfileBackground(background);
        console.log('Profile background set:', background);
      } else {
        console.error('Profile picture error:', result.error);
        setProfileImageUrl(null);
        setIsAvatar(false);
      }
    } catch (error) {
      console.error('Error processing profile picture:', error);
      setProfileImageUrl(null);
      setIsAvatar(false);
    }
  };

  const handleAvatarUpload = async () => {
    if (uploadedAvatarFile.length === 0) {
      alert('Please select a file to upload');
      return;
    }
    
    if (!studentId || !userId) {
      console.error('❌ StudentSidebar: Missing required IDs for avatar update');
      return;
    }
    
    try {
      setIsUploadingAvatar(true);
      console.log('📤 StudentSidebar: Starting avatar upload with new action');
      
      const result = await updateAvatarAndBackground({
        studentId: studentId.toString(),
        userId,
        avatarFile: uploadedAvatarFile[0],
        profileBackground: selectedBackground
      });

      if (!result.success) {
        console.error('❌ StudentSidebar: Avatar upload failed:', result.error);
        alert(result.error || 'Failed to upload avatar. Please try again.');
        return;
      }

      console.log('✅ StudentSidebar: Avatar upload successful:', result.data);
      
      // Update the profile picture URL and background
      if (result.data?.avatarPath) {
        setProfileImageUrl(result.data.avatarPath);
        setIsAvatar(true);
        setProfileBackground(result.data.profileBackground);
      }
      
      // Close dialog and reset
      setIsEditDialogOpen(false);
      setUploadedAvatarFile([]);
      
      // Refresh the page to update the avatar everywhere
      window.location.reload();
      
    } catch (error) {
      console.error('💥 StudentSidebar: Error uploading avatar:', error);
      alert('Failed to upload avatar. Please try again.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };


  const handleAvatarSelect = async (avatar: any) => {
    if (!studentId || !userId) {
      console.error('❌ StudentSidebar: Missing required IDs for avatar update');
      return;
    }

    console.log('🎯 StudentSidebar: Updating avatar with new action:', avatar.name);
    setIsUploadingAvatar(true);

    try {
      const avatarPath = avatar.filePath || 
        `default/${avatar.folder}/${avatar.name.toLowerCase().replace(/\s+/g, '-')}.png`;

      const result = await updateAvatarAndBackground({
        studentId: studentId.toString(),
        userId,
        avatarPath,
        profileBackground: selectedBackground
      });

      if (!result.success) {
        console.error('❌ StudentSidebar: Avatar update failed:', result.error);
        alert(result.error || 'Failed to update avatar');
        return;
      }

      console.log('✅ StudentSidebar: Avatar update successful:', result.data);
      
      if (result.data?.avatarPath) {
        setProfileImageUrl(result.data.avatarPath);
        setIsAvatar(true);
        setProfileBackground(result.data.profileBackground);
        setIsEditDialogOpen(false);
        window.location.reload();
      }

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update avatar';
      console.error('💥 StudentSidebar: Avatar update error:', message);
      alert(message);
    } finally {
      setIsUploadingAvatar(false);
    }
  };


  
  // Simplified dialog handler
  const handleDialogOpen = (open: boolean) => {
    console.log('🚀 StudentSidebar: handleDialogOpen called with:', open);
    setIsEditDialogOpen(open);
    
    if (open) {
      console.log('📂 StudentSidebar: Dialog opened - fetching avatars');
      console.log('🔍 StudentSidebar: fetchAvatars function:', typeof fetchAvatars);
      console.log('🔍 StudentSidebar: About to call fetchAvatars...');
      fetchAvatars();
      console.log('🔍 StudentSidebar: fetchAvatars called');
      setSelectedAvatar(profileImageUrl);
      setSelectedBackground(profileBackground);
    } else {
      console.log('📂 StudentSidebar: Dialog closing - resetting state...');
      setUploadedAvatarFile([]);
      setActiveTab('upload');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }

  // Debug: Log key state for troubleshooting
  if (error || userDataError) {
    console.log('Sidebar error state:', { error, userDataError, studentId, userId });
  }

  return (
    <aside className={`hidden shrink-0 md:block w-72 m-0.5 ${className}`}>
      <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 h-full overflow-auto flex flex-col justify-center items-center">
        <div className="p-6">
          <div className="mt-4 h-short:mt-1 flex flex-col items-center gap-3">
            <div 
              className={`relative group ${!isLoading && !userDataLoading ? 'cursor-pointer' : 'cursor-default'}`}
              onMouseEnter={() => !isLoading && !userDataLoading && setIsHoveringAvatar(true)}
              onMouseLeave={() => !isLoading && !userDataLoading && setIsHoveringAvatar(false)}
              onClick={() => !isLoading && !userDataLoading && setIsEditDialogOpen(true)}
            >
              <Avatar className={`h-40 w-40 h-short:h-30 h-short:w-30 ${isAvatar ? `bg-${profileBackground}` : 'bg-transparent'}`}>
                <AvatarImage 
                  src={profileImageUrl || ""} 
                  alt={studentData?.full_name || "Student"} 
                  className={isAvatar ? "object-contain mt-2" : "object-cover"} 
                />
                <AvatarFallback className={isAvatar ? `bg-${profileBackground}` : 'bg-gradient-to-br from-gray-100 to-gray-200'}>
                  {studentData ? 
                    `${studentData.first_name?.charAt(0) || ''}${studentData.last_name?.charAt(0) || ''}` 
                    : '...'
                  }
                </AvatarFallback>
              </Avatar>
              
              {/* Hover overlay with edit button */}
              {isHoveringAvatar && !isLoading && !userDataLoading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center transition-opacity duration-200">
                  <div className="flex flex-col items-center gap-1">
                    <Edit3 className="h-6 w-6 text-white" />
                    <span className="text-xs text-white font-medium">Edit</span>
                  </div>
                </div>
              )}
            </div>
            <div className="text-center">
              {userDataLoading || isLoading ? (
                <>
                  <Skeleton className="h-5 w-40 mx-auto mb-2" />
                  <Skeleton className="h-4 w-48 mx-auto" />
                </>
              ) : userDataError ? (
                <>
                  <p className="text-sm text-red-500 mb-1">Authentication Error</p>
                  <p className="text-xs text-neutral-400">{userDataError}</p>
                </>
              ) : error ? (
                <>
                  <p className="text-sm text-red-500 mb-1">Profile Error</p>
                  <p className="text-xs text-neutral-400">{error}</p>
                </>
              ) : studentData ? (
                <>
                  <p className="text-lg font-medium">{studentData.full_name || 'Unknown Name'}</p>
                  <p className="text-sm text-neutral-500">{studentData.email || 'No email'}</p>
                </>
              ) : (
                <>
                  <p className="text-sm text-neutral-500">No profile data</p>
                </>
              )}
            </div>
          </div>
        </div>

        <nav className="p-3 pt-8">
          <ul className="flex flex-col space-y-4">
            <li>
              <Link
                href="/dashboard/student"
                className={`flex items-center justify-start text-left gap-3 rounded-xl px-3 py-2 text-base ${
                  isActive('/dashboard/student')
                    ? 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`} 
              >
                <LayoutDashboard className="h-5 w-5 text-neutral-500" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/student/assignments"
                className={`flex items-center justify-start text-left gap-3 rounded-xl px-3 py-2 text-base ${
                  isActive('/dashboard/student/assignments')
                    ? 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`} 
              >
                <ClipboardList className="h-5 w-5 text-neutral-500" />
                Assignments
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/student/opportunities"
                className={`flex items-center justify-start text-left gap-3 rounded-xl px-3 py-2 text-base ${
                  isActive('/dashboard/student/opportunities')
                    ? 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`} 
              >
                <Briefcase className="h-5 w-5 text-neutral-500" />
                Opportunities
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/student/essays"
                className={`flex items-center justify-start text-left gap-3 rounded-xl px-3 py-2 text-base ${
                  isActive('/dashboard/student/essays')
                    ? 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`} 
              >
                <FileText className="h-5 w-5 text-neutral-500" />
                Essays
              </Link>
            </li>
          </ul>
        </nav>

        <div className="p-3 mt-auto">
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-base text-neutral-600 hover:text-neutral-900"
              onClick={() => window.location.href = '/'}
            >
              <Home className="h-5 w-5" />
              Home
            </Button>
            <span className="text-neutral-400">|</span>
            <Button
              variant="ghost"
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-base text-neutral-600 hover:text-neutral-900"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      {/* Avatar Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={handleDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-center justify-center">
              <Camera className="h-5 w-5" />
              Edit Profile Picture
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-gray-600">
              Choose a new profile picture by uploading your own image or selecting from available avatars.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-6 pr-4">
              {/* Avatar Preview */}
              <div className="flex justify-center">
                <div className="relative">
                  <Avatar className={`h-28 w-28 ring-4 ring-white/30 shadow-2xl bg-${selectedBackground}`}>
                    <AvatarImage src={selectedAvatar || profileImageUrl || '/images/avatars/avatar-001.png'} />
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

              {/* Content */}
              <div className="min-h-[200px]">
                {activeTab === 'upload' ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-4">Upload your own profile picture</p>
                      <FileUpload
                        multiple={false}
                        accept="image/*"
                        value={uploadedAvatarFile}
                        onChange={(files) => {
                          setUploadedAvatarFile(files || []);
                          if (files && files.length > 0) {
                            const url = URL.createObjectURL(files[0]);
                            setSelectedAvatar(url);
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
                      <div className="flex justify-center items-center py-12">
                        <div className="flex space-x-2">
                          <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
                          <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="ml-3 text-sm text-gray-600">Loading avatars...</span>
                      </div>
                    ) : avatarError ? (
                      <div className="flex flex-col justify-center items-center py-12">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                          <span className="text-red-500 text-2xl">⚠️</span>
                        </div>
                        <p className="text-sm text-red-600 text-center">Failed to load avatars</p>
                        <p className="text-xs text-gray-400 text-center mt-1">{avatarError}</p>
                        <button 
                          onClick={fetchAvatars}
                          className="mt-3 px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Retry
                        </button>
                      </div>
                    ) : fetchedAvatars.length === 0 ? (
                      <div className="flex flex-col justify-center items-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <Camera className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500 text-center">No avatars available</p>
                        <p className="text-xs text-gray-400 text-center mt-1">Try uploading your own image instead</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Avatar Selection */}
                        <div className="space-y-4 flex">
                          <div> 

                            <h4 className="text-sm font-medium text-gray-900 text-center">Choose Avatar</h4>
                        
                            {/* Avatar Grid */}
                            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                              {fetchedAvatars.map((avatar) => (
                                <button
                                  key={avatar.id}
                                  onClick={() => {
                                    const avatarPath = 'filePath' in avatar ? avatar.filePath : `default/${avatar.folder}/${avatar.name.toLowerCase().replace(/\s+/g, '-')}.png`;
                                    console.log('🎯 StudentSidebar: Avatar clicked:', {
                                      id: avatar.id,
                                      name: avatar.name,
                                      src: avatar.src?.substring(0, 50) + '...',
                                      avatarPath,
                                      hasFilePath: 'filePath' in avatar
                                    });
                                    setSelectedAvatar(avatar.src);
                                    setSelectedAvatarPath(avatarPath);
                                  }}
                                  className={`relative aspect-square rounded-lg overflow-hidden transition-all duration-200 transform hover:scale-105 ${
                                    selectedAvatar === avatar.src
                                      ? 'ring-2 ring-blue-500 shadow-lg scale-105'
                                      : 'hover:ring-2 hover:ring-gray-300 hover:shadow-md'
                                  }`}
                                >
                                  <Avatar className="h-20 w-20">
                                    <AvatarImage 
                                      src={avatar.src} 
                                      alt={avatar.name}
                                      className="object-cover"
                                    />
                                    <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 text-xs font-medium">
                                      {avatar.name.charAt(0)}
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



                        </div>
                                               {/* Background Selection */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium text-gray-900 text-center">Choose Background</h4>
                          <div className="flex justify-center gap-2 flex-wrap">
                            {['statColors-1', 'statColors-2', 'statColors-3', 'statColors-4', 'statColors-5', 'statColors-6', 'statColors-7'].map((color) => (
                              <button
                                key={color}
                                onClick={() => setSelectedBackground(color)}
                                className={`w-8 h-8 rounded-full border-2 ${
                                  selectedBackground === color ? 'border-gray-900' : 'border-gray-300'
                                } bg-${color}`}
                              />
                            ))}
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setUploadedAvatarFile([]);
                    setActiveTab('upload');
                  }}
                  disabled={isUploadingAvatar}
                >
                  Cancel
                </Button>
                
                {/* Apply Changes Button - shows for both upload and existing */}
                {((activeTab === 'upload' && uploadedAvatarFile.length > 0) || (activeTab === 'existing' && selectedAvatar)) && (
                  <Button
                    onClick={() => {
                      console.log('🎯 StudentSidebar: Apply Changes clicked', {
                        activeTab,
                        selectedAvatar,
                        selectedAvatarPath,
                        selectedBackground,
                        uploadedAvatarFile: uploadedAvatarFile.length
                      });
                      
                      if (activeTab === 'upload') {
                        handleAvatarUpload();
                      } else {
                        handleAvatarSelect({ 
                          src: selectedAvatar, 
                          filePath: selectedAvatarPath,
                          name: 'Selected Avatar'
                        });
                      }
                    }}
                    disabled={isUploadingAvatar}
                    className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploadingAvatar ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Applying...
                      </div>
                    ) : (
                      'Apply Changes'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </aside>
  );
}