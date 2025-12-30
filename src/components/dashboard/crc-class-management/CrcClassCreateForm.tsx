"use client";

import { useState } from "react";
import { Button } from "../../../../zenith/src/components/ui/button";
import { Input } from "../../../../zenith/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../zenith/src/components/ui/select";
import { Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { showToastSuccess, showToastError } from "@/components/toasts";

interface CrcClassCreateFormProps {
  onClassCreated?: () => void;
}

export function CrcClassCreateForm({ onClassCreated }: CrcClassCreateFormProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [gradeGroup, setGradeGroup] = useState<string>("");

  const createClassMutation = useMutation({
    ...trpc.crcClassManagement.createCrcClass.mutationOptions(),
    onSuccess: () => {
      setName("");
      setGradeGroup("");
      queryClient.invalidateQueries({ queryKey: [['crcClassManagement', 'getCrcClasses']] });
      showToastSuccess({
        headerText: 'Class created successfully',
        paragraphText: 'The class has been saved in the system.',
        direction: 'right'
      });
      onClassCreated?.();
    },
    onError: (error) => {
      showToastError({
        headerText: 'Class Creation Failed',
        paragraphText: error.message || 'Failed to create class. Please try again.',
        direction: 'right'
      });
    },
  });

  const handleCreate = () => {
    if (!name.trim()) return;
    
    createClassMutation.mutate({
      name: name.trim(),
      grade_group: gradeGroup || null,
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
            className="h-10"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCreate();
              }
            }}
          />
        </div>
        <div className="flex-1">
          <label className="text-sm text-neutral-800 block mb-1">Grade Group</label>
          <Select value={gradeGroup} onValueChange={setGradeGroup}>
            <SelectTrigger className="h-10 text-neutral-800">
              <SelectValue placeholder="Select grade group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Enrichment_Year">Enrichment Year</SelectItem>
              <SelectItem value="Senior_4">Senior 4</SelectItem>
              <SelectItem value="Senior_5">Senior 5</SelectItem>
              <SelectItem value="Senior_6">Senior 6</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <button
          onClick={handleCreate}
          disabled={!name.trim() || createClassMutation.isPending}
          className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
            !name.trim()
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : createClassMutation.isPending
              ? 'bg-emerald-100 text-emerald-700 cursor-not-allowed'
              : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 cursor-pointer'
          }`}
        >
          {createClassMutation.isPending ? (
            <div className="animate-spin h-5 w-5 border-2 border-emerald-600 border-t-transparent rounded-full"></div>
          ) : (
            <Plus className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}

