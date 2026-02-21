"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../zenith/src/components/ui/avatar";
import { Button } from "../../../../zenith/src/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../../zenith/src/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { House, ClipboardText, Briefcase, Folder, SignOut, HouseSimple, Pencil, Camera, Check } from "@phosphor-icons/react";
import { showToastSuccess } from "@/components/toasts";
import React from "react";

interface BetaStudentSidebarProps {
  studentName: string;
  studentEmail: string;
}

// These are the actual portrait images found in the repository's public/images/team folder
const ACTUAL_DASHBOARD_AVATARS = [
  { id: 1, src: "/images/avatars/default/1-modified.png", name: "Avatar 1" },
  { id: 2, src: "/images/avatars/default/2-modified.png", name: "Avatar 2" },
  { id: 3, src: "/images/avatars/default/3-modified.png", name: "Avatar 3" },
  { id: 4, src: "/images/avatars/default/4-modified.png", name: "Avatar 4" },
  { id: 5, src: "/images/avatars/default/5-modified.png", name: "Avatar 5" },
  { id: 6, src: "/images/avatars/default/6-modified.png", name: "Avatar 6" },
  { id: 7, src: "/images/avatars/default/7-modified.png", name: "Avatar 7" },
  { id: 8, src: "/images/avatars/default/8-modified.png", name: "Avatar 8" },
  { id: 9, src: "/images/avatars/default/9-modified.png", name: "Avatar 9" },
];

export function BetaStudentSidebar({ studentName, studentEmail }: BetaStudentSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (href: string) => pathname === href;

  const [profileImageUrl, setProfileImageUrl] = useState<string>("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("demo_student_avatar");
    if (saved) {
      setProfileImageUrl(saved);
      setSelectedAvatar(saved);
    } else {
      setProfileImageUrl(ACTUAL_DASHBOARD_AVATARS[0].src);
      setSelectedAvatar(ACTUAL_DASHBOARD_AVATARS[0].src);
    }
  }, []);

  const handleSignOut = () => {
    router.push('/');
  };

  const saveAvatar = () => {
    if (selectedAvatar) {
      setProfileImageUrl(selectedAvatar);
      localStorage.setItem("demo_student_avatar", selectedAvatar);
      setIsEditDialogOpen(false);
      showToastSuccess({
        headerText: "Profile Updated",
        paragraphText: "Your profile picture has been updated.",
        direction: "right"
      });
    }
  };

  return (
    <aside className="hidden shrink-0 lg:block w-72 m-0.5">
      <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 h-full overflow-auto flex flex-col items-center">
        <div className="p-6 pt-2">
          <div className="mt-4 h-short:mt-1 flex flex-col items-center gap-3">
            <div 
              className="relative group cursor-pointer"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Avatar className="h-40 w-40 h-short:h-30 h-short:w-30 bg-transparent ring-2 ring-neutral-100">
                <AvatarImage 
                  src={profileImageUrl} 
                  alt={studentName} 
                  className="object-cover" 
                />
                <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200">
                  {studentName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Pencil className="h-6 w-6 text-white" />
              </div>
            </div>

            <div className="text-center">
              <div className="space-y-1">
                <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                  {studentName}
                </h3>
                <p className="text-sm text-gray-600 overflow-hidden text-ellipsis" style={{ maxWidth: '220px' }}>
                  {studentEmail}
                </p>
              </div>
            </div>
          </div>
        </div>

        <nav className="p-3 pt-8 w-full px-6">
          <ul className="flex flex-col space-y-4">
            <li>
              <Link
                href="/demo/student"
                className={`w-full flex items-center justify-start text-left gap-3 rounded-xl px-3 py-2 text-base transition-colors ${
                  isActive('/demo/student')
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
                href="/demo/student/assignments"
                className={`w-full flex items-center justify-start text-left gap-3 rounded-xl px-3 py-2 text-base transition-colors ${
                  isActive('/demo/student/assignments')
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
                href="/demo/student/requests"
                className={`w-full flex items-center justify-start text-left gap-3 rounded-xl px-3 py-2 text-base transition-colors ${
                  isActive('/demo/student/requests')
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
                href="/demo/student/documents"
                className={`w-full flex items-center justify-start text-left gap-3 rounded-xl px-3 py-2 text-base transition-colors ${
                  isActive('/demo/student/documents')
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

        <div className="p-3 mt-auto w-full">
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
              onClick={handleSignOut}
            >
              <SignOut className="h-5 w-5" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 justify-center">
              <Camera className="h-5 w-5" />
              Edit Profile Picture
            </DialogTitle>
            <DialogDescription className="text-center">
              Choose a profile picture for your account.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[50vh] mt-4">
            <div className="grid grid-cols-4 gap-4 p-4">
              {ACTUAL_DASHBOARD_AVATARS.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => setSelectedAvatar(avatar.src)}
                  className={`relative aspect-square rounded-xl overflow-hidden ring-offset-2 transition-all ${
                    selectedAvatar === avatar.src 
                      ? "ring-4 ring-blue-500 scale-105 shadow-lg" 
                      : "hover:scale-105 hover:shadow-md"
                  }`}
                >
                  <img src={avatar.src} alt={avatar.name} className="w-full h-full object-cover" />
                  {selectedAvatar === avatar.src && (
                    <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
                      <div className="bg-blue-500 text-white rounded-full p-1 shadow-md">
                        <Check className="h-4 w-4 weight-bold" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>

          <div className="flex justify-center gap-3 mt-6">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveAvatar} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
              Apply Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
