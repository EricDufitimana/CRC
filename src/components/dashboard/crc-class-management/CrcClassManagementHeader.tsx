"use client";

import { Input } from "../../../../zenith/src/components/ui/input";

interface CrcClassManagementHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function CrcClassManagementHeader({ searchQuery, onSearchChange }: CrcClassManagementHeaderProps) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold font-cal-sans text-gray-900 mb-0.5">
          CRC Classes
        </h1>
        <p className="text-gray-600 text-sm">
          Manage CRC class groups and student assignments
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Input 
          placeholder="Search classes..." 
          value={searchQuery} 
          onChange={(e) => onSearchChange(e.target.value)} 
          className="w-72" 
        />
      </div>
    </div>
  );
}

