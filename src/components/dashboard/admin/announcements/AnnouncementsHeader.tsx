"use client";

import { Bell } from "lucide-react";

export function AnnouncementsHeader() {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-cal-sans">
            Announcements
          </h1>
          <p className="text-sm text-gray-600">
            Manage announcements and notifications across the platform.
          </p>
        </div>
      </div>
    </div>
  );
}
