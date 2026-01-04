"use client";

import { BookOpen } from "lucide-react";

export function WorkshopsHeader() {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3">
   
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-cal-sans">
            Workshops Management
          </h1>
          <p className="text-sm text-gray-600">
            Create and manage workshops, presentations, and assignments for CRC classes.
          </p>
        </div>
      </div>
    </div>
  );
}
