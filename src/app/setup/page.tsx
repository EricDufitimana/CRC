"use client";

import { useState, useEffect, useCallback } from "react";
import { z } from "zod";
import { useUserData } from "@/hooks/useUserData";
import { useRouter } from "next/navigation";
import { AnimatedText } from "@/components/animation/AnimatedText";
import imageCompression from "browser-image-compression";
import React from "react";
import { useTRPC } from "@/trpc/client";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { Camera, FileText, Link, X, CheckCircle, Spinner } from "@phosphor-icons/react";
import { PrimaryButton, SecondaryButton } from "@/components/setup/Button";
import { FormField, TextInput } from "@/components/setup/FormFields";
import { StepDots } from "@/components/setup/StepDots";
import Grainient from "@/components/setup/Grainient";

// Force dynamic rendering to prevent static generation
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// URL validation schema
const urlSchema = z.string().url("Please enter a valid URL");

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Step titles ─────────────────────────────────────────────────────────────
const STEPS = ["Welcome", "Overview", "Profile Picture", "Documents"];

const SETUP_OVERVIEW = [
  { icon: Camera, title: "Choose Profile Picture", description: "Pick an avatar or upload your own photo" },
  { icon: FileText, title: "Upload Academic Report", description: "Upload your latest academic report card" },
  { icon: Link, title: "Add Resume Link", description: "Share a link to your resume or portfolio" },
];

// ─── Loading / Error screens ──────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
        <Grainient color1="#F0B07A" color2="#F87171" color3="#FEF3C7" timeSpeed={0.18} warpStrength={0.7} warpFrequency={4.0} grainAmount={0.05} contrast={1.15} saturation={0.95} blendSoftness={0.15} />
      </div>
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
        <Spinner size={32} color="rgba(34,34,34,0.4)" style={{ animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ margin: 0, fontSize: "14px", color: "rgba(34,34,34,0.5)", fontFamily: '"Inter", sans-serif' }}>Loading setup...</p>
      </div>
    </div>
  );
}

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
        <Grainient color1="#F0B07A" color2="#F87171" color3="#FEF3C7" timeSpeed={0.18} warpStrength={0.7} warpFrequency={4.0} grainAmount={0.05} contrast={1.15} saturation={0.95} blendSoftness={0.15} />
      </div>
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", fontFamily: '"Inter", sans-serif' }}>
        <p style={{ margin: 0, fontSize: "14px", color: "rgba(180,40,40,0.8)" }}>{message}</p>
        <button onClick={onRetry} style={{ padding: "8px 20px", borderRadius: "10px", border: "1px solid rgba(34,34,34,0.15)", background: "rgba(255,255,255,0.8)", cursor: "pointer", fontSize: "13px", fontWeight: 500 }}>Try Again</button>
      </div>
    </div>
  );
}

// ─── Step 0: Animated greeting ────────────────────────────────────────────────
function AnimatedGreeting({ firstName, lastName }: { firstName: string; lastName?: string }) {
  const greeting = lastName ? `Hi, ${firstName} ${lastName}!` : `Hi, ${firstName}!`;
  return (
    <>
      <style>{`
        @keyframes ag-emoji  { 0%{transform:scale(0) rotate(-20deg);opacity:0} 65%{transform:scale(1.15) rotate(6deg);opacity:1} 100%{transform:scale(1) rotate(0deg);opacity:1} }
        @keyframes ag-name   { 0%{opacity:0;transform:translateY(10px);filter:blur(8px)} 100%{opacity:1;transform:translateY(0);filter:blur(0)} }
        @keyframes ag-sub    { 0%{opacity:0;transform:translateY(8px)} 100%{opacity:1;transform:translateY(0)} }
      `}</style>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
        <div style={{ fontSize: "54px", lineHeight: 1, animation: "ag-emoji 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.3s both" }}>👋</div>
        <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 600, color: "rgb(5,5,5)", whiteSpace: "nowrap", animation: "ag-name 1.4s cubic-bezier(0.16,1,0.3,1) 1.2s both" }}>
          {greeting}
        </h2>
        <p style={{ margin: 0, fontSize: "14px", color: "rgba(34,34,34,0.5)", textAlign: "center", maxWidth: "290px", animation: "ag-sub 0.9s ease 2.8s both" }}>
          Welcome to the CRC Platform! Let&apos;s get your profile set up in just a few steps.
        </p>
      </div>
    </>
  );
}

