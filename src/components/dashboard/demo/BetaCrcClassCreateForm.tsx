"use client";

import { useState } from "react";
import { Button } from "@/zenith/components/ui/button";
import { Input } from "@/zenith/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/zenith/components/ui/select";
import { Plus } from "lucide-react";
import { showToastError } from "@/components/toasts";

interface BetaCrcClassCreateFormProps {
  onClassCreated?: () => void;
}

type GradeGroup = 'Enrichment_Year' | 'Senior_4' | 'Senior_5' | 'Senior_6';

export function BetaCrcClassCreateForm({ onClassCreated }: BetaCrcClassCreateFormProps) {
  const [name, setName] = useState("");
  const [gradeGroup, setGradeGroup] = useState<GradeGroup | "">("");

  const handleGradeGroupChange = (value: string) => {
    if (value === "" || value === "Enrichment_Year" || value === "Senior_4" || value === "Senior_5" || value === "Senior_6") {
      setGradeGroup(value as GradeGroup | "");
    }
  };

  const handleCreate = () => {
    if (!name.trim()) {
      showToastError({
        headerText: 'Class Name Required',
        paragraphText: 'Please enter a class name.',
        direction: 'right'
      });
      return;
    }

    if (!gradeGroup) {
      showToastError({
        headerText: 'Grade Group Required',
        paragraphText: 'Please select a grade group before creating the class.',
        direction: 'right'
      });
      return;
    }

    showToastError({
      headerText: "Demo Action",
      paragraphText: "Class creation is disabled in the demo dashboard.",
      direction: "right"
    });
  };

  return (
    <div className="rounded-2xl border bg-gradient-to-br from-white to-neutral-50 p-5">
      <div className="flex items-end gap-3">
        <div className="flex-[3]">
          <label className="text-sm text-neutral-800 block mb-1">Class Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. S4 MPC + S4 MEG"
            className="h-10 rounded-xl"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCreate();
              }
            }}
          />
        </div>
        <div className="flex-1">
          <label className="text-sm text-neutral-800 block mb-1">Grade Group</label>
          <Select value={gradeGroup} onValueChange={handleGradeGroupChange}>
            <SelectTrigger className="h-10 text-neutral-800 rounded-xl">
              <SelectValue placeholder="Select grade group" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="Enrichment_Year">Enrichment Year</SelectItem>
              <SelectItem value="Senior_4">Senior 4</SelectItem>
              <SelectItem value="Senior_5">Senior 5</SelectItem>
              <SelectItem value="Senior_6">Senior 6</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <button
          onClick={handleCreate}
          disabled={!name.trim() || !gradeGroup}
          className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-200 ${!name.trim() || !gradeGroup
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 cursor-pointer'
            }`}
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
