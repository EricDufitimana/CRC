"use client";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../zenith/src/components/ui/avatar";
import { Skeleton } from "../../../../zenith/src/components/ui/skeleton";
import { Button } from "../../../../zenith/src/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../../zenith/src/components/ui/dialog";
import { FileUpload as FileUploadBase, getFileIconType, getReadableFileSize } from "@/components/application/file-upload/file-upload-base";
import { ScrollArea } from "@/components/ui/scroll-area";
import { House, ClipboardText, Briefcase, Folder, SignOut, CaretLeft, Pencil, Camera, Spinner, HouseSimple } from "@phosphor-icons/react";
import { useAuth } from "@/hooks/useAuth";
import React from "react";
import { useTRPC } from "@/trpc/client"; 
import {useUserData} from "@/hooks/useUserData";
import { useSuspenseQuery, useMutation, useQueryClient, QueryClientContext } from "@tanstack/react-query";


interface StudentSidebarProps {
  className?: string;
}

// FileUpload wrapper component to match old API
interface FileUploadProps {
  multiple?: boolean;
  accept?: string;
  maxFiles?: number;
  value?: File[];
  onChange?: (files: File[]) => void;
  onRemove?: (index: number) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: React.ReactNode;
  helperText?: React.ReactNode;
}

function FileUpload({
  multiple = false,
  accept = "image/*",
  maxFiles = 10,
  value = [],
  onChange,
  onRemove,
  className,
  disabled = false,
  placeholder = "Drop files here or click to upload",
  helperText,
}: FileUploadProps) {
  const [files, setFiles] = useState<Array<{ id: string; file: File; progress: number; failed: boolean }>>(
    value.map((file, index) => ({
      id: `${file.name}-${index}`,
      file,
      progress: 100,
      failed: false,
    }))
  );

  // Sync with external value prop
  React.useEffect(() => {
    const newFiles = value.map((file, index) => ({
      id: `${file.name}-${index}-${Date.now()}`,
      file,
      progress: 100,
      failed: false,
    }));
    setFiles(newFiles);
  }, [value]);

  const handleDropFiles = useCallback((fileList: FileList) => {
    const newFiles = Array.from(fileList);
    
    if (!multiple && newFiles.length > 0) {
      // Single file mode - replace existing file
      const updatedFiles = [newFiles[0]];
      onChange?.(updatedFiles);
    } else if (multiple) {
      // Multiple file mode - add to existing files
      const updatedFiles = [...value, ...newFiles].slice(0, maxFiles);
      onChange?.(updatedFiles);
    }
  }, [multiple, value, onChange, maxFiles]);

  const handleDelete = useCallback((id: string) => {
    const fileIndex = files.findIndex(f => f.id === id);
    if (fileIndex !== -1) {
      if (onRemove) {
        onRemove(fileIndex);
      } else {
        const updatedFiles = value.filter((_, index) => index !== fileIndex);
        onChange?.(updatedFiles);
      }
    }
  }, [files, value, onChange, onRemove]);

  const hintText = typeof helperText === 'string' ? helperText : (typeof placeholder === 'string' ? placeholder : undefined);

  return (
    <div className={className}>
      <FileUploadBase.DropZone
        accept={accept}
        allowsMultiple={multiple}
        isDisabled={disabled}
        hint={hintText}
        onDropFiles={handleDropFiles}
      />
      {files.length > 0 && (
        <FileUploadBase.Root className="mt-4">
          <FileUploadBase.List>
            {files.map((fileItem) => (
              <FileUploadBase.ListItem
                key={fileItem.id}
                name={fileItem.file.name}
                size={fileItem.file.size}
                progress={fileItem.progress}
                failed={fileItem.failed}
                type={getFileIconType(fileItem.file.name)}
                onDelete={() => handleDelete(fileItem.id)}
                className="!p-2.5 !gap-2 [&_p]:!text-sm [&_hr]:!h-2.5 [&>svg]:!size-8 [&>div>div>div>div>svg]:!size-3"
              />
            ))}
          </FileUploadBase.List>
        </FileUploadBase.Root>
      )}
    </div>
  );
}

