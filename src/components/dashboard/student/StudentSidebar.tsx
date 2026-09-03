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
import { House, ClipboardText, Briefcase, Folder, SignOut, CaretLeft, Pencil, Camera, Spinner, HouseSimple, GraduationCap } from "@phosphor-icons/react";
import { useAuth } from "@/hooks/useAuth";
import React from "react";
import { useTRPC } from "@/trpc/client";
import { useUserData } from "@/hooks/useUserData";
import { useSuspenseQuery, useMutation, useQuery, useQueryClient, QueryClientContext } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";


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

  const { userId, studentId } = useUserData();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // Only CRP-appointed students see the workspace entry.
  const { data: isCrpParticipant = false } = useQuery(
    trpc.crpStudent.isParticipant.queryOptions(undefined)
  );

  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [isAvatar, setIsAvatar] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [uploadedAvatarFile, setUploadedAvatarFile] = useState<File[]>([]);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'existing'>('existing');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [selectedAvatarPath, setSelectedAvatarPath] = useState<string | null>(null);

  const [selectedBackground, setSelectedBackground] = useState<string>("#F0EBE3");

  const backgroundPresets = [
    { name: "Linen", hex: "#F0EBE3" },
    { name: "Mint", hex: "#E8F0EB" },
    { name: "Lavender", hex: "#EAE8F0" },
    { name: "Rose", hex: "#F0E8E8" },
    { name: "Blue", hex: "#E8EEF0" },
    { name: "Peach", hex: "#F0EDE8" },
    { name: "Sage", hex: "#EDF0E8" },
    { name: "Lilac", hex: "#F0E8F0" },
  ];


  // DiceBear avatar grid
  const fetchedAvatars = [
    { id: "av-1", src: "https://api.dicebear.com/8.x/adventurer/svg?seed=Eric", name: "Eric" },
    { id: "av-2", src: "https://api.dicebear.com/8.x/adventurer/svg?seed=Kigali", name: "Kigali" },
    { id: "av-3", src: "https://api.dicebear.com/8.x/adventurer/svg?seed=CRC", name: "CRC" },
    { id: "av-4", src: "https://api.dicebear.com/8.x/adventurer/svg?seed=ASYV", name: "ASYV" },
    { id: "av-5", src: "https://api.dicebear.com/8.x/adventurer/svg?seed=Jordan", name: "Jordan" },
    { id: "av-6", src: "https://api.dicebear.com/8.x/adventurer/svg?seed=Morgan", name: "Morgan" },
    { id: "av-7", src: "https://api.dicebear.com/8.x/adventurer/svg?seed=Taylor", name: "Taylor" },
    { id: "av-8", src: "https://api.dicebear.com/8.x/adventurer/svg?seed=Riley", name: "Riley" },
    { id: "av-9", src: "https://api.dicebear.com/8.x/adventurer/svg?seed=Sage", name: "Sage" },
    { id: "av-10", src: "https://api.dicebear.com/8.x/adventurer/svg?seed=Luna", name: "Luna" },
    { id: "av-11", src: "https://api.dicebear.com/8.x/adventurer/svg?seed=Phoenix", name: "Phoenix" },
    { id: "av-12", src: "https://api.dicebear.com/8.x/adventurer/svg?seed=River", name: "River" },
  ];
  const isLoadingAvatars = false;

  const getFallbackAvatar = useCallback((seed: string) => {
    // adventurer is a friendly style for students
    return `https://api.dicebear.com/8.x/adventurer/svg?seed=${encodeURIComponent(seed)}`;
  }, []);

  const { data: studentData, isLoading: userDataLoading, error: userDataError } =
    useSuspenseQuery(trpc.studentSidebar.getStudentData.queryOptions());

  const { data: profilePictureData } = useSuspenseQuery(
    trpc.studentSidebar.getProfilePicture.queryOptions({
      profilePicturePath: studentData.profile_picture || '', // Handle null
    })
  );
  useEffect(() => {
    if (profilePictureData) {
      if (!profilePictureData.imageUrl) {
        setProfileImageUrl(getFallbackAvatar(studentData?.email || studentData?.full_name || 'CRC'));
        setIsAvatar(true);
      } else {
        setProfileImageUrl(profilePictureData.imageUrl);
        setIsAvatar(profilePictureData.isAvatar || false);
      }

      if (profilePictureData.profileBackground) {
        setSelectedBackground(profilePictureData.profileBackground);
      }
    }
  }, [profilePictureData, studentData?.email, getFallbackAvatar]);

  const updateAvatarMutation = useMutation({
    ...trpc.studentSidebar.updateAvatar.mutationOptions(),
    onSuccess: (result) => {
      console.log('✅ Avatar update successful:', result);
      if (result.data?.avatarPath) {
        setProfileImageUrl(result.data.avatarPath);
        setIsAvatar(true);
      }
      if (result.data?.profileBackground) {
        setSelectedBackground(result.data.profileBackground);
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
    },
    onSettled: () => {
      setIsUploadingAvatar(false);
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
        },
        profileBackground: selectedBackground
      });
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
      avatarPath,
      profileBackground: selectedBackground
    });
  };

  const handleDialogOpen = (open: boolean) => {
    console.log('🚀 handleDialogOpen called with:', open);
    setIsEditDialogOpen(open);
    if (open) {
      console.log('📂 Dialog opened');
      setSelectedAvatar(profileImageUrl);
      // Strip background color from DiceBear URL for display in the grid/selection if needed
      // but we'll manage it via CSS for now.
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
  console.log("Is it uploading avatar: ", isUploadingAvatar);

  return (
    <aside className={`hidden shrink-0 lg:block w-72 m-0.5 ${className}`}>
      <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 h-full overflow-auto flex flex-col items-center">


        <div className="p-6 pt-2">
          <div className="mt-4 h-short:mt-1 flex flex-col items-center gap-3">
            <div
              className={`relative group ${!userDataLoading ? 'cursor-pointer' : 'cursor-default'}`}
              onClick={() => !userDataLoading && setIsEditDialogOpen(true)}
            >
              <Avatar
                className={`h-40 w-40 h-short:h-30 h-short:w-30 shadow-md ring-4 ring-neutral-50`}
                style={{ backgroundColor: selectedBackground }}
              >
                <AvatarImage
                  src={profileImageUrl || ""}
                  alt={studentData?.full_name || "Student"}
                  className={isAvatar ? "object-cover p-1" : "object-cover"}
                  onError={() => {
                    const seed = studentData?.email || studentData?.full_name || 'CRC';
                    const fallback = getFallbackAvatar(seed);
                    if (profileImageUrl !== fallback) {
                      setProfileImageUrl(fallback);
                      setIsAvatar(true);
                    }
                  }}
                />
                <AvatarFallback className={'bg-neutral-100 text-neutral-400'}>
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
                className={`flex items-center justify-start text-left gap-3 rounded-xl px-3 py-2 text-base ${isActive('/dashboard/student')
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
                className={`flex items-center justify-start text-left gap-3 rounded-xl px-3 py-2 text-base ${isActive('/dashboard/student/assignments')
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
                className={`flex items-center justify-start text-left gap-3 rounded-xl px-3 py-2 text-base ${isActive('/dashboard/student/requests')
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
                className={`flex items-center justify-start text-left gap-3 rounded-xl px-3 py-2 text-base ${isActive('/dashboard/student/documents')
                  ? 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                  : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
              >
                <Folder className="h-5 w-5 text-neutral-500" />
                Documents
              </Link>
            </li>
            {isCrpParticipant && (
              <li>
                <Link
                  href="/crp"
                  className="flex items-center justify-start text-left gap-3 rounded-xl px-3 py-2 text-base bg-emerald-900 text-white hover:bg-emerald-950"
                >
                  <GraduationCap className="h-5 w-5 text-lime-300" />
                  CRP Workspace
                </Link>
              </li>
            )}
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
        <DialogContent className="max-w-xl p-0 overflow-hidden bg-white shadow-xl rounded-2xl border border-neutral-100">
          <div className="p-8 space-y-8">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-2xl font-bold tracking-tight text-center text-neutral-900">
                Customize Profile
              </DialogTitle>
              <DialogDescription className="text-center text-neutral-500">
                Adjust your avatar and pick a background that fits your style.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Preview Section */}
              <div className="flex flex-col items-center justify-center py-2">
                <div
                  className="relative h-28 w-28 rounded-full overflow-hidden shadow-sm ring-4 ring-white transition-all duration-500 ease-in-out"
                  style={{ backgroundColor: selectedBackground }}
                >
                  <img
                    src={selectedAvatar || profileImageUrl || getFallbackAvatar(studentData?.email || studentData?.full_name || 'CRC')}
                    alt="Preview"
                    className={`h-full w-full object-cover p-1 transition-opacity duration-300 ${isUploadingAvatar ? 'opacity-50' : 'opacity-100'}`}
                    onError={(e) => {
                      const seed = studentData?.email || studentData?.full_name || 'CRC';
                      const fallback = getFallbackAvatar(seed);
                      if (e.currentTarget.src !== fallback) {
                        e.currentTarget.src = fallback;
                      }
                    }}
                  />
                </div>
              </div>

              {/* Background Picker */}
              <div className="space-y-3 px-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Background</h4>
                  <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-tighter">Choose base color</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 pt-2 px-1 scrollbar-hide">
                  {backgroundPresets.map((bg) => (
                    <button
                      key={bg.hex}
                      onClick={() => setSelectedBackground(bg.hex)}
                      className={`h-8 w-8 shrink-0 rounded-full transition-all duration-300 ${selectedBackground === bg.hex
                        ? 'ring-2 ring-neutral-900 ring-offset-2 scale-105'
                        : 'hover:scale-105 border border-neutral-200'
                        }`}
                      style={{ backgroundColor: bg.hex }}
                      title={bg.name}
                    />
                  ))}
                </div>
              </div>

              {/* Tab Toggle */}
              <div className="flex p-1 bg-neutral-50 rounded-xl border border-neutral-100 mx-2">
                <button
                  onClick={() => setActiveTab('existing')}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 ${activeTab === 'existing'
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-500'
                    }`}
                >
                  Gallery
                </button>
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 ${activeTab === 'upload'
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-500'
                    }`}
                >
                  Custom
                </button>
              </div>

              {/* Content Area */}
              <div className="min-h-[160px] px-2 pb-2">
                {activeTab === 'existing' ? (
                  <div className="grid grid-cols-6 gap-2">
                    {fetchedAvatars.map((avatar) => {
                      const isSelected = selectedAvatar === avatar.src;

                      return (
                        <button
                          key={avatar.id}
                          onClick={() => {
                            setSelectedAvatar(avatar.src);
                            setSelectedAvatarPath(avatar.src);
                          }}
                          className={`group relative aspect-square rounded-xl overflow-hidden bg-neutral-50 border transition-all duration-200 ${isSelected
                            ? 'border-neutral-900 ring-1 ring-neutral-900'
                            : 'border-transparent hover:border-neutral-200 hover:bg-neutral-100'
                            }`}
                        >
                          <img src={avatar.src} className="h-full w-full object-cover p-1.5 transition-transform duration-300 group-hover:scale-110" alt={avatar.name} />
                          {isSelected && (
                            <div className="absolute top-1 right-1">
                              <div className="bg-neutral-900 rounded-full p-0.5 shadow-sm scale-75">
                                <svg className="h-2 w-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 bg-neutral-50/50 border border-dashed border-neutral-200 rounded-2xl">
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
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-between pt-6 border-t border-neutral-100">
              <Button
                variant="outline"
                className="rounded-xl px-8 text-sm text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-neutral-900 hover:bg-neutral-800 flex items-center justify-center gap-2 rounded-xl px-8 text-sm text-white shadow-md transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={() => {
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
              >
                {isUploadingAvatar && <Loader2 className="h-4 w-4 animate-spin" />}
                {isUploadingAvatar ? "Saving changes..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