// ─── Step 1: Overview ─────────────────────────────────────────────────────────
function StepOverview() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <p style={{ margin: 0, fontSize: "13px", color: "rgba(34,34,34,0.5)", textAlign: "center" }}>Here&apos;s what we&apos;ll do together:</p>
      {SETUP_OVERVIEW.map((step, i) => {
        const Icon = step.icon;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 14px", borderRadius: "12px", background: "rgba(187,187,187,0.12)", border: "1px solid rgba(136,136,136,0.12)" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "rgba(34,34,34,0.07)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon size={16} color="rgb(34,34,34)" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "rgb(34,34,34)" }}>{step.title}</p>
              <p style={{ margin: "2px 0 0", fontSize: "11px", color: "rgba(34,34,34,0.45)" }}>{step.description}</p>
            </div>
            <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "rgba(34,34,34,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 600, color: "rgba(34,34,34,0.4)", flexShrink: 0 }}>
              {i + 1}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 2: Profile Picture ──────────────────────────────────────────────────
interface StepProfilePictureProps {
  avatarsToShow: Array<{ id: string; src: string; name: string; folder: string; filePath?: string; fileName?: string }>;
  isLoadingAvatars: boolean;
  fallbackInitial: string;
  selectedAvatar: string | null;
  setSelectedAvatar: (src: string | null) => void;
  selectedAvatarPath: string | null;
  setSelectedAvatarPath: (path: string | null) => void;
  uploadedAvatarFile: File[];
  setUploadedAvatarFile: (files: File[]) => void;
}

function StepProfilePicture({
  avatarsToShow,
  isLoadingAvatars,
  fallbackInitial,
  selectedAvatar,
  setSelectedAvatar,
  selectedAvatarPath,
  setSelectedAvatarPath,
  uploadedAvatarFile,
  setUploadedAvatarFile
}: StepProfilePictureProps) {
  const [localUploadUrl, setLocalUploadUrl] = useState<string | null>(null);

  const previewSrc = localUploadUrl ?? selectedAvatar ?? undefined;

  async function handleAvatarFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (localUploadUrl) URL.revokeObjectURL(localUploadUrl);
    const url = URL.createObjectURL(file);
    setLocalUploadUrl(url);
    setUploadedAvatarFile([file]);
    setSelectedAvatar(null);
    setSelectedAvatarPath(null);
  }

  function clearUploadedFile() {
    if (localUploadUrl) URL.revokeObjectURL(localUploadUrl);
    setLocalUploadUrl(null);
    setUploadedAvatarFile([]);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Preview */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            overflow: "hidden",
            border: "4px solid rgba(255,255,255,0.5)",
            boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
            background: "transparent",
            transition: "all 0.3s ease"
          }}
        >
          {previewSrc
            ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={previewSrc} alt="Selected" style={{ width: "100%", height: "100%", objectFit: "cover", padding: previewSrc.includes('dicebear') ? '8px' : '0' }} />
            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", fontWeight: 700, color: "rgba(34,34,34,0.2)" }}>{fallbackInitial}</div>
          }
        </div>
      </div>

      {/* Grid */}
      {isLoadingAvatars ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "20px 0" }}>
          <Spinner size={24} color="rgba(34,34,34,0.3)" style={{ animation: "spin 1s linear infinite" }} />
        </div>
      ) : (
        <div>
          <p style={{ margin: "0 0 10px", fontSize: "12px", fontWeight: 600, color: "rgba(34,34,34,0.5)", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.05em" }}>Choose Avatar</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
            {avatarsToShow.map((avatar) => {
              const cleanSrc = avatar.src.split('&backgroundColor=')[0];
              const isSelected = (selectedAvatar === cleanSrc || selectedAvatar === avatar.src) && !localUploadUrl;
              return (
                <button
                  key={avatar.id}
                  onClick={() => {
                    setSelectedAvatar(cleanSrc);
                    setSelectedAvatarPath(cleanSrc);
                    clearUploadedFile();
                  }}
                  style={{
                    aspectRatio: "1", borderRadius: "14px", overflow: "hidden",
                    border: isSelected ? "2.5px solid rgb(34,34,34)" : "2px solid transparent",
                    cursor: "pointer", padding: "6px", background: "rgba(187,187,187,0.1)",
                    transform: isSelected ? "scale(1.05)" : "scale(1)",
                    transition: "all 0.2s ease",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cleanSrc} alt={avatar.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Upload zone */}
      <label
        htmlFor="avatar-upload"
        style={{
          display: "flex", alignItems: "center", gap: "12px",
          padding: "12px 16px", border: "1.5px dashed rgba(136,136,136,0.25)",
          borderRadius: "16px", cursor: "pointer", background: "rgba(187,187,187,0.05)",
          transition: "all 0.2s ease", position: "relative",
        }}
      >
        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(136,136,136,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Camera size={16} color="rgba(136,136,136,0.8)" />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "rgb(34,34,34)" }}>Upload or drop photo</p>
        </div>
        <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarFileChange} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
        {uploadedAvatarFile.length > 0 && (
          <CheckCircle size={18} color="#10b981" weight="fill" />
        )}
      </label>
    </div>
  );
}

// ─── Step 3: Documents ────────────────────────────────────────────────────────
interface StepDocumentsProps {
  academicReportFile: File[];
  setAcademicReportFile: (f: File[]) => void;
  resumeLink: string;
  setResumeLink: (v: string) => void;
  setupError: string | null;
  resumeUrlError: string | null;
}

function StepDocuments({ academicReportFile, setAcademicReportFile, resumeLink, setResumeLink, setupError, resumeUrlError }: StepDocumentsProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div>
        <p style={{ margin: "0 0 8px", fontSize: "12px", fontWeight: 500, color: "rgb(136,136,136)" }}>
          Academic Report <span style={{ color: "rgba(234,120,30,0.8)" }}>*</span>
        </p>
        <label
          htmlFor="report-upload"
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
            padding: "20px 16px",
            border: academicReportFile.length > 0 ? "1.5px solid rgba(34,34,34,0.15)" : "1.5px dashed rgba(136,136,136,0.25)",
            borderRadius: "14px", cursor: "pointer",
            background: academicReportFile.length > 0 ? "rgba(34,34,34,0.03)" : "rgba(187,187,187,0.07)",
            transition: "border-color 0.2s, background 0.2s", position: "relative",
          }}
          onMouseEnter={(e) => { if (!academicReportFile.length) { (e.currentTarget as HTMLLabelElement).style.borderColor = "rgba(136,136,136,0.6)"; (e.currentTarget as HTMLLabelElement).style.background = "rgba(136,136,136,0.05)"; } }}
          onMouseLeave={(e) => { if (!academicReportFile.length) { (e.currentTarget as HTMLLabelElement).style.borderColor = "rgba(136,136,136,0.25)"; (e.currentTarget as HTMLLabelElement).style.background = "rgba(187,187,187,0.07)"; } }}
        >
          {academicReportFile.length > 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(234,120,30,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <FileText size={18} color="rgba(234,120,30,0.85)" />
              </div>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <p style={{ margin: 0, fontSize: "12px", fontWeight: 600, color: "rgb(34,34,34)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{academicReportFile[0].name}</p>
                <p style={{ margin: "2px 0 0", fontSize: "11px", color: "rgba(34,34,34,0.4)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <CheckCircle size={11} color="rgba(34,34,34,0.4)" weight="fill" /> {formatBytes(academicReportFile[0].size)} · uploaded
                </p>
              </div>
              <button onClick={(e) => { e.preventDefault(); setAcademicReportFile([]); }} style={{ width: "22px", height: "22px", borderRadius: "50%", border: "none", background: "rgba(34,34,34,0.08)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, padding: 0 }} aria-label="Remove">
                <X size={10} color="rgb(34,34,34)" weight="bold" />
              </button>
            </div>
          ) : (
            <>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(136,136,136,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FileText size={18} color="rgba(136,136,136,0.8)" />
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "rgb(34,34,34)" }}>Upload Academic Report</p>
                <p style={{ margin: "3px 0 0", fontSize: "11px", color: "rgba(34,34,34,0.4)" }}>PDF · max 10 MB</p>
              </div>
            </>
          )}
          <input id="report-upload" type="file" accept=".pdf,.doc,.docx" onChange={(e) => { const f = e.target.files?.[0]; if (f) setAcademicReportFile([f]); }} onClick={(e) => { (e.currentTarget as HTMLInputElement).value = ""; }} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
        </label>
      </div>

      <FormField label="Resume / Portfolio Link (optional)">
        <TextInput placeholder="https://linkedin.com/in/your-name" value={resumeLink} onChange={(e) => setResumeLink(e.target.value)} />
      </FormField>

      {/* Errors */}
      {(setupError || resumeUrlError) && (
        <p style={{ margin: 0, fontSize: "12px", color: "rgba(180,40,40,0.8)", background: "rgba(180,40,40,0.06)", borderRadius: "8px", padding: "8px 10px" }}>
          {setupError || resumeUrlError}
        </p>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function StudentSetupPage() {
  const [currentStep, setCurrentStep] = useState(0);

  // We assign a random background during initialization
  const [randomAssignedBackground] = useState(() => {
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
    return backgroundPresets[Math.floor(Math.random() * backgroundPresets.length)].hex;
  });

  const { userId, isLoading: userDataLoading } = useUserData();
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // tRPC queries
  const getStudentDataOptions = trpc.setup.getStudentData.queryOptions({ userId: userId || "" });
  const { data: studentData, isLoading: isLoadingStudent, error: studentError } = useQuery(getStudentDataOptions);

  // DiceBear avatar grid
  const avatarsToShow = [
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

  // Mutations
  const markSetupCompletedMutation = useMutation({
    ...trpc.setup.markSetupCompleted.mutationOptions(),
    onSuccess: () => {
      setTimeout(() => { router.push("/dashboard/student"); }, 1000);
    },
    onError: (error) => {
      setSetupError(`Setup completion failed: ${error.message}`);
      setIsUploading(false);
    },
  });

  const updateProfileMutation = useMutation({
    ...trpc.setup.updateProfile.mutationOptions(),
    onSuccess: () => { markSetupCompletedMutation.mutate(); },
    onError: (error) => {
      setSetupError(`Profile update failed: ${error.message}`);
      setIsUploading(false);
    },
  });

  // Image compression
  async function compressImage(file: File): Promise<File> {
    if (!file) return file;
    try {
      return await (await import("browser-image-compression")).default(file, { maxSizeMB: 2, maxWidthOrHeight: 1920, useWebWorker: true });
    } catch { return file; }
  }

  const processSetupData = useCallback(async (updateData: any) => {
    if (academicReportFile.length > 0) {
      const file = academicReportFile[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        updateData.academic_report = reader.result as string;
        updateData.academic_report_name = file.name;
        if (resumeLink.trim()) updateData.resume_link = resumeLink.trim();
        updateProfileMutation.mutate(updateData);
      };
      reader.readAsDataURL(file);
    } else {
      if (resumeLink.trim()) updateData.resume_link = resumeLink.trim();
      updateProfileMutation.mutate(updateData);
    }
  }, [academicReportFile, resumeLink, updateProfileMutation]);

  const handleContinue = async () => {
    setSetupError(null);
    setResumeUrlError(null);

    if (currentStep === 3) {
      if (academicReportFile.length === 0) { setSetupError("Academic report is required to complete setup."); return; }
      if (resumeLink.trim()) {
        const v = urlSchema.safeParse(resumeLink.trim());
        if (!v.success) { setResumeUrlError(v.error.errors[0].message); return; }
      }
    }

    if (currentStep < 3) {
      setCurrentStep((p) => p + 1);
    } else {
      setIsUploading(true);
      const updateData: any = {
        profile_background: randomAssignedBackground
      };
      if (selectedAvatarPath) updateData.avatar_path = selectedAvatarPath;
      if (uploadedAvatarFile.length > 0) {
        const file = await compressImage(uploadedAvatarFile[0]);
        const reader = new FileReader();
        reader.onloadend = () => { updateData.avatar = reader.result as string; processSetupData(updateData); };
        reader.readAsDataURL(file);
      } else {
        processSetupData(updateData);
      }
    }
  };

  const handleBack = () => { if (currentStep > 0) setCurrentStep((p) => p - 1); };

  // ── Loading / Error guards ────────────────────────────────────────────────
  if (userDataLoading || isLoadingStudent || !studentData) return <LoadingScreen />;
  if (studentError) return <ErrorScreen message={`Error loading profile: ${studentError.message}`} onRetry={() => window.location.reload()} />;

  // ── Render ────────────────────────────────────────────────────────────────
  const stepContent = [
    <div key="welcome" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0 8px" }}>
      <AnimatedGreeting firstName={studentData.first_name} lastName={studentData.last_name} />
    </div>,
    <StepOverview key="overview" />,
    <StepProfilePicture
      key="profile"
      avatarsToShow={avatarsToShow as any}
      isLoadingAvatars={isLoadingAvatars}
      fallbackInitial={studentData.first_name?.charAt(0) || "U"}
      selectedAvatar={selectedAvatar}
      setSelectedAvatar={setSelectedAvatar}
      selectedAvatarPath={selectedAvatarPath}
      setSelectedAvatarPath={setSelectedAvatarPath}
      uploadedAvatarFile={uploadedAvatarFile}
      setUploadedAvatarFile={setUploadedAvatarFile}
    />,
    <StepDocuments
      key="docs"
      academicReportFile={academicReportFile}
      setAcademicReportFile={setAcademicReportFile}
      resumeLink={resumeLink}
      setResumeLink={setResumeLink}
      setupError={setupError}
      resumeUrlError={resumeUrlError}
    />,
  ];

  return (
    <div style={{ minHeight: "100vh", fontFamily: '"Inter", "Inter Placeholder", sans-serif', position: "relative" }}>
      {/* Background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
        <Grainient color1="#F0B07A" color2="#F87171" color3="#FEF3C7" timeSpeed={0.18} warpStrength={0.7} warpFrequency={4.0} grainAmount={0.05} contrast={1.15} saturation={0.95} blendSoftness={0.15} />
      </div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "48px 16px" }}>
        {/* Card */}
        <div style={{
          background: "rgba(255,255,255,0.88)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
          borderRadius: "28px", width: "100%", maxWidth: "420px", padding: "28px 28px 24px",
          display: "flex", flexDirection: "column", gap: "20px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
          border: "1px solid rgba(255,255,255,0.7)",
        }}>
          {/* Title + dots */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <span style={{ fontSize: "26px", fontWeight: 500, color: "rgb(5,5,5)" }}>{STEPS[currentStep]}</span>
            <StepDots current={currentStep} total={STEPS.length} />
          </div>

          {/* Step content */}
          <div>{stepContent[currentStep]}</div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: "10px", height: "40px" }}>
            {currentStep > 0 && (
              <div style={{ flex: 1, height: "40px" }}>
                <SecondaryButton onClick={handleBack} disabled={isUploading}>Back</SecondaryButton>
              </div>
            )}
            <div style={{ flex: currentStep === 0 ? "unset" : 1, width: currentStep === 0 ? "100%" : undefined, height: "40px" }}>
              {currentStep < STEPS.length - 1 ? (
                <PrimaryButton onClick={handleContinue} disabled={isUploading}>
                  {currentStep === 0 ? "Get Started →" : "Continue"}
                </PrimaryButton>
              ) : (
                <PrimaryButton onClick={handleContinue} disabled={isUploading}>
                  {isUploading ? "Finishing..." : "Finish Setup"}
                </PrimaryButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
