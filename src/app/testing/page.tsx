"use client";

import React, { useState } from "react";
import { PrimaryButton, SecondaryButton } from "@/components/setup/Button";
import { FormField, TextInput } from "@/components/setup/FormFields";
import { StepDots } from "@/components/setup/StepDots";
import Grainient from "@/components/setup/Grainient";
import { AnimatedText } from "@/components/animation/AnimatedText";
import { Camera, FileText, Link, X, CheckCircle } from "@phosphor-icons/react";

// ─── Setup steps (matching actual setup flow) ─────────────────────────────────
const STEPS = ["Welcome", "Overview", "Profile Picture", "Documents"];

const SETUP_OVERVIEW = [
  { icon: Camera, title: "Choose Profile Picture", description: "Pick an avatar or upload your own photo" },
  { icon: FileText, title: "Upload Academic Report", description: "Upload your latest academic report card" },
  { icon: Link, title: "Add Resume Link", description: "Share a link to your resume or portfolio" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Card content per step ────────────────────────────────────────────────────

function AnimatedGreeting() {
  return (
    <>
      <style>{`
        @keyframes ag-emoji {
          0%   { transform: scale(0) rotate(-20deg); opacity: 0; }
          65%  { transform: scale(1.15) rotate(6deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes ag-name {
          0%   { opacity: 0; transform: translateY(10px); filter: blur(8px); }
          100% { opacity: 1; transform: translateY(0);    filter: blur(0); }
        }
        @keyframes ag-subtitle {
          0%   { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
        <div style={{ fontSize: "54px", lineHeight: 1, animation: "ag-emoji 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.3s both" }}>
          👋
        </div>
        <h2 style={{
          margin: 0, fontSize: "22px", fontWeight: 600, color: "rgb(5,5,5)",
          whiteSpace: "nowrap", animation: "ag-name 1.4s cubic-bezier(0.16,1,0.3,1) 1.2s both",
        }}>
          Hi, Eric Dufitimana!
        </h2>
        <p style={{
          margin: 0, fontSize: "14px", color: "rgba(34,34,34,0.5)",
          textAlign: "center", maxWidth: "290px",
          animation: "ag-subtitle 0.9s ease 2.8s both",
        }}>
          Welcome to the CRC Platform! Let&apos;s get your profile set up in just a few steps.
        </p>
      </div>
    </>
  );
}

function StepWelcome() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0 8px" }}>
      <AnimatedGreeting />
    </div>
  );
}

function StepOverview() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <p style={{ margin: 0, fontSize: "13px", color: "rgba(34,34,34,0.5)", textAlign: "center" }}>
        Here&apos;s what we&apos;ll do together:
      </p>
      {SETUP_OVERVIEW.map((step, i) => {
        const Icon = step.icon;
        return (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: "14px",
            padding: "12px 14px", borderRadius: "12px",
            background: "rgba(187,187,187,0.12)", border: "1px solid rgba(136,136,136,0.12)",
          }}>
            <div style={{
              width: "34px", height: "34px", borderRadius: "50%",
              background: "rgba(34,34,34,0.07)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Icon size={16} color="rgb(34,34,34)" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "rgb(34,34,34)" }}>{step.title}</p>
              <p style={{ margin: "2px 0 0", fontSize: "11px", color: "rgba(34,34,34,0.45)" }}>{step.description}</p>
            </div>
            <div style={{
              width: "22px", height: "22px", borderRadius: "50%",
              background: "rgba(34,34,34,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "11px", fontWeight: 600, color: "rgba(34,34,34,0.4)", flexShrink: 0,
            }}>
              {i + 1}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StepProfilePicture() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number; url: string } | null>(null);

  const avatars = [
    "https://api.dicebear.com/8.x/adventurer/svg?seed=Eric",
    "https://api.dicebear.com/8.x/adventurer/svg?seed=Kigali",
    "https://api.dicebear.com/8.x/adventurer/svg?seed=CRC",
    "https://api.dicebear.com/8.x/adventurer/svg?seed=ASYV",
    "https://api.dicebear.com/8.x/adventurer/svg?seed=Jordan",
    "https://api.dicebear.com/8.x/adventurer/svg?seed=Morgan",
    "https://api.dicebear.com/8.x/adventurer/svg?seed=Taylor",
    "https://api.dicebear.com/8.x/adventurer/svg?seed=Riley",
    "https://api.dicebear.com/8.x/adventurer/svg?seed=Sage",
    "https://api.dicebear.com/8.x/adventurer/svg?seed=Luna",
    "https://api.dicebear.com/8.x/adventurer/svg?seed=Phoenix",
    "https://api.dicebear.com/8.x/adventurer/svg?seed=River",
  ];

  const previewSrc = uploadedFile ? uploadedFile.url : avatars[selectedIdx];

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile({ name: file.name, size: file.size, url: URL.createObjectURL(file) });
    setSelectedIdx(-1);
  }

  function clearUpload() {
    if (uploadedFile) URL.revokeObjectURL(uploadedFile.url);
    setUploadedFile(null);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Preview */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{
          width: "80px", height: "80px", borderRadius: "50%",
          overflow: "hidden", border: "3px solid rgba(34,34,34,0.12)",
          background: "rgba(187,187,187,0.2)", transition: "border-color 0.2s",
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewSrc} alt="Selected avatar" width={80} height={80} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      </div>

      {/* Grid */}
      <div>
        <p style={{ margin: "0 0 8px", fontSize: "12px", fontWeight: 500, color: "rgb(136,136,136)", textAlign: "center" }}>Choose Avatar</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
          {avatars.map((src, i) => (
            <button
              key={i}
              onClick={() => { setSelectedIdx(i); clearUpload(); }}
              style={{
                aspectRatio: "1", borderRadius: "10px", overflow: "hidden",
                border: i === selectedIdx ? "2px solid rgb(34,34,34)" : "2px solid transparent",
                cursor: "pointer", padding: 0, background: "rgba(187,187,187,0.2)",
                transform: i === selectedIdx ? "scale(1.06)" : "scale(1)",
                transition: "transform 0.15s ease, border-color 0.15s ease",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Avatar ${i + 1}`} width={64} height={64} style={{ width: "100%", height: "100%" }} />
            </button>
          ))}
        </div>
      </div>

      {/* Upload zone */}
      <label
        htmlFor="avatar-upload"
        style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
          padding: "18px 16px", border: "1.5px dashed rgba(136,136,136,0.25)",
          borderRadius: "14px", cursor: "pointer", background: "rgba(187,187,187,0.07)",
          transition: "border-color 0.2s, background 0.2s", position: "relative", overflow: "hidden",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLLabelElement).style.borderColor = "rgba(136,136,136,0.7)";
          (e.currentTarget as HTMLLabelElement).style.background = "rgba(136,136,136,0.05)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLLabelElement).style.borderColor = "rgba(136,136,136,0.25)";
          (e.currentTarget as HTMLLabelElement).style.background = "rgba(187,187,187,0.07)";
        }}
      >
        <div style={{
          width: "40px", height: "40px", borderRadius: "50%",
          background: "rgba(136,136,136,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Camera size={18} color="rgba(136,136,136,0.8)" />
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "rgb(34,34,34)" }}>Upload your own photo</p>
          <p style={{ margin: "3px 0 0", fontSize: "11px", color: "rgba(34,34,34,0.4)" }}>PNG or JPG · max 5 MB</p>
        </div>
        <input
          id="avatar-upload" type="file" accept="image/*"
          onChange={handleFileChange}
          onClick={(e) => { (e.currentTarget as HTMLInputElement).value = ""; }}
          style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
        />
      </label>

      {/* File info pill */}
      {uploadedFile && (
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          padding: "10px 12px", borderRadius: "12px",
          background: "rgba(34,34,34,0.04)", border: "1px solid rgba(34,34,34,0.08)",
          animation: "ag-subtitle 0.3s ease both",
        }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "8px",
            overflow: "hidden", flexShrink: 0, border: "1px solid rgba(34,34,34,0.1)",
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={uploadedFile.url} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <p style={{ margin: 0, fontSize: "12px", fontWeight: 600, color: "rgb(34,34,34)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {uploadedFile.name}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: "11px", color: "rgba(34,34,34,0.4)" }}>{formatBytes(uploadedFile.size)}</p>
          </div>
          <button
            onClick={(e) => { e.preventDefault(); clearUpload(); setSelectedIdx(0); }}
            style={{
              width: "22px", height: "22px", borderRadius: "50%",
              border: "none", background: "rgba(34,34,34,0.08)",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, padding: 0, transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(34,34,34,0.18)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(34,34,34,0.08)"; }}
            aria-label="Remove file"
          >
            <X size={10} color="rgb(34,34,34)" weight="bold" />
          </button>
        </div>
      )}
    </div>
  );
}

function StepDocuments() {
  const [reportFile, setReportFile] = useState<{ name: string; size: number } | null>(null);
  const [resumeLink, setResumeLink] = useState("");

  function handleReportChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setReportFile({ name: file.name, size: file.size });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {/* Academic report upload zone */}
      <div>
        <p style={{ margin: "0 0 8px", fontSize: "12px", fontWeight: 500, color: "rgb(136,136,136)" }}>
          Academic Report <span style={{ color: "rgba(234,120,30,0.8)" }}>*</span>
        </p>
        <label
          htmlFor="report-upload"
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
            padding: "20px 16px",
            border: reportFile ? "1.5px solid rgba(34,34,34,0.15)" : "1.5px dashed rgba(136,136,136,0.25)",
            borderRadius: "14px", cursor: "pointer",
            background: reportFile ? "rgba(34,34,34,0.03)" : "rgba(187,187,187,0.07)",
            transition: "border-color 0.2s, background 0.2s", position: "relative",
          }}
          onMouseEnter={(e) => {
            if (!reportFile) {
              (e.currentTarget as HTMLLabelElement).style.borderColor = "rgba(136,136,136,0.6)";
              (e.currentTarget as HTMLLabelElement).style.background = "rgba(136,136,136,0.05)";
            }
          }}
          onMouseLeave={(e) => {
            if (!reportFile) {
              (e.currentTarget as HTMLLabelElement).style.borderColor = "rgba(136,136,136,0.25)";
              (e.currentTarget as HTMLLabelElement).style.background = "rgba(187,187,187,0.07)";
            }
          }}
        >
          {reportFile ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "8px",
                background: "rgba(234,120,30,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <FileText size={18} color="rgba(234,120,30,0.85)" />
              </div>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <p style={{ margin: 0, fontSize: "12px", fontWeight: 600, color: "rgb(34,34,34)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {reportFile.name}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: "11px", color: "rgba(34,34,34,0.4)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <CheckCircle size={11} color="rgba(34,34,34,0.4)" weight="fill" />
                  {formatBytes(reportFile.size)} · uploaded
                </p>
              </div>
              <button
                onClick={(e) => { e.preventDefault(); setReportFile(null); }}
                style={{
                  width: "22px", height: "22px", borderRadius: "50%",
                  border: "none", background: "rgba(34,34,34,0.08)",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, padding: 0, transition: "background 0.15s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(34,34,34,0.18)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(34,34,34,0.08)"; }}
                aria-label="Remove file"
              >
                <X size={10} color="rgb(34,34,34)" weight="bold" />
              </button>
            </div>
          ) : (
            <>
              <div style={{
                width: "40px", height: "40px", borderRadius: "50%",
                background: "rgba(136,136,136,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <FileText size={18} color="rgba(136,136,136,0.8)" />
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "rgb(34,34,34)" }}>Upload Academic Report</p>
                <p style={{ margin: "3px 0 0", fontSize: "11px", color: "rgba(34,34,34,0.4)" }}>PDF · max 10 MB</p>
              </div>
            </>
          )}
          <input
            id="report-upload" type="file" accept=".pdf,.doc,.docx"
            onChange={handleReportChange}
            onClick={(e) => { (e.currentTarget as HTMLInputElement).value = ""; }}
            style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
          />
        </label>
      </div>

      {/* Resume link */}
      <FormField label="Resume / Portfolio Link (optional)">
        <TextInput
          placeholder="https://linkedin.com/in/your-name"
          value={resumeLink}
          onChange={(e) => setResumeLink(e.target.value)}
        />
      </FormField>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const STEP_TITLES = ["Welcome", "Overview", "Profile Picture", "Documents"];

export default function TestingPage() {
  const [step, setStep] = useState(0);

  const stepContent = [
    <StepWelcome key="welcome" />,
    <StepOverview key="overview" />,
    <StepProfilePicture key="profile" />,
    <StepDocuments key="docs" />,
  ];

  return (
    <div style={{ minHeight: "100vh", fontFamily: '"Inter", "Inter Placeholder", sans-serif', position: "relative" }}>
      {/* ── Grainient background ── */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
        <Grainient
          color1="#F0B07A"
          color2="#F87171"
          color3="#FEF3C7"
          timeSpeed={0.18}
          warpStrength={0.7}
          warpFrequency={4.0}
          grainAmount={0.05}
          contrast={1.15}
          saturation={0.95}
          blendSoftness={0.15}
        />
      </div>

      {/* ── Content ── */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "48px 16px" }}>
        {/* ── Card ── */}
        <div style={{
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderRadius: "28px",
          width: "100%",
          maxWidth: "420px",
          padding: "28px 28px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
          border: "1px solid rgba(255,255,255,0.7)",
        }}>
          {/* Step title + dots */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <span style={{ fontSize: "26px", fontWeight: 500, color: "rgb(5,5,5)" }}>
              {STEP_TITLES[step]}
            </span>
            <StepDots current={step} total={STEPS.length} />
          </div>

          {/* Step content */}
          <div>{stepContent[step]}</div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: "10px", height: "40px" }}>
            {step > 0 && (
              <div style={{ flex: 1, height: "40px" }}>
                <SecondaryButton onClick={() => setStep((s) => s - 1)}>Back</SecondaryButton>
              </div>
            )}
            <div style={{ flex: step === 0 ? "unset" : 1, width: step === 0 ? "100%" : undefined, height: "40px" }}>
              {step < STEPS.length - 1 ? (
                <PrimaryButton onClick={() => setStep((s) => s + 1)}>
                  {step === 0 ? "Get Started →" : "Continue"}
                </PrimaryButton>
              ) : (
                <PrimaryButton>Finish Setup</PrimaryButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
