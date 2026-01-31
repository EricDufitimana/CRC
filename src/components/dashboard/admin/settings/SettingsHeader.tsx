"use client";

import { Settings } from "lucide-react";

export function SettingsHeader() {
  return (
    <div className="flex flex-col gap-1 mb-8">
      <div className="flex items-center gap-3">
 
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-cal-sans">
            Settings
          </h1>
          <p className="text-sm text-gray-600">
            Manage your profile, scheduling integration, and preferences.
          </p>
        </div>
      </div>
    </div>
  );
}