export default function StudentSidebar({ className = "" }: StudentSidebarProps) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  const {userId, studentId} = useUserData();
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [isAvatar, setIsAvatar] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [uploadedAvatarFile, setUploadedAvatarFile] = useState<File[]>([]);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'existing'>('existing');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [selectedAvatarPath, setSelectedAvatarPath] = useState<string | null>(null);
  const trpc = useTRPC();
  const queryClient = useQueryClient();


  const { 
    data: avatarResponse, 
    error: avatarError, 
    isFetching: isLoadingAvatars, 
    refetch: refetchAvatars 
  } = useSuspenseQuery(trpc.studentSidebar.getAvatarsWithSignedUrls.queryOptions());
  
  const fetchedAvatars = avatarResponse.avatars;
  
  const { data: studentData , isLoading: userDataLoading, error: userDataError} = 
    useSuspenseQuery(trpc.studentSidebar.getStudentData.queryOptions());

  const { data: profilePictureData } = useSuspenseQuery(
    trpc.studentSidebar.getProfilePicture.queryOptions({ 
      profilePicturePath: studentData.profile_picture || '', // Handle null
    })
  );
  useEffect(() => {
    if (profilePictureData) {
      setProfileImageUrl(profilePictureData.imageUrl);
      setIsAvatar(profilePictureData.isAvatar || false);
    }
  }, [profilePictureData]);

  const updateAvatarMutation = useMutation({
    ...trpc.studentSidebar.updateAvatar.mutationOptions(),
    onSuccess: (result) => {
      console.log('✅ Avatar update successful:', result);
      if (result.data?.avatarPath) {
        setProfileImageUrl(result.data.avatarPath);
        setIsAvatar(true);
      }
      setIsEditDialogOpen(false);
      setUploadedAvatarFile([]);
      
      // Invalidate queries
      queryClient.invalidateQueries({ 
        queryKey: [['studentSidebar', 'getStudentData']] 
      });
      
      window.location.reload();
    },
    onError: (error) => {
      console.error('❌ Avatar upload failed:', error);
      alert(error.message || 'Failed to upload avatar. Please try again.');
    }
  });
  
  // U


  const handleAvatarUpload = async () => {
    if (uploadedAvatarFile.length === 0) {
      alert('Please select a file to upload');
      return;
    }
    
    if (!studentId || !userId) {
      console.error('❌ Missing required IDs for avatar update');
      return;
    }
    
    setIsUploadingAvatar(true);
    
    // Convert file to base64 for TRPC transport
    const file = uploadedAvatarFile[0];
    const reader = new FileReader();
    
    reader.onloadend = () => {
      const base64String = reader.result as string;
      
      updateAvatarMutation.mutate({
        avatarFile: {
          name: file.name,
          type: file.type,
          size: file.size,
          base64: base64String
        }
      });
      
      setIsUploadingAvatar(false);
    };
    
    reader.readAsDataURL(file);
  };

  const handleAvatarSelect = async (avatar: any) => {
    if (!studentId || !userId) {
      console.error('❌ Missing required IDs for avatar update');
      return;
    }

    console.log('🎯 Updating avatar:', avatar.name);
    setIsUploadingAvatar(true);

    const avatarPath = avatar.filePath || 
      `default/${avatar.folder}/${avatar.name.toLowerCase().replace(/\s+/g, '-')}.png`;

    updateAvatarMutation.mutate({
      avatarPath
    });
    
    setIsUploadingAvatar(false);
  };

  const handleDialogOpen = (open: boolean) => {
    console.log('🚀 handleDialogOpen called with:', open);
    setIsEditDialogOpen(open);
    
    if (open) {
      console.log('📂 Dialog opened');
      setSelectedAvatar(profileImageUrl);
    } else {
      console.log('📂 Dialog closing - resetting state...');
      setUploadedAvatarFile([]);
      setActiveTab('existing');
    }
  };

  const { signOut, isSigningOut } = useAuth();

  const HandleSignOut = async () => {
    try {
      signOut();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }


  return (
    <aside className={`hidden shrink-0 lg:block w-72 m-0.5 ${className}`}>
      <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 h-full overflow-auto flex flex-col justify-center items-center">
        <div className="p-6">
          <div className="mt-4 h-short:mt-1 flex flex-col items-center gap-3">
            <div 
              className={`relative group ${!userDataLoading ? 'cursor-pointer' : 'cursor-default'}`}
              onClick={() => !userDataLoading && setIsEditDialogOpen(true)}
            >
              <Avatar className={`h-40 w-40 h-short:h-30 h-short:w-30 bg-transparent`}>
                <AvatarImage 
                  src={profileImageUrl || ""} 
                  alt={studentData?.full_name || "Student"} 
                  className={isAvatar ? "object-cover mb-2" : "object-cover"} 
                />
                <AvatarFallback className={'bg-gradient-to-br from-gray-100 to-gray-200'}>
                  {studentData ? 
                    `${studentData.first_name?.charAt(0) || ''}${studentData.last_name?.charAt(0) || ''}` 
                    : '...'
                  }
                </AvatarFallback>
              </Avatar>
              
              {/* Hover overlay with edit button */}
              <div className={`absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 ${!userDataLoading ? 'pointer-events-none' : ''}`}>
                <div className="flex flex-col items-center gap-1">
                  <Pencil className="h-6 w-6 text-white font-bold" />
                  <span className="text-xs text-white font-medium">Edit</span>
                </div>
              </div>
            </div>

            {/* Student Name and Email */}
            <div className="text-center">
              {userDataLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32 mx-auto" />
                  <Skeleton className="h-4 w-40 mx-auto" />
                </div>
              ) : studentData ? (
                <div className="space-y-1">
                  <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                    {studentData.full_name || `${studentData.first_name || ''} ${studentData.last_name || ''}`.trim() || 'Student'}
                  </h3>
                  <p className="text-sm text-gray-600 overflow-hidden text-ellipsis" style={{ maxWidth: '220px' }} title={studentData.email || 'No email'}>
                    {studentData.email || 'No email'}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <h3 className="font-semibold text-gray-900 text-lg">Student</h3>
                  <p className="text-sm text-gray-600">Loading...</p>
                </div>
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
                <HouseSimple className="h-5 w-5 text-neutral-500 " />
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
                <ClipboardText className="h-5 w-5 text-neutral-500" />
                Assignments
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/student/requests"
                className={`flex items-center justify-start text-left gap-3 rounded-xl px-3 py-2 text-base ${
                  isActive('/dashboard/student/requests')
                    ? 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`} 
              >
                <Briefcase className="h-5 w-5 text-neutral-500" />
                Requests
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/student/documents"
                className={`flex items-center justify-start text-left gap-3 rounded-xl px-3 py-2 text-base ${
                  isActive('/dashboard/student/documents')
                    ? 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`} 
              >
                <Folder className="h-5 w-5 text-neutral-500" />
                Documents
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
              <House className="h-5 w-5" />
              Home
            </Button>
            <span className="text-neutral-400">|</span>
            <Button
              variant="ghost"
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-base text-neutral-600 hover:text-neutral-900"
              onClick={() => HandleSignOut()}
              disabled={isSigningOut}
            >
              {isSigningOut ? (
                <Spinner className="h-5 w-5 animate-spin" />
              ) : (
                <SignOut className="h-5 w-5" />
              )}
              {isSigningOut ? "Signing out..." : "Sign out"}
            </Button>
          </div>
        </div>
      </div>

      {/* Avatar Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={handleDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-center justify-center">
              <Camera className="h-5 w-5" />
              Edit Profile Picture
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-6 pr-4">
              {/* Avatar Preview */}
              <div className="flex justify-center">
                <div className="relative">
                  <Avatar className="h-28 w-28 ring-4 ring-white/30 shadow-2xl">
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
                    ) : avatarError ? (
                      <div className="flex flex-col justify-center items-center py-12">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                          <span className="text-red-500 text-2xl">⚠️</span>
                        </div>
                        <p className="text-sm text-red-600 text-center">Failed to load avatars</p>
                        <button 
                          onClick={() => refetchAvatars()}
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
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-gray-900 text-center">Choose Avatar</h4>
                        
                        {/* Show folder organization if we have many avatars */}
                        {fetchedAvatars.length > 8 && (
                          <div className="text-center">
                            <p className="text-xs text-gray-500">
                              {fetchedAvatars.length} available avatars
                            </p>
                          </div>
                        )}
                        
                        {/* Avatar Grid - Bigger */}
                        <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
                          {fetchedAvatars.map((avatar, index) => (
                            <button
                              key={avatar.id}
                              onClick={() => {
                                const filePath = 'filePath' in avatar && avatar.filePath ? avatar.filePath : `default/${avatar.folder}/${avatar.name.toLowerCase().replace(/\s+/g, '-')}.png`;
                                console.log('🖼️ StudentSidebar: Avatar selected:', { 
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
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setUploadedAvatarFile([]);
                    setActiveTab('existing');
                  }}
                  disabled={isUploadingAvatar}
                >
                  Cancel
                </Button>
                
                {/* Apply Changes Button - always visible but disabled when no selection */}
                <Button
                  onClick={() => {
                    console.log('🎯 StudentSidebar: Apply Changes clicked', {
                      activeTab,
                      selectedAvatar,
                      selectedAvatarPath,
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
                  disabled={isUploadingAvatar || ((activeTab === 'upload' && uploadedAvatarFile.length === 0) || (activeTab === 'existing' && !selectedAvatar))}
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
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
