"use client";

import { useEffect, useRef } from "react";
import { StudentStats } from "./StudentStats";
import { StudentQuickActions } from "./StudentQuickActions";
import { RecentAssignments } from "./RecentAssignments";
import { StudentAnnouncements } from "./StudentAnnouncements";
import { RecentResources } from "./RecentResources";
import { useUserData } from "@/hooks/useUserData";
import useFollowEyes from "@/components/other/useFollowEyes";

export function StudentDashboardContent() {
  const { user } = useUserData();

  // Initialize the follow eyes effect
  useFollowEyes();

  // Refs for eye following effect
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const eyesRef = useRef<(HTMLImageElement | null)[]>([]);

  // Eye following effect
  useEffect(() => {
    function angle(cx: number, cy: number, ex: number, ey: number) {
      const dy = ey - cy;
      const dx = ex - cx;
      const rad = Math.atan2(dy, dx);
      return (rad * 180) / Math.PI;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!anchorRef.current || eyesRef.current.length === 0) return;

      const rekt = anchorRef.current.getBoundingClientRect();
      const anchorX = rekt.left + rekt.width / 2;
      const anchorY = rekt.top + rekt.height / 2;

      const angleDeg = angle(e.clientX, e.clientY, anchorX, anchorY);

      eyesRef.current.forEach((eye) => {
        if (eye) {
          eye.style.transform = `rotate(${90 + angleDeg}deg)`;
        }
      });
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="space-y-6 h-short:space-y-3 h-full flex flex-col overflow-hidden">
      {/* Greeting */}
      <h2 className="text-2xl font-semibold font-cal-sans flex-shrink-0">Dashboard</h2>

      {/* Top stats */}
      <StudentStats />

      {/* Main grid */}
      <div className="grid flex-1 gap-6 h-short:gap-3 lg:grid-cols-3 overflow-hidden min-h-0">
        <div className="lg:col-span-2 grid grid-rows-[auto_1fr] gap-6 h-short:gap-3 overflow-hidden min-h-0">
          {/* Quick Links Grid */}
          <StudentQuickActions />

          {/* New assignments */}
          <RecentAssignments />
        </div>

        {/* Right rail */}
        <div className="grid gap-6 h-short:gap-3 grid-rows-2 overflow-hidden min-h-0">
          {/* Notifications */}
          <StudentAnnouncements />

          {/* New content added */}
          <RecentResources />
        </div>
      </div>
    </div>
  );
}
