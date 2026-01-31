"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/zenith/components/ui/button";
import { Input } from "@/zenith/components/ui/input";
import { Label } from "@/zenith/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/zenith/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/zenith/components/ui/avatar";
import { User, Link as LinkIcon, Calendar, Upload, Save, Loader2, Settings as SettingsIcon } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { showToastSuccess, showToastError } from "@/components/toasts";
import { SettingsHeader } from "./SettingsHeader";

interface SettingsContentProps {}

// Simple image compression helper
async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = document.createElement("img");
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
             resolve(event.target?.result as string);
             return;
        }

        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
}

export function SettingsContent() {
  const trpc = useTRPC();
  const [calLink, setCalLink] = useState("");
  const [sessionNamespaces, setSessionNamespaces] = useState({
    quick_review: "",
    standard_session: "",
    comprehensive_review: ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use queryOptions with empty object to satisfy tRPC proxy if needed
  const { data: rawSettings, isLoading, refetch } = useQuery(
    trpc.adminSettings.getSettings.queryOptions()
  );
  const settings = rawSettings as any;

  useEffect(() => {
    if (settings) {
      const initialCalLink = settings.cal_link || "";
      const ns = settings.cal_sessions_namespace as any;
      const initialNamespaces = {
        quick_review: ns?.quick_review || "",
        standard_session: ns?.standard_session || "",
        comprehensive_review: ns?.comprehensive_review || ""
      };

      setCalLink(initialCalLink);
      setSessionNamespaces(initialNamespaces);
    }
  }, [settings]);

  const hasChanges = settings ? (
    calLink !== (settings.cal_link || "") ||
    sessionNamespaces.quick_review !== (settings.cal_sessions_namespace?.quick_review || "") ||
    sessionNamespaces.standard_session !== (settings.cal_sessions_namespace?.standard_session || "") ||
    sessionNamespaces.comprehensive_review !== (settings.cal_sessions_namespace?.comprehensive_review || "") ||
    uploadedImage !== null
  ) : false;

  const updateSettingsMutation = useMutation({
    ...trpc.adminSettings.updateSettings.mutationOptions(),
    onSuccess: () => {
      showToastSuccess({
        headerText: "Settings Saved",
        paragraphText: "Your profile and configuration have been updated.",
        direction: "right"
      });
      setIsSaving(false);
      refetch();
      setUploadedImage(null);
    },
    onError: (error) => {
      showToastError({
        headerText: "Update Failed",
        paragraphText: error.message,
        direction: "right"
      });
      setIsSaving(false);
    }
  });

  const getProfileImageUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    // Handle both relative paths and potential external URLs
    if (path.startsWith("admin/") || path.startsWith("student-")) {
      return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${path}`;
    }
    // Fallback or legacy storage check
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${path}`;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          setUploadedImage(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    let base64Image: string | undefined = undefined;

    if (fileInputRef.current?.files?.[0]) {
      try {
        base64Image = await compressImage(fileInputRef.current.files[0]);
      } catch (e) {
        showToastError({
          headerText: "Processing Error",
          paragraphText: "Failed to process image.",
          direction: "right"
        });
        setIsSaving(false);
        return;
      }
    }

    updateSettingsMutation.mutate({
      cal_link: calLink,
      cal_sessions_namespace: sessionNamespaces,
      profile_picture: base64Image
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const profileDisplayUrl = uploadedImage || getProfileImageUrl(settings?.profile_picture || null);
  const adminInitials = settings ? `${settings.first_name?.[0] || ""}${settings.last_name?.[0] || ""}`.toUpperCase() : "AD";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <SettingsHeader />

      <div className="grid gap-8">
        {/* Profile Section */}
        <div className="grid gap-4">
          <h2 className="text-lg font-semibold text-gray-900 px-1">Profile</h2>
          <Card className="shadow-none border border-gray-100 rounded-2xl bg-gray-50/30 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className="relative">
                  <Avatar className="h-28 w-28 border-4 border-white shadow-xl">
                    <AvatarImage src={profileDisplayUrl || undefined} alt="Profile" className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-500 text-white text-2xl font-bold">
                      {adminInitials}
                    </AvatarFallback>
                  </Avatar>
             
                </div>
                
                <div className="space-y-4 flex-1 text-center sm:text-left">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {settings?.first_name} {settings?.last_name}
                    </h3>
                    <p className="text-sm text-gray-500">{settings?.email}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                    <Button 
                      variant="outline" 
                      className=" rounded-xl border-gray-200  hover:bg-gray-100 group px-6"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                      {uploadedImage ? "Change Selection" : "Update Photo"}
                    </Button>
                    {uploadedImage && (
                      <Button 
                        variant="ghost" 
                        className="rounded-xl text-gray-500"
                        onClick={() => {
                          setUploadedImage(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                  <p className="text-xs text-gray-400">
                    JPG, PNG or GIF. Max size of 2MB.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scheduling Section */}
        <div className="grid gap-4">
          <h2 className="text-lg font-semibold text-gray-900 px-1">Scheduling</h2>
          <Card className="shadow-none border border-gray-100 rounded-2xl bg-gray-50/30">
            <CardContent className="p-8 space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="cal-link" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-orange-500" />
                    Cal.com Link
                  </Label>
                  <Input
                    id="cal-link"
                    placeholder="e.g. eric-dufitimana-lwofez"
                    value={calLink}
                    onChange={(e) => setCalLink(e.target.value)}
                    className="rounded-xl border-gray-200 h-11 bg-white"
                  />
                  <p className="text-[11px] text-gray-400">
                    Your direct booking URL for student sessions.
                  </p>
                </div>

                <div className="space-y-4 md:col-span-2">
                  <div className="flex items-center gap-2 mb-2">
                    <SettingsIcon className="h-4 w-4 text-orange-500" />
                    <Label className="text-sm font-medium text-gray-700">Session Namespaces</Label>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="quick-review" className="text-xs text-gray-500">20 min Quick Review</Label>
                      <Input
                        id="quick-review"
                        placeholder="e.g. review-20"
                        value={sessionNamespaces.quick_review}
                        onChange={(e) => setSessionNamespaces(prev => ({ ...prev, quick_review: e.target.value }))}
                        className="rounded-xl border-gray-200 h-10 bg-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="standard-session" className="text-xs text-gray-500">40 min Standard Session</Label>
                      <Input
                        id="standard-session"
                        placeholder="e.g. session-40"
                        value={sessionNamespaces.standard_session}
                        onChange={(e) => setSessionNamespaces(prev => ({ ...prev, standard_session: e.target.value }))}
                        className="rounded-xl border-gray-200 h-10 bg-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="comprehensive-review" className="text-xs text-gray-500">60 min Comprehensive Review</Label>
                      <Input
                        id="comprehensive-review"
                        placeholder="e.g. comprehensive-60"
                        value={sessionNamespaces.comprehensive_review}
                        onChange={(e) => setSessionNamespaces(prev => ({ ...prev, comprehensive_review: e.target.value }))}
                        className="rounded-xl border-gray-200 h-10 bg-white"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2">
                    Specify the Cal.com namespaces for each session duration.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-end pt-4">
            <Button 
              onClick={handleSave} 
              disabled={isSaving || !hasChanges}
              className="bg-orange-500 hover:bg-orange-600 text-white shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(242,152,73,0.35)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(242,152,73,0.15)] active:scale-95 transition-all duration-200 rounded-xl h-12 px-8 font-medium"
            >
              {isSaving ? (
                <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving Changes...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
        </div>
      </div>
    </div>
  );
}
